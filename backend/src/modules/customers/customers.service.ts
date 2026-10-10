import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { CustomerModel, ICustomer, ICustomerAddress } from './customers.model.js';
import { ConsentLogModel } from './consent-log.model.js';
import { OrderModel } from '../orders/orders.model.js';
import { StoreModel } from '../stores/stores.model.js';
import { emailService } from '../email/email.service.js';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';

export interface CustomerAuthPayload {
  customerId: string;
  storeId: string;
  email: string;
  role: 'customer';
}

export function generateCustomerToken(customer: ICustomer, storeId: string): string {
  const payload: CustomerAuthPayload = {
    customerId: customer._id.toString(),
    storeId,
    email: customer.email,
    role: 'customer'
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '7d' });
}

export function sanitizeCustomer(customer: any) {
  const obj = customer.toObject ? customer.toObject() : (customer.toJSON ? customer.toJSON() : { ...customer });
  const idStr = (customer._id || obj._id || obj.id)?.toString();
  if (idStr) {
    obj.id = idStr;
    obj._id = idStr;
  }
  delete obj.passwordHash;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
}

export const customersService = {
  async register(storeId: string, data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    emailOptIn?: boolean;
    optInSource?: string;
    ipAddress?: string;
  }) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const email = data.email.trim().toLowerCase();

    // Check store exists
    const store = await StoreModel.findById(storeObjId);
    if (!store) {
      throw new AppError('Store not found', 404, ERROR_CODES.NOT_FOUND);
    }

    // Check existing customer
    const existing = await CustomerModel.findOne({ storeId: storeObjId, email });
    if (existing) {
      throw new AppError('An account with this email already exists for this store', 409, ERROR_CODES.CONFLICT);
    }

    if (!data.password || data.password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const emailOptIn = Boolean(data.emailOptIn);

    const customer = await CustomerModel.create({
      storeId: storeObjId,
      email,
      passwordHash,
      firstName: (data.firstName || '').trim(),
      lastName: (data.lastName || '').trim(),
      phone: data.phone?.trim() || '',
      marketingConsent: {
        emailOptIn,
        optInSource: data.optInSource || 'storefront_registration',
        optInTimestamp: emailOptIn ? new Date() : undefined
      },
      status: 'ACTIVE',
      addresses: []
    });

    // Record consent log
    if (emailOptIn) {
      await ConsentLogModel.create({
        storeId: storeObjId,
        customerId: customer._id,
        email,
        channel: 'EMAIL',
        action: 'OPT_IN',
        source: data.optInSource || 'storefront_registration',
        ipAddress: data.ipAddress
      });
    }

    // Dispatch welcome email asynchronously via Resend
    emailService.sendEmail({

      to: email,
      subject: `Welcome to ${store.name}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #4f46e5;">Welcome to ${store.name}, ${customer.firstName || 'valued customer'}!</h2>
          <p>Your customer account has been created successfully.</p>
          <p>You can now log in anytime to view your order history, track shipping, and manage your account.</p>
          <p style="margin-top: 24px;">
            <a href="${env.FRONTEND_URL || 'http://localhost:5173'}/store/${store.slug}/account/login" 
               style="background: #4f46e5; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Log in to your account
            </a>
          </p>
        </div>
      `,
      text: `Welcome to ${store.name}, ${customer.firstName || 'valued customer'}!\n\nYour account has been created successfully.`
    }).catch(err => {
      console.warn(`[EmailService] Welcome email dispatch notice for ${email}:`, err?.message || err);
    });

    // Retrospectively associate eligible guest orders
    await this.claimGuestOrders(storeId, customer._id.toString(), email);


    // Refresh customer to get updated spend/orders
    const updatedCustomer = await CustomerModel.findById(customer._id);
    const token = generateCustomerToken(updatedCustomer || customer, storeId);

    return {
      customer: sanitizeCustomer(updatedCustomer || customer),
      token
    };
  },

  async login(storeId: string, emailRaw: string, password: string) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const email = emailRaw.trim().toLowerCase();

    const customer = await CustomerModel.findOne({ storeId: storeObjId, email });
    if (!customer) {
      throw new AppError('Invalid email or password', 401, ERROR_CODES.UNAUTHORIZED);
    }

    if (customer.status === 'BLOCKED') {
      throw new AppError('This customer account has been suspended', 403, ERROR_CODES.FORBIDDEN);
    }

    const matches = await bcrypt.compare(password, customer.passwordHash);
    if (!matches) {
      throw new AppError('Invalid email or password', 401, ERROR_CODES.UNAUTHORIZED);
    }

    // Auto-claim any new guest orders that used this email
    await this.claimGuestOrders(storeId, customer._id.toString(), email);

    const updatedCustomer = await CustomerModel.findById(customer._id);
    const token = generateCustomerToken(updatedCustomer || customer, storeId);

    return {
      customer: sanitizeCustomer(updatedCustomer || customer),
      token
    };
  },

  async getProfile(storeId: string, customerId: string) {
    const customer = await CustomerModel.findOne({
      _id: new mongoose.Types.ObjectId(customerId),
      storeId: new mongoose.Types.ObjectId(storeId)
    });

    if (!customer) {
      throw new AppError('Customer profile not found', 404, ERROR_CODES.NOT_FOUND);
    }

    return sanitizeCustomer(customer);
  },

  async updateProfile(storeId: string, customerId: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) {
    const update: any = {};
    if (data.firstName !== undefined) update.firstName = data.firstName.trim();
    if (data.lastName !== undefined) update.lastName = data.lastName.trim();
    if (data.phone !== undefined) update.phone = data.phone.trim();

    const customer = await CustomerModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(customerId), storeId: new mongoose.Types.ObjectId(storeId) },
      { $set: update },
      { new: true }
    );

    if (!customer) {
      throw new AppError('Customer not found', 404, ERROR_CODES.NOT_FOUND);
    }

    return sanitizeCustomer(customer);
  },

  async addAddress(storeId: string, customerId: string, addressData: Omit<ICustomerAddress, 'id'>) {
    const customer = await CustomerModel.findOne({
      _id: new mongoose.Types.ObjectId(customerId),
      storeId: new mongoose.Types.ObjectId(storeId)
    });

    if (!customer) {
      throw new AppError('Customer not found', 404, ERROR_CODES.NOT_FOUND);
    }

    const newAddress: ICustomerAddress = {
      id: crypto.randomUUID(),
      fullName: addressData.fullName.trim(),
      street: addressData.street.trim(),
      city: addressData.city.trim(),
      state: addressData.state?.trim() || '',
      country: addressData.country?.trim() || 'US',
      postalCode: addressData.postalCode.trim(),
      isDefault: Boolean(addressData.isDefault || customer.addresses.length === 0)
    };

    if (newAddress.isDefault) {
      customer.addresses.forEach(a => { a.isDefault = false; });
    }

    customer.addresses.push(newAddress);
    await customer.save();

    return sanitizeCustomer(customer);
  },

  async deleteAddress(storeId: string, customerId: string, addressId: string) {
    const customer = await CustomerModel.findOne({
      _id: new mongoose.Types.ObjectId(customerId),
      storeId: new mongoose.Types.ObjectId(storeId)
    });

    if (!customer) {
      throw new AppError('Customer not found', 404, ERROR_CODES.NOT_FOUND);
    }

    customer.addresses = customer.addresses.filter(a => a.id !== addressId);
    if (customer.addresses.length > 0 && !customer.addresses.some(a => a.isDefault)) {
      customer.addresses[0].isDefault = true;
    }

    await customer.save();
    return sanitizeCustomer(customer);
  },

  async listOrders(storeId: string, customerId: string) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const customerObjId = new mongoose.Types.ObjectId(customerId);

    return OrderModel.find({
      storeId: storeObjId,
      customerId: customerObjId
    }).sort({ createdAt: -1 });
  },

  async getOrder(storeId: string, customerId: string, orderNumber: string) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const customerObjId = new mongoose.Types.ObjectId(customerId);

    const order = await OrderModel.findOne({
      storeId: storeObjId,
      customerId: customerObjId,
      orderNumber
    });

    if (!order) {
      throw new AppError('Order not found', 404, ERROR_CODES.NOT_FOUND);
    }

    return order;
  },

  async claimGuestOrders(storeId: string, customerId: string, email: string) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const customerObjId = new mongoose.Types.ObjectId(customerId);
    const normalizedEmail = email.trim().toLowerCase();

    // Find all guest orders for this store matching this customer's email
    const unclaimedOrders = await OrderModel.find({
      storeId: storeObjId,
      customerEmail: normalizedEmail,
      $or: [{ customerId: { $exists: false } }, { customerId: null }]
    });

    if (unclaimedOrders.length > 0) {
      await OrderModel.updateMany(
        {
          storeId: storeObjId,
          customerEmail: normalizedEmail,
          $or: [{ customerId: { $exists: false } }, { customerId: null }]
        },
        { $set: { customerId: customerObjId } }
      );
    }

    // Re-aggregate total lifetime spend and order count
    const allCustomerOrders = await OrderModel.find({
      storeId: storeObjId,
      customerId: customerObjId
    });

    const totalOrdersCount = allCustomerOrders.length;
    const totalSpendCents = allCustomerOrders.reduce((sum, o) => sum + (o.totalCents || 0), 0);
    const lastOrder = allCustomerOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    await CustomerModel.updateOne(
      { _id: customerObjId },
      {
        $set: {
          totalOrdersCount,
          totalSpendCents,
          lastOrderAt: lastOrder ? lastOrder.createdAt : undefined
        }
      }
    );

    return { claimedCount: unclaimedOrders.length, totalOrdersCount, totalSpendCents };
  },

  async updateConsent(storeId: string, customerId: string, data: {
    emailOptIn: boolean;
    source?: string;
    ipAddress?: string;
  }) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const customerObjId = new mongoose.Types.ObjectId(customerId);

    const customer = await CustomerModel.findOne({ _id: customerObjId, storeId: storeObjId });
    if (!customer) {
      throw new AppError('Customer not found', 404, ERROR_CODES.NOT_FOUND);
    }

    const action = data.emailOptIn ? 'OPT_IN' : 'OPT_OUT';
    customer.marketingConsent.emailOptIn = data.emailOptIn;
    if (data.emailOptIn) {
      customer.marketingConsent.optInTimestamp = new Date();
      customer.marketingConsent.optInSource = data.source || 'account_preferences';
    } else {
      customer.marketingConsent.optOutTimestamp = new Date();
    }

    await customer.save();

    await ConsentLogModel.create({
      storeId: storeObjId,
      customerId: customerObjId,
      email: customer.email,
      channel: 'EMAIL',
      action,
      source: data.source || 'account_preferences',
      ipAddress: data.ipAddress
    });

    return sanitizeCustomer(customer);
  },

  async requestPasswordReset(storeId: string, emailRaw: string) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const email = emailRaw.trim().toLowerCase();

    const customer = await CustomerModel.findOne({ storeId: storeObjId, email });
    if (!customer) {
      // Return success to avoid email enumeration attacks
      return { message: 'If an account exists, a password reset link has been dispatched.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    customer.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    customer.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await customer.save();

    const store = await StoreModel.findById(storeObjId);
    const resetUrl = `${env.FRONTEND_URL}/store/${store?.slug || storeId}/account/reset-password?token=${resetToken}`;

    await emailService.sendPasswordReset({
      to: email,
      storeName: store?.name || 'Brand Bloom',
      resetUrl,
      expiresAt: customer.resetPasswordExpires
    });

    return { message: 'If an account exists, a password reset link has been dispatched.' };
  },

  async resetPassword(storeId: string, token: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const customer = await CustomerModel.findOne({
      storeId: new mongoose.Types.ObjectId(storeId),
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!customer) {
      throw new AppError('Password reset token is invalid or has expired', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    customer.passwordHash = await bcrypt.hash(newPassword, 10);
    customer.resetPasswordToken = undefined;
    customer.resetPasswordExpires = undefined;
    await customer.save();

    // Security notification on password change
    const store = await StoreModel.findById(customer.storeId);
    await emailService.sendEmail({
      to: customer.email,
      subject: `Security Alert: Your password has been changed — ${store?.name || 'Brand Bloom'}`,
      html: `<p>Your password for <strong>${store?.name || 'Brand Bloom'}</strong> was successfully updated. If you did not make this change, please contact support immediately.</p>`,
      text: `Your password for ${store?.name || 'Brand Bloom'} was successfully updated. If you did not make this change, please contact support immediately.`
    }).catch(() => {});

    return { message: 'Password reset successfully. You can now sign in.' };
  }
};
