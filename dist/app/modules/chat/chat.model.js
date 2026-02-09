"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
const mongoose_1 = require("mongoose");
const chatSchema = new mongoose_1.Schema({
    chatKey: { type: String, required: true, unique: true, index: true },
    participants: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'User',
        populate: {
            path: 'participants',
            select: 'name profile email phone rating reviewCount isAccountVerified',
        },
        required: true,
        validate: {
            validator: (v) => v.length === 2,
            message: 'Chat must have exactly two participants',
        },
    },
    latestMessage: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Message',
        populate: {
            path: 'latestMessage',
            select: 'message files type isRead createdAt updatedAt',
        },
    },
}, {
    timestamps: true,
});
exports.Chat = (0, mongoose_1.model)('Chat', chatSchema);
