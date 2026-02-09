"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    chat: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Chat' },
    receiver: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', populate: { path: 'reciever', select: 'name profile email phone rating reviewCount isAccountVerified deviceToken' } },
    message: { type: String },
    files: { type: [String] },
    type: { type: String, enum: ['text', 'file', 'both'], default: 'text' },
    isRead: { type: Boolean, default: false },
}, {
    timestamps: true
});
exports.Message = (0, mongoose_1.model)('Message', messageSchema);
