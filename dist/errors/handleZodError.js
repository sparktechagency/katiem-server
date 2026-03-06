"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleZodError = (error) => {
    const errors = error.issues.map((issue) => {
        if ((issue === null || issue === void 0 ? void 0 : issue.code) === 'invalid_type') {
            return {
                path: issue === null || issue === void 0 ? void 0 : issue.path[issue.path.length - 1],
                message: `${issue === null || issue === void 0 ? void 0 : issue.path[issue.path.length - 1]} must be a ${issue === null || issue === void 0 ? void 0 : issue.expected}`,
            };
        }
        return {
            path: issue === null || issue === void 0 ? void 0 : issue.path[issue.path.length - 1],
            message: issue === null || issue === void 0 ? void 0 : issue.message,
        };
    });
    const statusCode = 400;
    return {
        statusCode,
        message: 'Validation Error',
        errorMessages: errors,
    };
};
exports.default = handleZodError;
