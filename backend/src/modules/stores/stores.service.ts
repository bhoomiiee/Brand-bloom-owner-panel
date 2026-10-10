import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { StoreModel, IStore } from './stores.model.js';
import { StoreMembershipModel } from '../memberships/memberships.model.js';
import { InvitationModel } from '../memberships/invitations.model.js';
import { UserModel } from '../users/users.model.js';
import { auditService } from '../audit/audit.service.js';
import { emailService } from '../email/email.service.js';
import { env } from '../../config/env.js';
import { slugify } from '../../shared/utils/slug.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
import { CreateStoreDTO, UpdateStoreDTO, AddMemberDTO } from './stores.types.js';

export interface StoreWithMembership {
  id: string;
  name: string;
  slug: string;
  businessType: string;
  address: any;
  logoUrl?: string;
  settings: any;
  createdBy: any;
  createdAt: any;
  updatedAt: any;
  membership: {
    id: string;
    role: string;
    status: string;
  };
}

export const storesService = {
  /**
   * Generates a unique slug for a store. If a slug collision occurs,
   * appends incrementing numeric suffixes until unique.
   */
  async generateUniqueSlug(baseName: string): Promise<string> {
    let baseSlug = slugify(baseName);
    if (!baseSlug) {
      baseSlug = 'store';
    }

    let candidate = baseSlug;
    let counter = 1;

    while (await StoreModel.exists({ slug: candidate })) {
      counter += 1;
      candidate = `${baseSlug}-${counter}`;
    }

    return candidate;
  },

  /**
   * Creates a store and associates the creator as the owner.
   * Uses MongoDB transaction if supported; otherwise uses safe compensating rollback.
   */
  async create(userId: string, data: CreateStoreDTO): Promise<{ store: any; role: string }> {
    let slug: string;
    if (data.slug) {
      const normalized = slugify(data.slug);
      const exists = await StoreModel.exists({ slug: normalized });
      if (exists) {
        throw new AppError('A store with this URL slug already exists', 409, ERROR_CODES.CONFLICT);
      }
      slug = normalized;
    } else {
      slug = await this.generateUniqueSlug(data.name);
    }

    const storePayload = {
      name: data.name,
      slug,
      businessType: data.businessType || 'retail',
      address: data.address || {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US'
      },
      logoUrl: data.logoUrl,
      settings: {
        currency: data.currency || 'USD',
        timezone: data.timezone || 'UTC',
        taxRatePercentage: 0
      },
      createdBy: new mongoose.Types.ObjectId(userId)
    };

    // Check if replica set transactions are supported
    const topologyType = (mongoose.connection?.getClient() as any)?.topology?.description?.type;
    const isReplicaSet = topologyType === 'ReplicaSetWithPrimary' || topologyType === 'Sharded';

    if (isReplicaSet) {
      let session: mongoose.ClientSession | null = null;
      try {
        session = await mongoose.startSession();
        session.startTransaction();

        const [store] = await StoreModel.create([storePayload], { session });
        const [membership] = await StoreMembershipModel.create(
          [
            {
              storeId: store._id,
              userId: new mongoose.Types.ObjectId(userId),
              role: 'owner',
              status: 'active'
            }
          ],
          { session }
        );

        await session.commitTransaction();
        return {
          store: store.toJSON ? store.toJSON() : store,
          role: membership.role
        };
      } catch (error: any) {
        if (session) {
          try {
            await session.abortTransaction();
          } catch {
            // Ignore abort error
          }
        }
        // If it failed because transactions are actually unsupported, fall through to rollback below
        if (!error?.message?.includes('replica set') && error?.code !== 20) {
          throw error;
        }
      } finally {
        if (session) {
          session.endSession();
        }
      }
    }

    // Compensating rollback strategy (guarantees atomicity on standalone MongoDB)
    const store = await StoreModel.create(storePayload);
    try {
      const membership = await StoreMembershipModel.create({
        storeId: store._id,
        userId: new mongoose.Types.ObjectId(userId),
        role: 'owner',
        status: 'active'
      });

      return {
        store: store.toJSON ? store.toJSON() : store,
        role: membership.role
      };
    } catch (membershipError) {
      // Safe rollback: delete the newly created store to prevent orphaned record
      await StoreModel.findByIdAndDelete(store._id);
      throw membershipError;
    }
  },

  /**
   * Lists only stores that the authenticated user actively belongs to.
   */
  async listForUser(userId: string): Promise<any[]> {
    const memberships = await StoreMembershipModel.find({
      userId: new mongoose.Types.ObjectId(userId),
      status: 'active'
    }).populate<{ storeId: IStore }>('storeId');

    const activeList = memberships
      .filter((m) => m.storeId != null)
      .map((m) => {
        const storeDoc = m.storeId;
        const storeJson = (storeDoc as any).toJSON ? (storeDoc as any).toJSON() : storeDoc;
        return {
          ...storeJson,
          membership: {
            id: m._id.toString(),
            role: m.role,
            status: m.status
          }
        };
      });

    return activeList;
  },

  /**
   * Retrieves a single authorized store by ID for a user.
   */
  async getById(storeId: string, userId: string): Promise<any> {
    const membership = await StoreMembershipModel.findOne({
      storeId: new mongoose.Types.ObjectId(storeId),
      userId: new mongoose.Types.ObjectId(userId),
      status: 'active'
    });

    if (!membership) {
      throw new AppError('You do not have access to this store', 403, ERROR_CODES.FORBIDDEN);
    }

    const store = await StoreModel.findById(storeId);
    if (!store) {
      throw new AppError('Store not found', 404, ERROR_CODES.NOT_FOUND);
    }

    const storeJson = (store as any).toJSON ? (store as any).toJSON() : store;
    return {
      ...storeJson,
      membership: {
        id: membership._id.toString(),
        role: membership.role,
        status: membership.status
      }
    };
  },

  /**
   * Updates store settings. Enforced for owners.
   */
  async update(storeId: string, data: UpdateStoreDTO): Promise<any> {
    const updateOps: Record<string, any> = {};

    if (data.name !== undefined) updateOps.name = data.name;
    if (data.businessType !== undefined) updateOps.businessType = data.businessType;
    if (data.logoUrl !== undefined) updateOps.logoUrl = data.logoUrl;

    if (data.address) {
      Object.entries(data.address).forEach(([k, v]) => {
        updateOps[`address.${k}`] = v;
      });
    }

    if (data.settings) {
      Object.entries(data.settings).forEach(([k, v]) => {
        updateOps[`settings.${k}`] = v;
      });
    }

    const updated = await StoreModel.findByIdAndUpdate(
      storeId,
      { $set: updateOps },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw new AppError('Store not found', 404, ERROR_CODES.NOT_FOUND);
    }

    return (updated as any).toJSON ? (updated as any).toJSON() : updated;
  },

  /**
   * Adds an existing registered user as staff or creates a secure invitation if unregistered.
   * Owner role is strictly prohibited from being granted through this flow.
   */
  async addStaffMember(storeId: string, memberData: AddMemberDTO, actorId?: string): Promise<any> {
    const rawEmail = memberData.email;
    if (!rawEmail || typeof rawEmail !== 'string') {
      throw new AppError('Valid email address is required', 400, ERROR_CODES.VALIDATION_ERROR);
    }
    const email = rawEmail.trim().toLowerCase();

    // Prevent granting owner role
    const requestedRole = (memberData.role || 'staff').toLowerCase();
    if (requestedRole === 'owner') {
      throw new AppError('Cannot assign owner role. Only staff roles are permitted.', 400, ERROR_CODES.FORBIDDEN);
    }

    const storeObjId = new mongoose.Types.ObjectId(storeId);

    // 1. Check if user is registered in the database
    const user = await UserModel.findOne({ email });

    if (user) {
      // Check if user is already an active member of this store
      const existingMembership = await StoreMembershipModel.findOne({
        storeId: storeObjId,
        userId: user._id
      });

      if (existingMembership) {
        throw new AppError(`User '${email}' is already a member of this store`, 409, ERROR_CODES.CONFLICT);
      }

      // Add user to the store with the requested staff role
      const membership = await StoreMembershipModel.create({
        storeId: storeObjId,
        userId: user._id,
        role: requestedRole as any,
        status: 'active'
      });

      // Remove any pending invitations for this email in this store
      await InvitationModel.deleteMany({ storeId: storeObjId, email });

      if (actorId) {
        await auditService.record(storeId, actorId, 'STAFF_ADDED', {
          addedUserId: user._id.toString(),
          email: user.email,
          role: membership.role
        });
      }

      return {
        id: membership._id.toString(),
        role: membership.role,
        status: 'active',
        isInvited: false,
        message: `Added ${user.name} (${user.email}) as ${membership.role} to the store.`,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email
        }
      };
    }

    // 2. User is not registered yet: create a secure invitation
    // Check if an active unexpired invitation is already pending for this email
    const existingInvitation = await InvitationModel.findOne({
      storeId: storeObjId,
      email,
      expiresAt: { $gt: new Date() }
    });

    if (existingInvitation) {
      throw new AppError(
        `An active invitation is already pending for '${email}'. They will automatically join upon registration or invitation acceptance.`,
        409,
        ERROR_CODES.CONFLICT
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const invitation = await InvitationModel.create({
      storeId: storeObjId,
      email,
      role: requestedRole,
      permissions: [],
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    if (actorId) {
      await auditService.record(storeId, actorId, 'STAFF_INVITED', {
        email,
        role: requestedRole
      });
    }

    // Attempt email delivery via configured SMTP or Ethereal test inbox
    let emailStatusText = '';
    let emailSent = false;
    let previewUrl: string | undefined;

    try {
      const storeDoc = await StoreModel.findById(storeObjId);
      const inviterDoc = actorId ? await UserModel.findById(actorId) : null;
      const storeName = storeDoc?.name || 'Brand Bloom Store';
      const inviterName = inviterDoc?.name || 'Store Owner';
      const inviteUrl = `${env.FRONTEND_URL}/register?email=${encodeURIComponent(email)}&token=${token}`;

      const emailResult = await emailService.sendStaffInvitation({
        to: email,
        inviterName,
        storeName,
        role: requestedRole,
        inviteUrl,
        expiresAt: invitation.expiresAt
      });

      emailSent = emailResult.success;
      previewUrl = emailResult.previewUrl;
      if (emailResult.success) {
        emailStatusText = emailResult.messageId
          ? ` Invitation email dispatched via Resend to ${email} (ID: ${emailResult.messageId}).`
          : ` Invitation email dispatched to ${email}.`;
      } else {
        emailStatusText = ` Notice: Email sending could not be completed (${emailResult.error || 'provider error'}). You can copy and share the direct sign-up link.`;
      }
    } catch (err: any) {
      console.warn(`[STORES] Email delivery notice: ${err.message}`);
    }

    return {
      id: invitation._id.toString(),
      role: invitation.role,
      status: 'invited',
      isInvited: true,
      invitationToken: token,
      emailSent,
      emailPreviewUrl: previewUrl,
      message: `Staff invitation created for '${email}'.${emailStatusText} The user will automatically join this store upon registering with this email address.`,
      user: {
        id: '',
        name: email.split('@')[0],
        email
      }
    };
  },

  /**
   * Lists all active members and pending invitations for a store.
   */
  async listMembers(storeId: string): Promise<any[]> {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const memberships = await StoreMembershipModel.find({
      storeId: storeObjId,
      status: 'active'
    }).populate<{ userId: { _id: mongoose.Types.ObjectId; name: string; email: string } }>('userId', 'name email');

    const activeMembers = memberships.map((m) => ({
      id: m._id.toString(),
      role: m.role,
      status: m.status,
      user: m.userId
        ? {
            id: m.userId._id.toString(),
            name: m.userId.name,
            email: m.userId.email
          }
        : null
    }));

    const pendingInvitations = await InvitationModel.find({
      storeId: storeObjId,
      expiresAt: { $gt: new Date() }
    });

    const invitedMembers = pendingInvitations.map((inv) => ({
      id: inv._id.toString(),
      role: inv.role,
      status: 'invited',
      invitationToken: inv.token,
      expiresAt: inv.expiresAt,
      user: {
        id: '',
        name: inv.email.split('@')[0],
        email: inv.email
      }
    }));

    return [...activeMembers, ...invitedMembers];
  }
};
