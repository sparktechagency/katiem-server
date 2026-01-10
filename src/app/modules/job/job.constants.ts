// Filterable fields for Job
export const jobFilterables = ['companyName', 'category', 'subCategory', 'latitude', 'radius', 'longitude', 'minSalary', 'maxSalary', 'minRating', 'maxRating', 'postDuration', 'salaryType'];

// Searchable fields for Job
export const jobSearchableFields = ['companyName', 'category', 'subCategory', 'address', 'overview'];

// Helper function for set comparison
export const isSetEqual = (setA: Set<string>, setB: Set<string>): boolean => {
  if (setA.size !== setB.size) return false;
  for (const item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
};

