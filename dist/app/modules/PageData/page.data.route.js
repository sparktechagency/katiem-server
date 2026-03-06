"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_1 = require("../../../enum/user");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const page_data_validation_1 = require("./page.data.validation");
const page_data_controller_1 = require("./page.data.controller");
const processReqBody_1 = require("../../middleware/processReqBody");
const router = (0, express_1.Router)();
// Section routes
router.post('/section', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), (0, processReqBody_1.fileAndBodyProcessorUsingDiskStorage)(), (0, validateRequest_1.default)(page_data_validation_1.createSectionSchema), page_data_controller_1.SectionController.createSection);
router.get('/section/:pageSlug', page_data_controller_1.SectionController.getSectionsByPage);
router.get('/section/slug/:slug', page_data_controller_1.SectionController.getSectionBySlug);
router.patch('/section/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), (0, processReqBody_1.fileAndBodyProcessorUsingDiskStorage)(), (0, validateRequest_1.default)(page_data_validation_1.updateSectionSchema), page_data_controller_1.SectionController.updateSection);
router.delete('/section/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), page_data_controller_1.SectionController.deleteSection);
exports.ContentRoutes = router;
