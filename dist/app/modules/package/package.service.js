"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const stripe_service_1 = require("../stripe/stripe.service");
const package_model_1 = require("./package.model");
const createPackage = async (payload) => {
    var _a;
    // Check for duplicate package type
    const existingPackage = await package_model_1.Package.findOne({ type: payload.type });
    if (existingPackage) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.CONFLICT, `A package with type "${payload.type}" already exists.`);
    }
    // Set default discountPercent if not provided
    payload.discountPercent = (_a = payload.discountPercent) !== null && _a !== void 0 ? _a : 0;
    let stripeProduct;
    let stripePrice;
    try {
        stripeProduct = await stripe_service_1.stripeService.createProduct(payload.type, payload.description);
        payload.stripeProductId = stripeProduct.id;
        stripePrice = await stripe_service_1.stripeService.createPrice(payload);
        payload.stripePriceId = stripePrice.id;
        // Save package to db
        const createdPackage = await package_model_1.Package.create(payload);
        return createdPackage;
    }
    catch (error) {
        console.error('Error creating package:', error);
        // Rollback Stripe resources on failure
        if (stripeProduct) {
            await stripe_service_1.stripeService.deleteProduct(stripeProduct.id).catch(() => { });
        }
        if (stripePrice) {
            await stripe_service_1.stripeService.deletePrice(stripePrice.id).catch(() => { });
        }
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Failed to create package. Please try again.`);
    }
};
const updatePackage = async (packageId, payload) => {
    const result = await package_model_1.Package.findByIdAndUpdate(packageId, payload, { new: true, runValidators: true });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Package not found');
    }
    // Sync with Stripe (non-critical, log errors but don't fail)
    try {
        await stripe_service_1.stripeService.updateProduct(result.stripeProductId, result.type, result.description);
    }
    catch (error) {
        console.error('Failed to sync package update with Stripe:', error);
    }
    return result;
};
const getPackages = async () => {
    return await package_model_1.Package.find({ isActive: true });
};
const applyDiscount = async (payload) => {
    const { percent_off: discountPercent } = payload;
    if (discountPercent === 0) {
        await package_model_1.Package.updateMany({}, { discountPercent: 0, couponId: null });
        return { message: "Global discount removed" };
    }
    const couponId = `GLOBAL_OFF_${discountPercent}`;
    let stripeCoupon;
    try {
        stripeCoupon = await stripe_service_1.stripeService.retrieveCoupon(couponId);
    }
    catch (_a) {
        stripeCoupon = await stripe_service_1.stripeService.createCoupon(couponId, discountPercent);
    }
    let localCoupon = await package_model_1.Coupon.findOne({});
    if (!localCoupon) {
        localCoupon = await package_model_1.Coupon.create({
            description: payload.description,
            percent_off: discountPercent,
            stripeCouponId: couponId,
        });
    }
    else {
        localCoupon.percent_off = discountPercent;
        localCoupon.stripeCouponId = couponId;
        localCoupon.description = payload.description;
        await localCoupon.save();
    }
    await package_model_1.Package.updateMany({ isActive: true }, {
        discountPercent,
        stripeCouponId: couponId,
    });
    return {
        message: `Global discount of ${discountPercent}% applied successfully`,
    };
};
const togglePackage = async (packageId) => {
    // Find the package first to check current state
    const pkg = await package_model_1.Package.findById(packageId);
    if (!pkg) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Package not found');
    }
    // Toggle the isActive status
    const result = await package_model_1.Package.findByIdAndUpdate(packageId, { isActive: !pkg.isActive }, { new: true, runValidators: true });
    return {
        message: `Package ${(result === null || result === void 0 ? void 0 : result.isActive) ? 'activated' : 'deactivated'} successfully`,
        package: result
    };
};
const deleteDiscount = async (couponId) => {
    try {
        await stripe_service_1.stripeService.deleteCoupon(couponId);
    }
    catch (err) {
        console.log("Coupon cannot be deleted from Stripe, disabling instead.");
    }
    // Remove discount from all packages
    await package_model_1.Package.updateMany({}, {
        discountPercent: 0,
        stripeCouponId: null,
    });
    // Optional: Remove or archive local coupon record
    await package_model_1.Coupon.deleteOne({ stripeCouponId: couponId });
    return { message: "Global discount removed successfully." };
};
const getCoupon = async () => {
    return await package_model_1.Coupon.findOne({}) || {};
};
const getOfferData = async () => {
    const coupon = await package_model_1.Coupon.findOne().select('-stripeCouponId').lean();
    return coupon || {};
};
const deleteCoupon = async (id) => {
    const deletedCoupon = await package_model_1.Coupon.findByIdAndDelete(id);
    if (!deletedCoupon)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to delete coupon, please try again later.");
    try {
        stripe_service_1.stripeService.deleteCoupon(deletedCoupon === null || deletedCoupon === void 0 ? void 0 : deletedCoupon.stripeCouponId);
    }
    catch (error) {
        if (!deletedCoupon)
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to delete coupon, please try again later.");
    }
    await package_model_1.Package.updateMany({ isActive: true }, {
        discountPercent: 0,
        stripeCouponId: null,
    });
    return "Promotional offer deleted successfully.";
};
exports.packageService = {
    createPackage,
    getPackages,
    applyDiscount,
    updatePackage,
    togglePackage,
    deleteDiscount,
    getCoupon,
    getOfferData,
    deleteCoupon
};
