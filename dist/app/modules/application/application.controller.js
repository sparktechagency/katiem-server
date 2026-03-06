"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationController = void 0;
const application_service_1 = require("./application.service");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const pick_1 = __importDefault(require("../../../shared/pick"));
const application_constants_1 = require("./application.constants");
const pagination_1 = require("../../../interfaces/pagination");
const createApplication = (0, catchAsync_1.default)(async (req, res) => {
    const { jobId } = req.params;
    const result = await application_service_1.ApplicationServices.createApplication(req.user, jobId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Application created successfully',
        data: result,
    });
});
const updateApplication = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const applicationData = req.body;
    const result = await application_service_1.ApplicationServices.updateApplication(req.user, id, applicationData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Application updated successfully',
        data: result,
    });
});
const getSingleApplication = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await application_service_1.ApplicationServices.getSingleApplication(req.user, id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Application retrieved successfully',
        data: result,
    });
});
const getAllApplications = (0, catchAsync_1.default)(async (req, res) => {
    const { jobId } = req.params;
    const filterables = (0, pick_1.default)(req.query, application_constants_1.applicationFilterables);
    const pagination = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const result = await application_service_1.ApplicationServices.getAllApplications(req.user, filterables, pagination, jobId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Applications retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});
const deleteApplication = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await application_service_1.ApplicationServices.deleteApplication(req.user, id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Application deleted successfully',
        data: result,
    });
});
const getApplicationListForWorker = (0, catchAsync_1.default)(async (req, res) => {
    const result = await application_service_1.ApplicationServices.getApplicationListForWorker(req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Application list retrieved successfully',
        data: result,
    });
});
const getApplicationListForWorkerWithDetails = (0, catchAsync_1.default)(async (req, res) => {
    const result = await application_service_1.ApplicationServices.getApplicationListForWorkerWithDetails(req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Application list with details retrieved successfully',
        data: result,
    });
});
exports.ApplicationController = {
    createApplication,
    updateApplication,
    getSingleApplication,
    getAllApplications,
    deleteApplication,
    getApplicationListForWorker,
    getApplicationListForWorkerWithDetails
};
