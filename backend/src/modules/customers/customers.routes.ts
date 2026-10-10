import { Router, Request, Response, NextFunction } from 'express';
import { customersService } from './customers.service.js';
import { promotionsService } from '../marketing/promotions.service.js';
import { ConsentLogModel } from './consent-log.model.js';
import { CustomerModel } from './customers.model.js';
import { StoreModel } from '../stores/stores.model.js';
import { authenticateCustomer } from '../../middleware/authenticate-customer.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';

const router = Router({ mergeParams: true });

// Helper to resolve store from slug in URL
async function resolveStoreId(req: Request, _res: Response, next: NextFunction) {
  const { storeSlug } = req.params;
  const store = await StoreModel.findOne({ slug: storeSlug });
  if (!store) {
    return next(new AppError(`Store with slug '${storeSlug}' not found`, 404, ERROR_CODES.NOT_FOUND));
  }
  (req as any).resolvedStore = store;
  return next();
}

router.use(resolveStoreId);

// 1. Customer Registration
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = (req as any).resolvedStore;
    const { email, password, confirmPassword, fullName, name, firstName, lastName, phone, emailOptIn, acceptsMarketing } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      throw new AppError('Email address is required', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new AppError('Please provide a valid email address', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    if (!password || typeof password !== 'string') {
      throw new AppError('Password is required', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    if (confirmPassword !== undefined && confirmPassword !== password) {
      throw new AppError('Passwords do not match', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    // Determine first and last name from fullName/name or direct fields
    const rawFullName = (fullName || name || '').trim();
    let resolvedFirstName = (firstName || '').trim();
    let resolvedLastName = (lastName || '').trim();

    if (rawFullName && !resolvedFirstName) {
      const parts = rawFullName.split(' ').filter(Boolean);
      resolvedFirstName = parts[0] || 'Customer';
      resolvedLastName = parts.slice(1).join(' ') || '';
    }

    if (!resolvedFirstName && !resolvedLastName) {
      resolvedFirstName = email.trim().split('@')[0] || 'Customer';
    }

    const result = await customersService.register(store._id.toString(), {
      email,
      password,
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
      phone: typeof phone === 'string' ? phone.trim() : undefined,
      emailOptIn: Boolean(emailOptIn ?? acceptsMarketing),
      optInSource: 'storefront_registration',
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      data: result,
      customer: result.customer,
      token: result.token
    });
  } catch (err) {
    next(err);
  }
});

// 2. Customer Login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = (req as any).resolvedStore;
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError('Email and password are required', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const result = await customersService.login(store._id.toString(), email, password);
    res.json({
      success: true,
      message: 'Customer logged in successfully',
      data: result,
      customer: result.customer,
      token: result.token
    });
  } catch (err) {
    next(err);
  }
});

// 3. Forgot Password Request
router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = (req as any).resolvedStore;
    const { email } = req.body;
    if (!email) throw new AppError('Email is required', 400, ERROR_CODES.VALIDATION_ERROR);

    const result = await customersService.requestPasswordReset(store._id.toString(), email);
    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
});

// 4. Reset Password Action
router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = (req as any).resolvedStore;
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      throw new AppError('Token and new password are required', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const result = await customersService.resetPassword(store._id.toString(), token, newPassword);
    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
});

// 5. Unsubscribe One-Click
const unsubscribeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = (req as any).resolvedStore;
    const email = (req.query.email as string)?.trim().toLowerCase();
    if (!email) throw new AppError('Email query parameter required', 400, ERROR_CODES.VALIDATION_ERROR);

    await CustomerModel.updateOne(
      { storeId: store._id, email },
      { $set: { 'marketingConsent.emailOptIn': false, 'marketingConsent.optOutTimestamp': new Date() } }
    );

    await ConsentLogModel.create({
      storeId: store._id,
      email,
      channel: 'EMAIL',
      action: 'UNSUBSCRIBE',
      source: 'one_click_unsubscribe_link',
      ipAddress: req.ip
    });

    if (req.headers.accept?.includes('text/html')) {
      res.send(`<!DOCTYPE html><html><body><h2>Successfully Unsubscribed</h2><p>You have been unsubscribed from marketing communications for ${store.name}.</p></body></html>`);
    } else {
      res.json({ success: true, message: `Successfully Unsubscribed ${email} from marketing communications.` });
    }
  } catch (err) {
    next(err);
  }
};
router.get('/unsubscribe', unsubscribeHandler);
router.get('/marketing/unsubscribe', unsubscribeHandler);

