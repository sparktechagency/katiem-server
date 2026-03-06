"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRoutes = void 0;
const express_1 = require("express");
const dashboard_controller_1 = require("./dashboard.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_1 = require("../../../enum/user");
const router = (0, express_1.Router)();
// General stats
router.get('/stats', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), dashboard_controller_1.DashboardController.getGeneralStats);
// User management
router.get('/users', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), dashboard_controller_1.DashboardController.getUsers);
router.patch('/users/toggle/:userId', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), dashboard_controller_1.DashboardController.blockUnblockUser);
router.patch('/users/verify/:userId', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), dashboard_controller_1.DashboardController.toggleUserVerification);
// Get user details by ID
router.get('/users/:userId', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), dashboard_controller_1.DashboardController.getUserDetails);
// Chart data APIs
router.get('/monthly-revenue', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), dashboard_controller_1.DashboardController.getMonthlyRevenue);
router.get('/monthly-subscriptions', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), dashboard_controller_1.DashboardController.getMonthlySubscriptions);
router.get('/monthly-user-counts', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), dashboard_controller_1.DashboardController.getMonthlyUserCounts);
exports.DashboardRoutes = router;
