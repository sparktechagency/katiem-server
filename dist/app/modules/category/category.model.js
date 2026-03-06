"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    title: { type: String },
    icon: { type: String, default: '' },
    subCategories: { type: [String] },
}, {
    timestamps: true
});
exports.Category = (0, mongoose_1.model)('Category', categorySchema);
