import mongoose from 'mongoose';
import crypto from 'crypto';
import { StoreMembershipModel } from './memberships.model.js';
import { InvitationModel } from './invitations.model.js';
import { UserModel } from '../users/users.model.js';
import { StoreModel } from '../stores/stores.model.js';
import { emailService } from '../email/email.service.js';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
import { auditService } from '../audit/audit.service.js';

export const membershipsService = {
  async listMembers(storeId: string) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    let memberships = await StoreMembershipModel.find({ storeId: storeObjId, status: 'active' }).populate('userId', 'email name avatarUrl');

    // Ensure the store owner is guaranteed to appear in the team members list
    const store = await StoreModel.findById(storeObjId);
    if (store && store.createdBy) {
      const hasOwner = memberships.some((m: any) => m.role === 'owner');
      if (!hasOwner) {
        const ownerUser = await UserModel.findById(store.createdBy);
        if (ownerUser) {
          const ownerMembership = await StoreMembershipModel.findOneAndUpdate(
            { storeId: storeObjId, userId: store.createdBy },
            { role: 'owner', status: 'active' },
            { upsert: true, new: true }
          ).populate('userId', 'email name avatarUrl');
          memberships.unshift(ownerMembership);
        }
      }
    }

    const pendingInvitations = await InvitationModel.find({ storeId: storeObjId, expiresAt: { $gt: new Date() } });

    const activeList = memberships.map((m: any) => ({
      id: m._id.toString(),
      role: m.role,
      status: m.status,
      permissions: m.permissions || [],
      userId: m.userId ? {
        id: m.userId._id.toString(),
        name: m.userId.name,
        email: m.userId.email
      } : null
    }));

    const invitedList = pendingInvitations.map((inv: any) => ({
      id: inv._id.toString(),
      role: inv.role,
      status: 'invited',
      permissions: inv.permissions || [],
      invitationToken: inv.token,
      expiresAt: inv.expiresAt,
      userId: {
        id: '',
        name: inv.email.split('@')[0],
        email: inv.email
      }
    }));

    return [...activeList, ...invitedList];
  },

  async createInvitation(storeId: string, data: { email: string; role?: string; permissions?: string[] }, actorId?: string) {
    if (!data.email || typeof data.email !== 'string') {
      throw new AppError('Valid email address is required', 400, ERROR_CODES.VALIDATION_ERROR);
    }
    const email = data.email.trim().toLowerCase();
    const requestedRole = (data.role || 'staff').toLowerCase();

    if (requestedRole === 'owner') {
      throw new AppError('Cannot invite users as owner. Only staff roles (admin, staff) are permitted.', 400, ERROR_CODES.FORBIDDEN);
    }

    const storeObjId = new mongoose.Types.ObjectId(storeId);

    // 1. If user is already registered in the system, add directly
    const user = await UserModel.findOne({ email });
    if (user) {
      const existingMembership = await StoreMembershipModel.findOne({
        storeId: storeObjId,
        userId: user._id
      });

      if (existingMembership) {
        throw new AppError(`User '${email}' is already a member of this store`, 409, ERROR_CODES.CONFLICT);
      }

      const membership = await StoreMembershipModel.create({
        storeId: storeObjId,
        userId: user._id,
        role: requestedRole as any,
        status: 'active'
      });

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
        message: `Added ${user.name} (${user.email}) as staff to the store.`,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email
        }
      };
    }

    // 2. Unregistered user: create secure invitation
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
      permissions: data.permissions || [],
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    if (actorId) {
      await auditService.record(storeId, actorId, 'STAFF_INVITED', {
        email,
        role: requestedRole
      });
    }

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
      console.warn(`[MEMBERSHIPS] Email delivery notice: ${err.message}`);
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

  async acceptInvitation(token: string, userId: string) {
    const inv = await InvitationModel.findOne({ token, expiresAt: { $gt: new Date() } });
    if (!inv) {
      throw new AppError('Invitation is invalid or has expired', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const existingMembership = await StoreMembershipModel.findOne({ storeId: inv.storeId, userId });
    if (existingMembership) {
      existingMembership.status = 'active';
      existingMembership.role = inv.role as any;
      await existingMembership.save();
    } else {
      await StoreMembershipModel.create({
        storeId: inv.storeId,
        userId,
        role: inv.role as any,
        status: 'active'
      });
    }

    await inv.deleteOne();

    await auditService.record(inv.storeId.toString(), userId, 'INVITATION_ACCEPTED', {
      role: inv.role
    });

    return { success: true, storeId: inv.storeId };
  },

  async remove(storeId: string, membershipId: string, actorId?: string) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    let targetObjId: any;
    try {
      targetObjId = new mongoose.Types.ObjectId(membershipId);
    } catch {
      targetObjId = membershipId;
    }

    const membership = await StoreMembershipModel.findOne({ _id: targetObjId, storeId: storeObjId });
    if (membership) {
      if (membership.role === 'owner') {
        throw new AppError('Store Owner cannot be removed', 400, ERROR_CODES.FORBIDDEN);
      }
      await membership.deleteOne();

      if (actorId) {
        await auditService.record(storeId, actorId, 'STAFF_REMOVED', {
          removedUserId: membership.userId
        });
      }
      return;
    }

    const invitation = await InvitationModel.findOne({ _id: targetObjId, storeId: storeObjId });
    if (invitation) {
      await invitation.deleteOne();
      if (actorId) {
        await auditService.record(storeId, actorId, 'INVITATION_CANCELLED', {
          email: invitation.email
        });
      }
      return;
    }

    throw new AppError('Membership or invitation not found', 404, ERROR_CODES.NOT_FOUND);
  },

  async updatePermissions(storeId: string, membershipId: string, permissions: string[], actorId?: string) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    let targetObjId: any;
    try {
      targetObjId = new mongoose.Types.ObjectId(membershipId);
    } catch {
      targetObjId = membershipId;
    }

    const membership = await StoreMembershipModel.findOne({ _id: targetObjId, storeId: storeObjId });
    if (!membership) {
      throw new AppError('Membership not found', 404, ERROR_CODES.NOT_FOUND);
    }

    if (membership.role === 'owner') {
      throw new AppError('Store Owner permissions cannot be modified', 400, ERROR_CODES.FORBIDDEN);
    }

    membership.permissions = Array.isArray(permissions) ? permissions : [];
    await membership.save();

    if (actorId) {
      await auditService.record(storeId, actorId, 'STAFF_PERMISSIONS_UPDATED', {
        targetUserId: membership.userId,
        permissions: membership.permissions
      });
    }

    return {
      id: membership._id.toString(),
      role: membership.role,
      permissions: membership.permissions,
      status: membership.status
    };
  }
};
