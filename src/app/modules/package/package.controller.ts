import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { packageService } from "./package.service";

const createPackage = catchAsync(async (req, res) => {
    const result = await packageService.createPackage(req.body);
    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: 'Package created successfully',
        data: result,
    });
});

const updatePackage = catchAsync(async (req, res) => {
    const result = await packageService.updatePackage(req.params.packageId, req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Package updated successfully',
        data: result,
    });
});

const togglePackage = catchAsync(async (req, res) => {
    const result = await packageService.togglePackage(req.params.packageId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Package toggled successfully',
        data: result,
    });
});

const getPackages = catchAsync(async (req, res) => {
    const result = await packageService.getPackages();
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Packages retrieved successfully',
        data: result,
    });
});

const applyDiscount = catchAsync(async (req, res) => {
    const result = await packageService.applyDiscount(req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Global discount applied successfully',
        data: result,
    });
});



const getCoupon = catchAsync(async (req, res) => {
    const result = await packageService.getCoupon();
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Coupon retrieved successfully',
        data: result,
    });
});

const getOfferData = catchAsync(async (req, res) => {
    const result = await packageService.getOfferData();
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Coupon data retrieved successfully',
        data: result,
    });
});
const deleteCoupon = catchAsync(async (req, res) => {
    const result = await packageService.deleteCoupon(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Coupon data retrieved successfully',
        data: result,
    });
});

export const PackageController = {
    createPackage,
    getPackages,
    applyDiscount,
    updatePackage,
    togglePackage,
    getCoupon,
    getOfferData,
    deleteCoupon
}
