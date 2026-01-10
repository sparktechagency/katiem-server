import { Router } from "express";
import { PackageController } from "./package.controller";
import auth from "../../middleware/auth";
import { USER_ROLES } from "../../../enum/user";
import validateRequest from "../../middleware/validateRequest";
import { packageValidationSchema } from "./package.validation";

const router = Router();

router.get('/', PackageController.getPackages);
router.post('/', auth(USER_ROLES.ADMIN), validateRequest(packageValidationSchema.createPackageValidationSchema), PackageController.createPackage);
router.post('/toggle/:packageId', auth(USER_ROLES.ADMIN), validateRequest(packageValidationSchema.togglePackageValidationSchema), PackageController.togglePackage);
router.get('/coupon', auth(USER_ROLES.ADMIN), PackageController.getCoupon);
router.get('/offer-data', auth(USER_ROLES.GUEST, USER_ROLES.EMPLOYER), PackageController.getOfferData)
router.patch('/:packageId', auth(USER_ROLES.ADMIN), validateRequest(packageValidationSchema.updatePackageValidationSchema), PackageController.updatePackage);
router.post('/apply-discount', auth(USER_ROLES.ADMIN), validateRequest(packageValidationSchema.applyDiscountValidationSchema), PackageController.applyDiscount);
router.delete('/coupon/:id', auth(USER_ROLES.ADMIN), PackageController.deleteCoupon);

export const PackageRoutes = router;
