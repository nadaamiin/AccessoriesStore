import { createContext, useContext, useState, useEffect } from "react";

const FavoritesContext = createContext(null);
const KEY = "favorites";

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(loadFavorites);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = (id) => favorites.some((f) => f.id === id);

  const toggleFavorite = (product) => {
    setFavorites((prev) =>
      prev.some((f) => f.id === product.id)
        ? prev.filter((f) => f.id !== product.id)
        : [...prev, {
            id: product.id,
            name: product.name,
            price: product.price,
            salePrice: product.salePrice,
            isOnSale: product.isOnSale,
            imageUrl: product.imageUrl,
            imageUrls: product.imageUrls,
          }]
    );
  };

  const removeFavorite = (id) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}