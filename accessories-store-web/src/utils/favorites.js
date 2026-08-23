// const KEY = "favoriteProductIds";

// export function getFavorites() {
//   try {
//     return JSON.parse(localStorage.getItem(KEY)) || [];
//   } catch {
//     return [];
//   }
// }

// export function toggleFavorite(id) {
//   const current = getFavorites();
//   const next = current.includes(id)
//     ? current.filter((f) => f !== id)
//     : [...current, id];
//   localStorage.setItem(KEY, JSON.stringify(next));
//   return next;
// }

// export function isFavorite(id) {
//   return getFavorites().includes(id);
// }