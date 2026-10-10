import { Router } from 'express';
import { membershipsController } from './memberships.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { resolveStore } from '../../middleware/resolve-store.js';
import { requireMembership } from '../../middleware/require-membership.js';
import { requirePermission } from '../../middleware/require-permission.js';
import { PERMISSIONS } from '../../config/constants.js';

const router = Router();
router.use(authenticate);

// Invitation acceptance only requires logged-in user
router.post('/accept', membershipsController.acceptInvitation);

// Store-scoped team management
router.use(resolveStore, requireMembership);

router.get('/', requirePermission(PERMISSIONS.MANAGE_MEMBERS), membershipsController.listMembers);
router.post('/invite', requirePermission(PERMISSIONS.MANAGE_MEMBERS), membershipsController.inviteStaff);
router.patch('/:id/permissions', requirePermission(PERMISSIONS.MANAGE_MEMBERS), membershipsController.updatePermissions);
router.delete('/:id', requirePermission(PERMISSIONS.MANAGE_MEMBERS), membershipsController.removeMember);

export default router;
