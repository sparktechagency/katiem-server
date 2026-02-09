"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    to: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', populate: { path: 'to', select: 'name profile email phone rating reviewCount isAccountVerified deviceToken' } },
    from: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', populate: { path: 'from', select: 'name profile email phone rating reviewCount isAccountVerified deviceToken' } },
    title: { type: String, default: "" },
    body: { type: String, default: "" },
    isRead: { type: Boolean },
    isAdmin: { type: Boolean, default: false },
}, {
    timestamps: true,
});
exports.Notification = (0, mongoose_1.model)('Notification', notificationSchema);
