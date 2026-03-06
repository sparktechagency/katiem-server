"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_route_1 = require("../app/modules/user/user.route");
const auth_route_1 = require("../app/modules/auth/auth.route");
const express_1 = __importDefault(require("express"));
const notifications_route_1 = require("../app/modules/notifications/notifications.route");
const public_route_1 = require("../app/modules/public/public.route");
const category_route_1 = require("../app/modules/category/category.route");
const job_route_1 = require("../app/modules/job/job.route");
const booking_route_1 = require("../app/modules/booking/booking.route");
const application_route_1 = require("../app/modules/application/application.route");
const chat_route_1 = require("../app/modules/chat/chat.route");
const message_route_1 = require("../app/modules/message/message.route");
const page_data_route_1 = require("../app/modules/PageData/page.data.route");
const review_route_1 = require("../app/modules/review/review.route");
const dashboard_route_1 = require("../app/modules/dashboard/dashboard.route");
const package_route_1 = require("../app/modules/package/package.route");
const subscription_route_1 = require("../app/modules/subscription/subscription.route");
const clientReview_route_1 = require("../app/modules/clientReview/clientReview.route");
const router = express_1.default.Router();
const apiRoutes = [
    { path: '/user', route: user_route_1.UserRoutes },
    { path: '/auth', route: auth_route_1.AuthRoutes },
    { path: '/notifications', route: notifications_route_1.NotificationRoutes },
    { path: '/public', route: public_route_1.PublicRoutes },
    { path: '/category', route: category_route_1.CategoryRoutes },
    { path: '/job', route: job_route_1.JobRoutes },
    { path: '/booking', route: booking_route_1.BookingRoutes },
    { path: '/application', route: application_route_1.ApplicationRoutes },
    { path: '/content', route: page_data_route_1.ContentRoutes },
    { path: '/chat', route: chat_route_1.ChatRoutes },
    { path: '/review', route: review_route_1.ReviewRoutes },
    { path: '/dashboard', route: dashboard_route_1.DashboardRoutes },
    { path: '/message', route: message_route_1.MessageRoutes },
    { path: '/package', route: package_route_1.PackageRoutes },
    { path: '/subscription', route: subscription_route_1.SubscriptionRoutes },
    { path: '/clientreview', route: clientReview_route_1.ClientreviewRoutes },
];
apiRoutes.forEach(route => {
    router.use(route.path, route.route);
});
exports.default = router;
