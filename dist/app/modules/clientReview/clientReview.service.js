"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientreviewServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const mongoose_1 = require("mongoose");
const clientReview_model_1 = require("./clientReview.model");
const remove_1 = __importDefault(require("../../../helpers/image/remove"));
const createClientreview = async (payload) => {
    //make sure only 3 reviews are allowed
    const existingReviews = await clientReview_model_1.Clientreview.find({});
    if (existingReviews.length >= 3) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Only 3 reviews are allowed, please try updating existing reviews.');
    }
    const result = await clientReview_model_1.Clientreview.create(payload);
    if (!result) {
        (0, remove_1.default)(payload.image);
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create Clientreview, please try again with valid data.');
    }
    return 'Review Created Successfully.';
};
const getAllClientreviews = async () => {
    const result = await clientReview_model_1.Clientreview.find({});
    return result;
};
const updateClientreview = async (id, payload) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Clientreview ID');
    }
    const result = await clientReview_model_1.Clientreview.findByIdAndUpdate(new mongoose_1.Types.ObjectId(id), { $set: payload }, {
        runValidators: true,
    });
    if (payload.image !== (result === null || result === void 0 ? void 0 : result.image) && (result === null || result === void 0 ? void 0 : result.image)) {
        (0, remove_1.default)(result === null || result === void 0 ? void 0 : result.image);
    }
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested clientreview not found, please try again with valid id');
    }
    return 'Review updated successfully.';
};
exports.ClientreviewServices = {
    createClientreview,
    getAllClientreviews,
    updateClientreview,
};
