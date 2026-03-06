"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSetEqual = exports.chatSearchableFields = exports.chatFilterables = void 0;
// Filterable fields for Chat
exports.chatFilterables = ['searchTerm'];
// Searchable fields for Chat
exports.chatSearchableFields = [];
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
