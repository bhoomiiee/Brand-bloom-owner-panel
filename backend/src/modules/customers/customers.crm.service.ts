import mongoose from 'mongoose';
import { CustomerModel, ICustomer } from './customers.model.js';
import { ConsentLogModel } from './consent-log.model.js';
import { OrderModel } from '../orders/orders.model.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
import { buildPaginationMeta } from '../../shared/http/pagination.js';

export interface CustomerListQuery {
  page?: number;
  limit?: number;
  search?: string;
  segment?: 'all' | 'new' | 'repeat' | 'high_value' | 'inactive';
  sort?: 'spend_desc' | 'orders_desc' | 'date_desc' | 'name_asc';
}

export const customersCrmService = {
  async listStoreCustomers(storeId: string, query: CustomerListQuery) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 20)));
    const skip = (page - 1) * limit;

    const baseFilter: any = { storeId: storeObjId };

    if (query.search && query.search.trim()) {
      const searchRegex = { $regex: query.search.trim(), $options: 'i' };
      baseFilter.$or = [
        { email: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { phone: searchRegex }
      ];
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Segment filter
    const filter = { ...baseFilter };
    if (query.segment && query.segment !== 'all') {
      switch (query.segment) {
        case 'new':
          filter.$or = [
            { createdAt: { $gte: thirtyDaysAgo } },
            { totalOrdersCount: { $lte: 1 } }
          ];
          break;
        case 'repeat':
          filter.totalOrdersCount = { $gte: 2 };
          break;
        case 'high_value':
          filter.totalSpendCents = { $gte: 20000 }; // >= $200
          break;
        case 'inactive':
          filter.$or = [
            { lastOrderAt: { $lt: ninetyDaysAgo } },
            { totalOrdersCount: 0, createdAt: { $lt: thirtyDaysAgo } }
          ];
          break;
      }
    }

    // Sort order
    let sortOptions: any = { createdAt: -1 };
    switch (query.sort) {
      case 'spend_desc':
        sortOptions = { totalSpendCents: -1, createdAt: -1 };
        break;
      case 'orders_desc':
        sortOptions = { totalOrdersCount: -1, createdAt: -1 };
        break;
      case 'name_asc':
        sortOptions = { firstName: 1, lastName: 1 };
        break;
      case 'date_desc':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const [items, total, allCount, newCount, repeatCount, highValueCount, inactiveCount] = await Promise.all([
      CustomerModel.find(filter)
        .select('-passwordHash -resetPasswordToken -resetPasswordExpires')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      CustomerModel.countDocuments(filter),
      CustomerModel.countDocuments(baseFilter),
      CustomerModel.countDocuments({
        ...baseFilter,
        $or: [{ createdAt: { $gte: thirtyDaysAgo } }, { totalOrdersCount: { $lte: 1 } }]
      }),
      CustomerModel.countDocuments({ ...baseFilter, totalOrdersCount: { $gte: 2 } }),
      CustomerModel.countDocuments({ ...baseFilter, totalSpendCents: { $gte: 20000 } }),
      CustomerModel.countDocuments({
        ...baseFilter,
        $or: [
          { lastOrderAt: { $lt: ninetyDaysAgo } },
          { totalOrdersCount: 0, createdAt: { $lt: thirtyDaysAgo } }
        ]
      })
    ]);

    const enrichedItems = items.map((c) => {
      const averageOrderValueCents = c.totalOrdersCount > 0
        ? Math.round(c.totalSpendCents / c.totalOrdersCount)
        : 0;

      let segment: 'new' | 'repeat' | 'high_value' | 'inactive' = 'new';
      if (c.totalSpendCents >= 20000) {
        segment = 'high_value';
      } else if (c.totalOrdersCount >= 2) {
        segment = 'repeat';
      } else if (c.lastOrderAt && c.lastOrderAt < ninetyDaysAgo) {
        segment = 'inactive';
      }

      return {
        id: c._id.toString(),
        email: c.email,
        name: `${c.firstName} ${c.lastName}`.trim(),
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        totalOrdersCount: c.totalOrdersCount,
        orderCount: c.totalOrdersCount,
        totalSpendCents: c.totalSpendCents,
        totalSpentCents: c.totalSpendCents,
        averageOrderValueCents,
        segment,
        lastOrderAt: c.lastOrderAt,
        lastOrderDate: c.lastOrderAt?.toISOString(),
        marketingConsent: c.marketingConsent,
        status: c.status,
        createdAt: c.createdAt
      };
    });

    const [aggregateMetrics] = await CustomerModel.aggregate([
      { $match: { storeId: storeObjId } },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalLifetimeValueCents: { $sum: '$totalSpendCents' }
        }
      }
    ]);

    const totalCustomers = aggregateMetrics?.totalCustomers || allCount || 0;
    const totalLifetimeValueCents = aggregateMetrics?.totalLifetimeValueCents || 0;
    const averageCustomerValueCents = totalCustomers > 0 ? Math.round(totalLifetimeValueCents / totalCustomers) : 0;

    return {
      items: enrichedItems,
      meta: buildPaginationMeta(total, page, limit),
      segments: {
        all: allCount,
        new: newCount,
        repeat: repeatCount,
        high_value: highValueCount,
        inactive: inactiveCount
      },
      metrics: {
        totalCustomers,
        totalLifetimeValueCents,
        averageCustomerValueCents
      }
    };
  },

  async getCustomerDetails(storeId: string, customerId: string) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const customerObjId = new mongoose.Types.ObjectId(customerId);

    const customer = await CustomerModel.findOne({
      _id: customerObjId,
      storeId: storeObjId
    }).select('-passwordHash -resetPasswordToken -resetPasswordExpires');

    if (!customer) {
      throw new AppError('Customer not found in this store', 404, ERROR_CODES.NOT_FOUND);
    }

    const [orders, consentLogs] = await Promise.all([
      OrderModel.find({ storeId: storeObjId, customerId: customerObjId }).sort({ createdAt: -1 }),
      ConsentLogModel.find({ storeId: storeObjId, customerId: customerObjId }).sort({ createdAt: -1 })
    ]);

    const averageOrderValueCents = customer.totalOrdersCount > 0
      ? Math.round(customer.totalSpendCents / customer.totalOrdersCount)
      : 0;

    return {
      customer: {
        id: customer._id.toString(),
        email: customer.email,
        name: `${customer.firstName} ${customer.lastName}`.trim(),
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        addresses: customer.addresses,
        marketingConsent: customer.marketingConsent,
        status: customer.status,
        totalOrdersCount: customer.totalOrdersCount,
        totalSpendCents: customer.totalSpendCents,
        averageOrderValueCents,
        lastOrderAt: customer.lastOrderAt,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      },
      orders,
      consentLogs,
      consentHistory: consentLogs
    };
  },

  async exportCustomerData(storeId: string, customerId: string) {
    const details = await this.getCustomerDetails(storeId, customerId);
    return {
      exportedAt: new Date(),
      storeId,
      customer: details.customer,
      personalData: details.customer,
      orders: details.orders,
      purchaseHistory: details.orders.map(o => ({
        orderNumber: o.orderNumber,
        createdAt: o.createdAt,
        totalCents: o.totalCents,
        status: o.status,
        itemsCount: o.items.length,
        shippingAddress: o.shippingAddress
      })),
      consentAuditTrail: details.consentLogs,
      consentHistory: details.consentLogs
    };
  },

  async deleteCustomerData(storeId: string, customerId: string) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const customerObjId = new mongoose.Types.ObjectId(customerId);

    const customer = await CustomerModel.findOne({ _id: customerObjId, storeId: storeObjId });
    if (!customer) {
      throw new AppError('Customer not found in this store', 404, ERROR_CODES.NOT_FOUND);
    }

    // Anonymize historical orders
    await OrderModel.updateMany(
      { storeId: storeObjId, customerId: customerObjId },
      {
        $set: {
          customerEmail: `anonymized_${customerObjId.toString().slice(-6)}@privacy-deleted.local`,
          'shippingAddress.fullName': 'Anonymized Customer',
          'shippingAddress.street': 'Redacted for Privacy'
        },
        $unset: { customerId: '' }
      }
    );

    // Delete consent logs and customer record
    await ConsentLogModel.deleteMany({ storeId: storeObjId, customerId: customerObjId });
    await CustomerModel.deleteOne({ _id: customerObjId, storeId: storeObjId });

    return { success: true, message: 'Customer account and personal data deleted successfully.' };
  }
};
