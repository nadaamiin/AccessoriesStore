import { createContext, useContext, useState, useEffect } from "react";
import { validateProducts } from "../api/products";

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
  const [removedNotice, setRemovedNotice] = useState([]);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const currentFavorites = loadFavorites();
    if (currentFavorites.length === 0) return;

    const ids = currentFavorites.map((f) => f.id);

    validateProducts(ids)
      .then((res) => {
        const statusMap = new Map(res.data.map((p) => [p.id, p]));
        const removedNames = [];

        setFavorites((prev) =>
          prev
            .map((item) => {
              const status = statusMap.get(item.id);
              if (!status || !status.isActive) {
                removedNames.push(item.name);
                return null;
              }
              return {
                ...item,
                price: status.price,
                salePrice: status.salePrice,
                isOnSale: status.isOnSale,
                stockQuantity: status.stockQuantity,
              };
            })
            .filter(Boolean)
        );

        if (removedNames.length > 0) {
          setRemovedNotice(removedNames.map((n) => `${n} is no longer available and was removed from your wishlist.`));
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearRemovedNotice = () => setRemovedNotice([]);

  const isFavorite = (id) => favorites.some((f) => f.id === id);

  const toggleFavorite = (product) => {
    setFavorites((prev) =>
      prev.some((f) => f.id === product.id)
        ? prev.filter((f) => f.id !== product.id)
        : [
            ...prev,
            {
              id: product.id,
              name: product.name,
              price: product.price,
              salePrice: product.salePrice,
              isOnSale: product.isOnSale,
              imageUrl: product.imageUrl,
              imageUrls: product.imageUrls,
              stockQuantity: product.stockQuantity,
            },
          ]
    );
  };

  const removeFavorite = (id) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, toggleFavorite, removeFavorite, removedNotice, clearRemovedNotice }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}