// 6. Validate Promotion Code (GET or POST)
const validatePromotionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = (req as any).resolvedStore;
    const code = ((req.query.code || req.body?.code) as string)?.trim();
    const subtotalCents = req.query.subtotalCents || req.body?.subtotalCents;
    if (!code) throw new AppError('Promotion code is required', 400, ERROR_CODES.VALIDATION_ERROR);

    const result = await promotionsService.validateAndApply(
      store._id.toString(),
      code,
      Number(subtotalCents || 0)
    );

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
router.get('/promotions/validate', validatePromotionHandler);
router.post('/promotions/validate', validatePromotionHandler);

// Authenticated Customer Profile & Order Endpoints
router.use(authenticateCustomer);

// Enforce store tenant isolation: Customer token must match the store tenant
router.use((req: Request, _res: Response, next: NextFunction) => {
  const store = (req as any).resolvedStore;
  if (req.customer && req.customer.storeId !== store._id.toString()) {
    return next(new AppError('Forbidden: Customer does not belong to this store tenant', 403, ERROR_CODES.FORBIDDEN));
  }
  return next();
});

const getProfileHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = (req as any).resolvedStore;
    const profile = await customersService.getProfile(store._id.toString(), req.customer!.customerId);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};
router.get('/me', getProfileHandler);
router.get('/profile', getProfileHandler);

const updateProfileHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = (req as any).resolvedStore;
    const updated = await customersService.updateProfile(store._id.toString(), req.customer!.customerId, req.body);
    res.json({ success: true, message: 'Profile updated', data: updated });
  } catch (err) {
    next(err);
  }
};
router.put('/me', updateProfileHandler);
router.patch('/me', updateProfileHandler);
router.put('/profile', updateProfileHandler);
router.patch('/profile', updateProfileHandler);

router.post('/addresses', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = (req as any).resolvedStore;
    const { street, city, state, country, postalCode, isDefault } = req.body;
    const fullName = req.body.fullName || 'Default Shipping Address';
    if (!street || !city || !postalCode) {
      throw new AppError('Street, city, and postal code are required', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const updated = await customersService.addAddress(store._id.toString(), req.customer!.customerId, {
      fullName,
      street,
      city,
      state: state || '',
      country: country || 'US',
      postalCode,
      isDefault: Boolean(isDefault)
    });

    res.status(200).json({ success: true, message: 'Address added', data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/addresses/:addressId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = (req as any).resolvedStore;
    const updated = await customersService.deleteAddress(
      store._id.toString(),
      req.customer!.customerId,
      req.params.addressId
    );
    res.json({ success: true, message: 'Address removed', data: updated });
  } catch (err) {
    next(err);
  }
});

router.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = (req as any).resolvedStore;
    const orders = await customersService.listOrders(store._id.toString(), req.customer!.customerId);
    res.json({ success: true, data: { orders }, orders });
  } catch (err) {
    next(err);
  }
});

router.get('/orders/:orderNumber', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = (req as any).resolvedStore;
    const order = await customersService.getOrder(
      store._id.toString(),
      req.customer!.customerId,
      req.params.orderNumber
    );
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

router.post(['/claim-orders', '/claim-guest-orders'], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = (req as any).resolvedStore;
    const result = await customersService.claimGuestOrders(
      store._id.toString(),
      req.customer!.customerId,
      req.customer!.email
    );
    res.json({
      success: true,
      message: `Claimed ${result.claimedCount} previous guest orders.`,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

router.put('/consent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = (req as any).resolvedStore;
    const { emailOptIn } = req.body;
    const updated = await customersService.updateConsent(store._id.toString(), req.customer!.customerId, {
      emailOptIn: Boolean(emailOptIn),
      source: 'storefront_account_settings',
      ipAddress: req.ip
    });
    res.json({ success: true, message: 'Marketing preferences updated', data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
