"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs').promises;
const path_1 = __importDefault(require("path"));
async function removeFile(filename) {
    if (!filename)
        return;
    // Remove leading '/images/' if included
    const cleanedName = filename.replace(/^\/?images\//, '');
    const filePath = path_1.default.join(process.cwd(), 'uploads', 'images', cleanedName);
    try {
        await fs.unlink(filePath);
        console.log(`Deleted image: ${cleanedName}`);
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            console.warn(`File not found: ${cleanedName}`);
        }
        else {
            console.error(`Error deleting file ${cleanedName}:`, err);
        }
    }
}
exports.default = removeFile;
