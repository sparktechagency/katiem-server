"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSetEqual = exports.clientreviewSearchableFields = exports.clientreviewFilterables = void 0;
// Filterable fields for Clientreview
exports.clientreviewFilterables = ['image', 'name', 'designation', 'description'];
// Searchable fields for Clientreview
exports.clientreviewSearchableFields = ['image', 'name', 'designation', 'description'];
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
