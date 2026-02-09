"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const package_service_1 = require("./package.service");
const createPackage = (0, catchAsync_1.default)(async (req, res) => {
    const result = await package_service_1.packageService.createPackage(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Package created successfully',
        data: result,
    });
});
const updatePackage = (0, catchAsync_1.default)(async (req, res) => {
    const result = await package_service_1.packageService.updatePackage(req.params.packageId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Package updated successfully',
        data: result,
    });
});
const togglePackage = (0, catchAsync_1.default)(async (req, res) => {
    const result = await package_service_1.packageService.togglePackage(req.params.packageId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Package toggled successfully',
        data: result,
    });
});
const getPackages = (0, catchAsync_1.default)(async (req, res) => {
    const result = await package_service_1.packageService.getPackages();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Packages retrieved successfully',
        data: result,
    });
});
const applyDiscount = (0, catchAsync_1.default)(async (req, res) => {
    const result = await package_service_1.packageService.applyDiscount(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Global discount applied successfully',
        data: result,
    });
});
const getCoupon = (0, catchAsync_1.default)(async (req, res) => {
    const result = await package_service_1.packageService.getCoupon();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Coupon retrieved successfully',
        data: result,
    });
});
const getOfferData = (0, catchAsync_1.default)(async (req, res) => {
    const result = await package_service_1.packageService.getOfferData();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Coupon data retrieved successfully',
        data: result,
    });
});
const deleteCoupon = (0, catchAsync_1.default)(async (req, res) => {
    const result = await package_service_1.packageService.deleteCoupon(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Coupon data retrieved successfully',
        data: result,
    });
});
exports.PackageController = {
    createPackage,
    getPackages,
    applyDiscount,
    updatePackage,
    togglePackage,
    getCoupon,
    getOfferData,
    deleteCoupon
};
