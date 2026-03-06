"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSetEqual = exports.bookingSearchableFields = exports.bookingFilterables = void 0;
// Filterable fields for Booking
exports.bookingFilterables = [];
// Searchable fields for Booking
exports.bookingSearchableFields = [];
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
