import { Router, Request, Response, NextFunction } from 'express';
import { customersCrmService } from './customers.crm.service.js';
import { authenticate } from '../../middleware/authenticate.js';
import { resolveStore } from '../../middleware/resolve-store.js';
import { requireMembership } from '../../middleware/require-membership.js';
import { requirePermission } from '../../middleware/require-permission.js';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(resolveStore);
router.use(requireMembership);

// List customers with segments, filters, search, sorting
router.get('/', requirePermission('customers:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = (req.params.storeId || req.storeId) as string;
    const result = await customersCrmService.listStoreCustomers(storeId, {
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 20),
      search: req.query.search as string,
      segment: req.query.segment as any,
      sort: req.query.sort as any
    });

    res.json({
      success: true,
      data: {
        customers: result.items,
        pagination: result.meta,
        segmentCounts: result.segments,
        metrics: result.metrics
      },
      customers: result.items,
      meta: result.meta,
      segments: result.segments,
      metrics: result.metrics
    });
  } catch (err) {
    next(err);
  }
});

// Get individual customer details with orders & consent timeline
router.get('/:customerId', requirePermission('customers:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = (req.params.storeId || req.storeId) as string;
    const customer = await customersCrmService.getCustomerDetails(storeId, req.params.customerId);
    res.json({
      success: true,
      data: customer
    });
  } catch (err) {
    next(err);
  }
});

// Export customer data (GDPR portability)
const exportHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = (req.params.storeId || req.storeId) as string;
    const exportData = await customersCrmService.exportCustomerData(storeId, req.params.customerId);
    res.json({
      success: true,
      data: exportData
    });
  } catch (err) {
    next(err);
  }
};
router.get('/:customerId/export', requirePermission('customers:manage'), exportHandler);
router.post('/:customerId/export', requirePermission('customers:manage'), exportHandler);

// Delete customer data (GDPR Right to be Forgotten)
router.delete('/:customerId', requirePermission('customers:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = (req.params.storeId || req.storeId) as string;
    const result = await customersCrmService.deleteCustomerData(storeId, req.params.customerId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
