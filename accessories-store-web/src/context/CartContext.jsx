import { createContext, useContext, useState, useEffect } from "react";
import { validateProducts } from "../api/products";

const CartContext = createContext(null);
const KEY = "cart";

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [removedNotice, setRemovedNotice] = useState([]);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  // Reconcile cart against current product status once on mount
  useEffect(() => {
    const currentItems = loadCart();
    if (currentItems.length === 0) return;

    const ids = currentItems.map((i) => i.productId);

    validateProducts(ids)
      .then((res) => {
        const statusMap = new Map(res.data.map((p) => [p.id, p]));
        const removedNames = [];
        const adjustedNames = [];

        setItems((prev) =>
          prev
            .map((item) => {
              const status = statusMap.get(item.productId);

              if (!status || !status.isActive || status.stockQuantity === 0) {
                removedNames.push(item.name);
                return null;
              }

              if (status.stockQuantity < item.quantity) {
                adjustedNames.push(`${item.name} (only ${status.stockQuantity} left)`);
                return { ...item, quantity: status.stockQuantity };
              }

              // keep price/sale info in sync too, in case it changed
              const effectivePrice = status.isOnSale && status.salePrice ? status.salePrice : status.price;
              return {
                ...item,
                price: effectivePrice,
                originalPrice: status.price,
                isOnSale: !!(status.isOnSale && status.salePrice),
              };
            })
            .filter(Boolean)
        );

        const notices = [
          ...removedNames.map((n) => `${n} is no longer available and was removed from your bag.`),
          ...adjustedNames.map((n) => `${n} — quantity updated.`),
        ];
        if (notices.length > 0) setRemovedNotice(notices);
      })
      .catch(() => {
        // fail silently — don't block cart rendering if validation fails
      });
    // run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearRemovedNotice = () => setRemovedNotice([]);

  const addItem = (product, quantity = 1) => {
    const effectivePrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: effectivePrice,
          originalPrice: product.price,
          isOnSale: !!(product.isOnSale && product.salePrice),
          imageUrl: product.imageUrl,
          quantity,
        },
      ];
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) return removeItem(productId);
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalOriginalPrice = items.reduce((sum, i) => sum + (i.originalPrice ?? i.price) * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        totalPrice,
        totalOriginalPrice,
        removedNotice,
        clearRemovedNotice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}