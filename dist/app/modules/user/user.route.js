"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_1 = require("../../../enum/user");
const processReqBody_1 = require("../../middleware/processReqBody");
const router = express_1.default.Router();
router.patch('/profile', (0, auth_1.default)(user_1.USER_ROLES.WORKER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.EMPLOYER), (0, processReqBody_1.fileAndBodyProcessorUsingDiskStorage)(), (0, validateRequest_1.default)(user_validation_1.UserValidations.updateUserZodSchema), user_controller_1.UserController.updateProfile);
router.post('/upload-images', (0, auth_1.default)(user_1.USER_ROLES.WORKER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.EMPLOYER), (0, processReqBody_1.fileAndBodyProcessorUsingDiskStorage)(), (0, validateRequest_1.default)(user_validation_1.UserValidations.uploadImagesZodSchema), user_controller_1.UserController.uploadImages);
router.get('/workers', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.EMPLOYER, user_1.USER_ROLES.GUEST), 
// validateRequest(UserValidations.getWorkersZodSchema),
user_controller_1.UserController.getWorkers);
router.get('/profile', (0, auth_1.default)(user_1.USER_ROLES.WORKER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.EMPLOYER, user_1.USER_ROLES.GUEST), user_controller_1.UserController.getUserProfile);
router.get('/workers/:workerId', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.EMPLOYER, user_1.USER_ROLES.GUEST), user_controller_1.UserController.getSingleWorker);
exports.UserRoutes = router;
