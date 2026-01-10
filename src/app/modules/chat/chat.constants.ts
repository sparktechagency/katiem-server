import { IChatFilterables } from "./chat.interface";

// Filterable fields for Chat
export const chatFilterables: (keyof IChatFilterables)[] = ['searchTerm'];

// Searchable fields for Chat
export const chatSearchableFields = [];

// Helper function for set comparison
export const isSetEqual = (setA: Set<string>, setB: Set<string>): boolean => {
  if (setA.size !== setB.size) return false;
  for (const item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
};