"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clientreview = void 0;
const mongoose_1 = require("mongoose");
const clientreviewSchema = new mongoose_1.Schema({
    image: { type: String },
    name: { type: String },
    designation: { type: String },
    description: { type: String },
    rating: { type: Number },
}, {
    timestamps: true
});
exports.Clientreview = (0, mongoose_1.model)('Clientreview', clientreviewSchema);
