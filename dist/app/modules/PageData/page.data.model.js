"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Section = exports.PageData = void 0;
const mongoose_1 = require("mongoose");
const page_data_interface_1 = require("./page.data.interface");
const pageSchema = new mongoose_1.Schema({
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: '' },
    sections: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Section' }],
}, { timestamps: true });
const sectionSchema = new mongoose_1.Schema({
    pageSlug: { type: String, required: true, index: true },
    sectionType: { type: String, enum: Object.values(page_data_interface_1.sectionTypeEnum), default: 'custom' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    images: { type: [String], default: [] },
    content: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    order: { type: Number, default: 0 },
}, { timestamps: true });
exports.PageData = (0, mongoose_1.model)('PageData', pageSchema);
exports.Section = (0, mongoose_1.model)('Section', sectionSchema);
