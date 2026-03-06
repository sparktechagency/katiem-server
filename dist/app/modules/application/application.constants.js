"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSetEqual = exports.applicationSearchableFields = exports.applicationFilterables = void 0;
// Filterable fields for Application
exports.applicationFilterables = ['searchTerm', 'status'];
// Searchable fields for Application
exports.applicationSearchableFields = [];
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
