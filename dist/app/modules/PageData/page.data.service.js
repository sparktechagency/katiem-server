"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const page_data_model_1 = require("./page.data.model");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const remove_1 = __importDefault(require("../../../helpers/image/remove"));
exports.SectionService = {
    createSection: async (payload) => {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            if (!payload.pageSlug) {
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'pageSlug is required');
            }
            // 1️⃣ Check if page exists
            let page = await page_data_model_1.PageData.findOne({ slug: payload.pageSlug }).session(session);
            // 2️⃣ Create page automatically if it doesn't exist
            if (!page) {
                const [createdPage] = await page_data_model_1.PageData.create([
                    {
                        slug: payload.pageSlug,
                        name: payload.pageSlug,
                        sections: [],
                    },
                ], { session });
                page = createdPage; // create returns array when using session
            }
            // 3️⃣ Create section
            const section = await page_data_model_1.Section.create([payload], { session });
            const createdSection = section[0];
            // 4️⃣ Add section reference to page
            page.sections.push(createdSection._id);
            await page.save({ session });
            // Commit transaction
            await session.commitTransaction();
            return createdSection;
        }
        catch (error) {
            // Rollback transaction
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    },
    deleteSection: async (id) => {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const section = await page_data_model_1.Section.findByIdAndDelete(id).session(session);
            if (!section)
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Section not found');
            // Remove reference from page
            await page_data_model_1.PageData.updateMany({ sections: id }, { $pull: { sections: id } }, { session });
            await session.commitTransaction();
            //remove images also 
            if (section.images && section.images.length > 0) {
                section.images.forEach(async (image) => {
                    await (0, remove_1.default)(image);
                });
            }
            return 'Section deleted successfully';
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    },
    getSectionsByPage: async (pageSlug) => {
        const sections = await page_data_model_1.PageData.findOne({ slug: pageSlug })
            .populate('sections')
            .lean();
        return (sections === null || sections === void 0 ? void 0 : sections.sections) || [];
    },
    updateSection: async (id, payload) => {
        // ... existing code
        const section = await page_data_model_1.Section.findByIdAndUpdate(id, payload, {
            // new: true,
            runValidators: true,
        });
        if (!section)
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Section not found');
        return 'Section updated successfully';
    },
    getSectionBySlug: async (slug) => {
        const section = await page_data_model_1.Section.findOne({ sectionType: slug }).lean();
        return section || {};
    },
};
