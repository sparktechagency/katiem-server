"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSectionSchema = exports.createSectionSchema = exports.updatePageSchema = exports.createPageSchema = void 0;
const zod_1 = require("zod");
const page_data_interface_1 = require("./page.data.interface");
// Enum helper
const SectionTypeEnum = zod_1.z.enum([
    page_data_interface_1.sectionTypeEnum.HERO,
    page_data_interface_1.sectionTypeEnum.HOW_IT_WORKS,
    page_data_interface_1.sectionTypeEnum.HOW_IT_WORKS_WORKER,
    page_data_interface_1.sectionTypeEnum.JOB_RESPONSE,
    page_data_interface_1.sectionTypeEnum.WHY_US,
    page_data_interface_1.sectionTypeEnum.WHO_WE_ARE,
    page_data_interface_1.sectionTypeEnum.OUR_MISSION,
    page_data_interface_1.sectionTypeEnum.OUR_VISION,
    page_data_interface_1.sectionTypeEnum.WHERE_WE_OPERATE,
    page_data_interface_1.sectionTypeEnum.ABOUT_HERO,
    page_data_interface_1.sectionTypeEnum.ABOUT_WHY_US,
    page_data_interface_1.sectionTypeEnum.CONTACT_US,
    page_data_interface_1.sectionTypeEnum.CUSTOM,
]);
// =====================
// Page validation schema
// =====================
exports.createPageSchema = zod_1.z.object({
    body: zod_1.z.object({
        slug: zod_1.z.string().min(3, 'Slug must be at least 3 characters'),
        name: zod_1.z.string().min(1, 'Page name is required'),
        sections: zod_1.z.array(zod_1.z.string()).optional(), // Optional: section IDs
    }),
});
exports.updatePageSchema = zod_1.z.object({
    body: zod_1.z.object({
        slug: zod_1.z.string().min(3).optional(),
        name: zod_1.z.string().optional(),
        sections: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
// ========================
// Section validation schema
// ========================
exports.createSectionSchema = zod_1.z.object({
    body: zod_1.z.object({
        pageSlug: zod_1.z.string().min(3, 'Page slug is required'), // must exist in your DB (check in controller)
        sectionType: SectionTypeEnum,
        title: zod_1.z.string().min(1, 'Title is required'),
        description: zod_1.z.string().optional(),
        images: zod_1.z.array(zod_1.z.string()).optional(),
        content: zod_1.z.any().optional(),
        order: zod_1.z.number().min(0).optional(),
    }),
});
exports.updateSectionSchema = zod_1.z.object({
    body: zod_1.z.object({
        pageSlug: zod_1.z.string().min(3).optional(), // optional during update
        sectionType: SectionTypeEnum.optional(),
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        images: zod_1.z.array(zod_1.z.string()).optional(),
        content: zod_1.z.any().optional(),
        order: zod_1.z.number().min(0).optional(),
    }),
});
