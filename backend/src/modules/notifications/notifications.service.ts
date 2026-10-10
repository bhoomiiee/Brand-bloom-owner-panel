import { NotificationModel } from './notification.model.js';

export const notificationsService = {
  async createNotification(storeId: string, title: string, message: string, type: string = 'INFO', userId?: string) {
    return NotificationModel.create({
      storeId,
      userId: userId || null,
      title,
      message,
      type,
      read: false
    });
  },

  async getStoreNotifications(storeId: string) {
    return NotificationModel.find({ storeId }).sort({ createdAt: -1 }).limit(50);
  },

  async getUserNotifications(storeId: string) {
    return this.getStoreNotifications(storeId);
  },

  async markRead(storeId: string, notificationId: string) {
    return NotificationModel.findOneAndUpdate(
      { _id: notificationId, storeId },
      { read: true },
      { new: true }
    );
  }
};
