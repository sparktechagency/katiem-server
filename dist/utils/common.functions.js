"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationMessage = exports.hideUserSensitiveInformation = void 0;
const status_1 = require("../enum/status");
const hideUserSensitiveInformation = (item) => {
    const userFields = ["applicant", "employer", "worker"];
    for (const field of userFields) {
        const user = item[field];
        if (!user || typeof user !== "object" || !user._id)
            continue;
        user.phone = "";
        user.email = "";
    }
    return item;
};
exports.hideUserSensitiveInformation = hideUserSensitiveInformation;
const getNotificationMessage = (from, type, job, status) => {
    if (type === "booking") {
        if (status === status_1.BOOKING_STATUS.APPROVED) {
            return `Your booking request to ${from === null || from === void 0 ? void 0 : from.name} has been approved. You can now contact the worker.`;
        }
        if (status === status_1.BOOKING_STATUS.DECLINED) {
            return `Your booking request to ${from === null || from === void 0 ? void 0 : from.name} has been declined. Please try booking with a different worker.`;
        }
        return ``;
    }
    if (type === "application") {
        if (status === status_1.APPLICATION_STATUS.APPROVED) {
            return `Your job application for ${job === null || job === void 0 ? void 0 : job.title} has been approved. You can now contact the employer.`;
        }
        if (status === status_1.APPLICATION_STATUS.DECLINED) {
            return `Your job application for ${job === null || job === void 0 ? void 0 : job.title} has been declined. Please try applying for a different job.`;
        }
        return `You have a new job application request from ${from === null || from === void 0 ? void 0 : from.name} for ${job === null || job === void 0 ? void 0 : job.title}`;
    }
    return '';
};
exports.getNotificationMessage = getNotificationMessage;
