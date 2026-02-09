"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const booking_service_1 = require("./booking.service");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const pick_1 = __importDefault(require("../../../shared/pick"));
const pagination_1 = require("../../../interfaces/pagination");
const createBooking = (0, catchAsync_1.default)(async (req, res) => {
    const { requestedTo } = req.params;
    const result = await booking_service_1.BookingServices.createBooking(req.user, requestedTo);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Booking created successfully',
        data: result,
    });
});
const updateBooking = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const bookingData = req.body;
    const result = await booking_service_1.BookingServices.updateBooking(req.user, id, bookingData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Booking updated successfully',
        data: result,
    });
});
const getSingleBooking = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await booking_service_1.BookingServices.getSingleBooking(req.user, id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Booking retrieved successfully',
        data: result,
    });
});
const getAllBookings = (0, catchAsync_1.default)(async (req, res) => {
    const pagination = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const result = await booking_service_1.BookingServices.getAllBookings(req.user, pagination);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Bookings retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});
const deleteBooking = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await booking_service_1.BookingServices.deleteBooking(req.user, id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Booking deleted successfully',
        data: result,
    });
});
exports.BookingController = {
    createBooking,
    updateBooking,
    getSingleBooking,
    getAllBookings,
    deleteBooking,
};
