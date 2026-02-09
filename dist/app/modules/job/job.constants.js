"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSetEqual = exports.jobSearchableFields = exports.jobFilterables = void 0;
// Filterable fields for Job
exports.jobFilterables = ['companyName', 'category', 'subCategory', 'latitude', 'radius', 'longitude', 'minSalary', 'maxSalary', 'minRating', 'maxRating', 'postDuration', 'salaryType'];
// Searchable fields for Job
exports.jobSearchableFields = ['companyName', 'category', 'subCategory', 'address', 'overview'];
// Helper function for set comparison
const isSetEqual = (setA, setB) => {
    if (setA.size !== setB.size)
        return false;
    for (const item of setA) {
        if (!setB.has(item))
            return false;
    }
    return true;
};
exports.isSetEqual = isSetEqual;
