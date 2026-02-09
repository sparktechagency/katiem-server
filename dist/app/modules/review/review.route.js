"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRoutes = void 0;
const express_1 = __importDefault(require("express"));
const review_controller_1 = require("./review.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_1 = require("../../../enum/user");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const review_validation_1 = require("./review.validation");
const router = express_1.default.Router();
router.post('/', (0, auth_1.default)(user_1.USER_ROLES.EMPLOYER, user_1.USER_ROLES.WORKER), (0, validateRequest_1.default)(review_validation_1.ReviewValidations.create), review_controller_1.ReviewController.createReview);
router.get('/:id', (0, auth_1.default)(user_1.USER_ROLES.EMPLOYER, user_1.USER_ROLES.WORKER, user_1.USER_ROLES.GUEST), (0, validateRequest_1.default)(review_validation_1.ReviewValidations.getReview), review_controller_1.ReviewController.getAllReviews);
router.patch('/:id', (0, auth_1.default)(user_1.USER_ROLES.EMPLOYER, user_1.USER_ROLES.WORKER), (0, validateRequest_1.default)(review_validation_1.ReviewValidations.update), review_controller_1.ReviewController.updateReview);
router.delete('/:id', (0, auth_1.default)(user_1.USER_ROLES.EMPLOYER, user_1.USER_ROLES.WORKER), (0, validateRequest_1.default)(review_validation_1.ReviewValidations.deleteReview), review_controller_1.ReviewController.deleteReview);
exports.ReviewRoutes = router;
