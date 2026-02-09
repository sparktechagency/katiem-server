"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSetEqual = exports.messageSearchableFields = exports.messageFilterables = void 0;
// Filterable fields for Message
exports.messageFilterables = ['searchTerm', 'chat', 'reciever', 'type', 'isRead'];
// Searchable fields for Message
exports.messageSearchableFields = ['message'];
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
