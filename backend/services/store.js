// Simple in-memory fallback store used when MongoDB is unavailable.
export const memory = {
  savedPapers: [],
  notes: [],
  readingLists: [],
  searchHistory: [],
};

let idCounter = 1;
export function nextId() {
  return String(idCounter++);
}
