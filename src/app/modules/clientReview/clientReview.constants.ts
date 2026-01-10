// Filterable fields for Clientreview
export const clientreviewFilterables = ['image', 'name', 'designation', 'description'];

// Searchable fields for Clientreview
export const clientreviewSearchableFields = ['image', 'name', 'designation', 'description'];

// Helper function for set comparison
export const isSetEqual = (setA: Set<string>, setB: Set<string>): boolean => {
  if (setA.size !== setB.size) return false;
  for (const item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
};