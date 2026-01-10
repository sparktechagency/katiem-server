
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { stripeService } from "../stripe/stripe.service";
import { ICoupon, IPackage } from "./package.interface";
import { Coupon, Package } from "./package.model";



const createPackage = async (payload: IPackage) => {
  // Check for duplicate package type
  const existingPackage = await Package.findOne({ type: payload.type });
  if (existingPackage) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      `A package with type "${payload.type}" already exists.`
    );
  }

  // Set default discountPercent if not provided
  payload.discountPercent = payload.discountPercent ?? 0;

  let stripeProduct;
  let stripePrice;

  try {
    stripeProduct = await stripeService.createProduct(payload.type, payload.description);

    payload.stripeProductId = stripeProduct.id;
    stripePrice = await stripeService.createPrice(payload);
    payload.stripePriceId = stripePrice.id;

    // Save package to db
    const createdPackage = await Package.create(payload);

    return createdPackage;

  } catch (error) {
    console.error('Error creating package:', error);
    // Rollback Stripe resources on failure
    if (stripeProduct) {
      await stripeService.deleteProduct(stripeProduct.id).catch(() => { });
    }
    if (stripePrice) {
      await stripeService.deletePrice(stripePrice.id).catch(() => { });
    }
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Failed to create package. Please try again.`
    );
  }
}

const updatePackage = async (packageId: string, payload: Pick<IPackage, 'type' | 'description' | 'isInstantBooking' | 'limits' | 'features'>) => {
  const result = await Package.findByIdAndUpdate(packageId, payload, { new: true, runValidators: true });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
  }

  // Sync with Stripe (non-critical, log errors but don't fail)
  try {
    await stripeService.updateProduct(result.stripeProductId, result.type, result.description);
  } catch (error) {
    console.error('Failed to sync package update with Stripe:', error);
  }

  return result;
}

const getPackages = async () => {
  return await Package.find({ isActive: true });
}

const applyDiscount = async (payload: Pick<ICoupon, "percent_off" | "description">) => {
  const { percent_off: discountPercent } = payload;


  if (discountPercent === 0) {
    await Package.updateMany({}, { discountPercent: 0, couponId: null });
    return { message: "Global discount removed" };
  }

  const couponId = `GLOBAL_OFF_${discountPercent}`;


  let stripeCoupon;
  try {
    stripeCoupon = await stripeService.retrieveCoupon(couponId);

  } catch {
    stripeCoupon = await stripeService.createCoupon(couponId, discountPercent);


  }

  let localCoupon = await Coupon.findOne({});
  if (!localCoupon) {
    localCoupon = await Coupon.create({
      description: payload.description,
      percent_off: discountPercent,
      stripeCouponId: couponId,
    });
  } else {
    localCoupon.percent_off = discountPercent;
    localCoupon.stripeCouponId = couponId
    localCoupon.description = payload.description
    await localCoupon.save();
  }

  await Package.updateMany(
    { isActive: true },
    {
      discountPercent,
      stripeCouponId: couponId,
    }
  );

  return {
    message: `Global discount of ${discountPercent}% applied successfully`,
  };
};



const togglePackage = async (packageId: string) => {
  // Find the package first to check current state
  const pkg = await Package.findById(packageId);
  if (!pkg) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
  }

  // Toggle the isActive status
  const result = await Package.findByIdAndUpdate(
    packageId,
    { isActive: !pkg.isActive },
    { new: true, runValidators: true }
  );

  return {
    message: `Package ${result?.isActive ? 'activated' : 'deactivated'} successfully`,
    package: result
  };
}

const deleteDiscount = async (couponId: string) => {
  try {

    await stripeService.deleteCoupon(couponId);
  } catch (err) {
    console.log("Coupon cannot be deleted from Stripe, disabling instead.");
  }

  // Remove discount from all packages
  await Package.updateMany(
    {},
    {
      discountPercent: 0,
      stripeCouponId: null,
    }
  );

  // Optional: Remove or archive local coupon record
  await Coupon.deleteOne({ stripeCouponId: couponId });

  return { message: "Global discount removed successfully." };
};

const getCoupon = async () => {
  return await Coupon.findOne({}) || {};
}

const getOfferData = async () => {
  const coupon = await Coupon.findOne().select('-stripeCouponId').lean()
  return coupon || {}
}

const deleteCoupon = async (id: string) => {
  const deletedCoupon = await Coupon.findByIdAndDelete(id);

  if (!deletedCoupon) throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete coupon, please try again later.")

  try {
    stripeService.deleteCoupon(deletedCoupon?.stripeCouponId);
  } catch (error) {
    if (!deletedCoupon) throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete coupon, please try again later.")

  }
  await Package.updateMany(
    { isActive: true },
    {
      discountPercent: 0,
      stripeCouponId: null,
    }
  );
  return "Promotional offer deleted successfully."
}

export const packageService = {
  createPackage,
  getPackages,
  applyDiscount,
  updatePackage,
  togglePackage,
  deleteDiscount,
  getCoupon,
  getOfferData,
  deleteCoupon
}