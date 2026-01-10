import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';

const router = Router();

// General stats
router.get('/stats', auth(USER_ROLES.ADMIN), DashboardController.getGeneralStats);

// User management
router.get('/users', auth(USER_ROLES.ADMIN), DashboardController.getUsers);
router.patch('/users/toggle/:userId', auth(USER_ROLES.ADMIN), DashboardController.blockUnblockUser);
router.patch('/users/verify/:userId', auth(USER_ROLES.ADMIN), DashboardController.toggleUserVerification);
// Get user details by ID
router.get('/users/:userId', auth(USER_ROLES.ADMIN), DashboardController.getUserDetails);

// Chart data APIs
router.get('/monthly-revenue', auth(USER_ROLES.ADMIN), DashboardController.getMonthlyRevenue);
router.get('/monthly-subscriptions', auth(USER_ROLES.ADMIN), DashboardController.getMonthlySubscriptions);
router.get('/monthly-user-counts', auth(USER_ROLES.ADMIN), DashboardController.getMonthlyUserCounts);

export const DashboardRoutes = router;