import crypto from 'node:crypto';
import { UserModel, SafeUser } from '../users/users.model.js';
import { SessionModel } from './session.model.js';
import { InvitationModel } from '../memberships/invitations.model.js';
import { StoreMembershipModel } from '../memberships/memberships.model.js';
import { hashPassword, verifyPassword } from './password.service.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
import { RegisterDTO, LoginSessionContext } from './auth.types.js';

export const authService = {
  async register(data: RegisterDTO, ctx: LoginSessionContext = {}) {
    const email = data.email.trim().toLowerCase();
    const name = (data.name || [data.firstName, data.lastName].filter(Boolean).join(' ')).trim() || 'User';

    const existing = await UserModel.findOne({ email });
    if (existing) {
      throw new AppError('An account with this email already exists', 409, ERROR_CODES.CONFLICT);
    }

    const passwordHash = await hashPassword(data.password);
    const user = await UserModel.create({
      name,
      email,
      passwordHash
    });

    // Auto-accept any valid pending store invitations for this email
    const pendingInvitations = await InvitationModel.find({
      email,
      expiresAt: { $gt: new Date() }
    });
    for (const inv of pendingInvitations) {
      await StoreMembershipModel.create({
        storeId: inv.storeId,
        userId: user._id,
        role: inv.role as any,
        status: 'active'
      });
      await inv.deleteOne();
    }

    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await SessionModel.create({
      sessionId,
      userId: user._id,
      userAgent: ctx.userAgent,
      ipAddress: ctx.ipAddress,
      expiresAt
    });

    return {
      user: user.toSafeObject(),
      sessionId
    };
  },

  async login(emailInput: string, passwordInput: string, ctx: LoginSessionContext = {}) {
    const email = emailInput.trim().toLowerCase();

    // Select passwordHash explicitly as it is select: false in schema
    const user = await UserModel.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new AppError('Invalid email or password', 401, ERROR_CODES.INVALID_CREDENTIALS);
    }

    const isValid = await verifyPassword(passwordInput, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401, ERROR_CODES.INVALID_CREDENTIALS);
    }

    // Securely regenerate session identifier on every successful login
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await SessionModel.create({
      sessionId,
      userId: user._id,
      userAgent: ctx.userAgent,
      ipAddress: ctx.ipAddress,
      expiresAt
    });

    return {
      user: user.toSafeObject(),
      sessionId
    };
  },

  async logout(sessionId: string) {
    if (sessionId) {
      await SessionModel.deleteOne({ sessionId });
    }
  },

  async getSessionUser(sessionId: string): Promise<SafeUser | null> {
    const session = await SessionModel.findOne({
      sessionId,
      expiresAt: { $gt: new Date() }
    });

    if (!session) return null;

    const user = await UserModel.findById(session.userId);
    return user ? user.toSafeObject() : null;
  }
};
