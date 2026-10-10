import { AuditLogModel } from './audit.model.js';

export const auditService = {
  async record(storeId: string, actorId: string, action: string, details?: any) {
    return AuditLogModel.create({ storeId, actorId, action, details });
  },

  async listByStore(storeId: string) {
    return AuditLogModel.find({ storeId }).sort({ createdAt: -1 }).limit(100);
  }
};
