"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const page_data_service_1 = require("./page.data.service");
exports.SectionController = {
    createSection: (0, catchAsync_1.default)(async (req, res) => {
        const section = await page_data_service_1.SectionService.createSection(req.body);
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_codes_1.StatusCodes.CREATED,
            success: true,
            message: 'Section created successfully',
            data: section,
        });
    }),
    getSectionsByPage: (0, catchAsync_1.default)(async (req, res) => {
        const sections = await page_data_service_1.SectionService.getSectionsByPage(req.params.pageSlug);
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            message: 'Sections retrieved successfully',
            data: sections,
        });
    }),
    updateSection: (0, catchAsync_1.default)(async (req, res) => {
        const section = await page_data_service_1.SectionService.updateSection(req.params.id, req.body);
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            message: 'Section updated successfully',
            data: section,
        });
    }),
    deleteSection: (0, catchAsync_1.default)(async (req, res) => {
        const message = await page_data_service_1.SectionService.deleteSection(req.params.id);
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            message: 'Section deleted successfully',
            data: message,
        });
    }),
    getSectionBySlug: (0, catchAsync_1.default)(async (req, res) => {
        const section = await page_data_service_1.SectionService.getSectionBySlug(req.params.slug);
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            message: 'Section retrieved successfully',
            data: section,
        });
    }),
};
