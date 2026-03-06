"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRoutes = void 0;
const express_1 = __importDefault(require("express"));
const booking_controller_1 = require("./booking.controller");
const booking_validation_1 = require("./booking.validation");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_1 = require("../../../enum/user");
const router = express_1.default.Router();
router.get('/', (0, auth_1.default)(user_1.USER_ROLES.WORKER, user_1.USER_ROLES.EMPLOYER), booking_controller_1.BookingController.getAllBookings);
router.patch('/:id', (0, auth_1.default)(user_1.USER_ROLES.WORKER), (0, validateRequest_1.default)(booking_validation_1.BookingValidations.update), booking_controller_1.BookingController.updateBooking);
router.post('/:requestedTo', (0, auth_1.default)(user_1.USER_ROLES.EMPLOYER), (0, validateRequest_1.default)(booking_validation_1.BookingValidations.create), booking_controller_1.BookingController.createBooking);
router.get('/:id', (0, auth_1.default)(user_1.USER_ROLES.WORKER, user_1.USER_ROLES.EMPLOYER, user_1.USER_ROLES.WORKER), booking_controller_1.BookingController.getSingleBooking);
router.delete('/:id', (0, auth_1.default)(user_1.USER_ROLES.EMPLOYER), booking_controller_1.BookingController.deleteBooking);
exports.BookingRoutes = router;
