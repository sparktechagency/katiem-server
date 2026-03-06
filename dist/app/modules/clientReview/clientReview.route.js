"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientreviewRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_1 = require("../../../enum/user");
const processReqBody_1 = require("../../middleware/processReqBody");
const clientReview_controller_1 = require("./clientReview.controller");
const clientReview_validation_1 = require("./clientReview.validation");
const router = express_1.default.Router();
router.get('/', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.GUEST, user_1.USER_ROLES.EMPLOYER, user_1.USER_ROLES.WORKER), clientReview_controller_1.ClientreviewController.getAllClientreviews);
router.post('/', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), (0, processReqBody_1.fileAndBodyProcessorUsingDiskStorage)(), (0, validateRequest_1.default)(clientReview_validation_1.ClientreviewValidations.create), clientReview_controller_1.ClientreviewController.createClientreview);
router.patch('/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), (0, processReqBody_1.fileAndBodyProcessorUsingDiskStorage)(), (0, validateRequest_1.default)(clientReview_validation_1.ClientreviewValidations.update), clientReview_controller_1.ClientreviewController.updateClientreview);
exports.ClientreviewRoutes = router;
