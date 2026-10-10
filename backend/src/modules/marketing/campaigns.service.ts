import mongoose from 'mongoose';
import { CampaignModel, ICampaign, CampaignTargetSegment } from './campaigns.model.js';
import { CustomerModel } from '../customers/customers.model.js';
import { StoreModel } from '../stores/stores.model.js';
import { OrderModel } from '../orders/orders.model.js';
import { emailService } from '../email/email.service.js';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';

export const campaignsService = {
  async listCampaigns(storeId: string) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const campaigns = await CampaignModel.find({ storeId: storeObjId }).sort({ createdAt: -1 });

    // Update attributed conversions on the fly from real order records
    for (const c of campaigns) {
      if (c.promotionCode) {
        const attributedOrders = await OrderModel.find({
          storeId: storeObjId,
          discountCode: c.promotionCode,
          status: { $in: ['PAID', 'PROCESSING', 'FULFILLED', 'COMPLETED'] }
        });
        const ordersAttributedCount = attributedOrders.length;
        const revenueAttributedCents = attributedOrders.reduce((sum, o) => sum + (o.totalCents || 0), 0);
        if (
          c.stats.ordersAttributedCount !== ordersAttributedCount ||
          c.stats.revenueAttributedCents !== revenueAttributedCents
        ) {
          c.stats.ordersAttributedCount = ordersAttributedCount;
          c.stats.revenueAttributedCents = revenueAttributedCents;
          await c.save();
        }
      }
    }

    return campaigns;
  },

  async getCampaign(storeId: string, campaignId: string) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const campaign = await CampaignModel.findOne({ _id: campaignId, storeId: storeObjId });
    if (!campaign) {
      throw new AppError('Campaign not found', 404, ERROR_CODES.NOT_FOUND);
    }
    return campaign;
  },

  async createCampaign(storeId: string, data: {
    name: string;
    subject: string;
    contentHtml: string;
    contentText?: string;
    targetSegment?: CampaignTargetSegment;
    promotionCode?: string;
    scheduledAt?: Date;
  }) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    return CampaignModel.create({
      storeId: storeObjId,
      name: data.name.trim(),
      subject: data.subject.trim(),
      contentHtml: data.contentHtml,
      contentText: data.contentText || '',
      targetSegment: data.targetSegment || 'all',
      promotionCode: data.promotionCode ? data.promotionCode.trim().toUpperCase() : undefined,
      scheduledAt: data.scheduledAt,
      status: 'DRAFT'
    });
  },

  async updateCampaign(storeId: string, campaignId: string, data: Partial<ICampaign>) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const campaign = await CampaignModel.findOne({ _id: campaignId, storeId: storeObjId });
    if (!campaign) {
      throw new AppError('Campaign not found', 404, ERROR_CODES.NOT_FOUND);
    }
    if (campaign.status === 'SENDING' || campaign.status === 'COMPLETED') {
      throw new AppError('Cannot modify a campaign that has already been dispatched', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    Object.assign(campaign, data);
    return campaign.save();
  },

  async deleteCampaign(storeId: string, campaignId: string) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const res = await CampaignModel.deleteOne({ _id: campaignId, storeId: storeObjId });
    if (res.deletedCount === 0) {
      throw new AppError('Campaign not found', 404, ERROR_CODES.NOT_FOUND);
    }
  },

  async sendTestEmail(storeId: string, campaignId: string, testEmail: string) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const [campaign, store] = await Promise.all([
      CampaignModel.findOne({ _id: campaignId, storeId: storeObjId }),
      StoreModel.findById(storeObjId)
    ]);

    if (!campaign || !store) {
      throw new AppError('Campaign or store not found', 404, ERROR_CODES.NOT_FOUND);
    }

    const testHtml = `
      <div style="background: #e0e7ff; color: #3730a3; padding: 12px; font-size: 13px; text-align: center; border-radius: 6px; margin-bottom: 16px;">
        ⚠️ <strong>Test Send Preview</strong> — This is a preview of campaign: "${campaign.name}"
      </div>
      ${campaign.contentHtml}
      <hr style="margin-top: 32px; border: none; border-top: 1px solid #cbd5e1;" />
      <p style="font-size: 12px; color: #64748b; text-align: center;">
        You received this test because you requested a preview from Brand Bloom.
      </p>
    `;

    const result = await emailService.sendCampaignEmail({
      to: testEmail.trim().toLowerCase(),
      storeName: store.name,
      subject: `[PREVIEW] ${campaign.subject}`,
      html: testHtml,
      promotionCode: campaign.promotionCode
    });

    return {
      success: result.success,
      previewUrl: result.previewUrl,
      message: `Test email dispatched to ${testEmail}`
    };
  },

  async sendCampaign(storeId: string, campaignId: string) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const [campaign, store] = await Promise.all([
      CampaignModel.findOne({ _id: campaignId, storeId: storeObjId }),
      StoreModel.findById(storeObjId)
    ]);

    if (!campaign || !store) {
      throw new AppError('Campaign or store not found', 404, ERROR_CODES.NOT_FOUND);
    }

    if (campaign.status === 'SENDING' || campaign.status === 'COMPLETED') {
      throw new AppError('Campaign is already sending or has completed', 400, ERROR_CODES.CONFLICT);
    }

    campaign.status = 'SENDING';
    await campaign.save();

    // Query eligible audience: MUST HAVE MARKETING OPT-IN!
    const baseQuery: any = {
      storeId: storeObjId,
      status: 'ACTIVE',
      'marketingConsent.emailOptIn': true
    };

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const seg = (campaign.targetSegment || '').toLowerCase();
    switch (seg) {
      case 'new':
      case 'new_customers':
        baseQuery.$or = [{ createdAt: { $gte: thirtyDaysAgo } }, { totalOrdersCount: { $lte: 1 } }];
        break;
      case 'repeat':
      case 'repeat_customers':
        baseQuery.totalOrdersCount = { $gte: 2 };
        break;
      case 'high_value':
        baseQuery.totalSpendCents = { $gte: 20000 };
        break;
      case 'inactive':
        baseQuery.$or = [
          { lastOrderAt: { $lt: ninetyDaysAgo } },
          { totalOrdersCount: 0, createdAt: { $lt: thirtyDaysAgo } }
        ];
        break;
      case 'all':
      case 'all_opted_in':
      default:
        break;
    }

    const recipients = await CustomerModel.find(baseQuery).select('email firstName lastName');

    let deliveredCount = 0;
    let failedCount = 0;
    const recipientLogs: any[] = [];

    for (const customer of recipients) {
      try {
        const unsubscribeUrl = `${env.FRONTEND_URL}/store/${store.slug}/marketing/unsubscribe?email=${encodeURIComponent(customer.email)}`;
        const personalizedHtml = `
          ${campaign.contentHtml}
        `;

        const sendResult = await emailService.sendCampaignEmail({
          to: customer.email,
          storeName: store.name,
          subject: campaign.subject,
          html: personalizedHtml,
          promotionCode: campaign.promotionCode,
          unsubscribeUrl
        });

        if (sendResult.success) {
          deliveredCount++;
          recipientLogs.push({
            email: customer.email,
            status: 'DELIVERED',
            sentAt: new Date()
          });
        } else {
          failedCount++;
          recipientLogs.push({
            email: customer.email,
            status: 'FAILED',
            error: sendResult.error,
            sentAt: new Date()
          });
        }
      } catch (err: any) {
        failedCount++;
        recipientLogs.push({
          email: customer.email,
          status: 'FAILED',
          error: err.message,
          sentAt: new Date()
        });
      }
    }

    campaign.status = 'COMPLETED';
    campaign.sentAt = new Date();
    campaign.stats.recipientsCount = recipients.length;
    campaign.stats.deliveredCount = deliveredCount;
    campaign.stats.failedCount = failedCount;
    campaign.recipientLogs = recipientLogs;
    await campaign.save();

    return {
      success: true,
      recipientsCount: recipients.length,
      deliveredCount,
      failedCount,
      message: `Campaign "${campaign.name}" dispatched to ${deliveredCount} recipient(s).`
    };
  }
};
