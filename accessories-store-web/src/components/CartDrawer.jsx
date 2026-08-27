import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUI } from "../context/UIContext";
import { useState, useEffect } from "react";
import { getShipping } from "../api/shipping";

function CartDrawer() {
  const { items, updateQuantity, removeItem, totalPrice, totalOriginalPrice } = useCart();
  const { cartOpen, closeCart } = useUI();
  const [shipping, setShipping] = useState({ shippingFee: 0, freeShippingThreshold: 0 });

  useEffect(() => {
    getShipping().then((res) => setShipping(res.data)).catch(() => {});
  }, []);

  const threshold = shipping.freeShippingThreshold;
  const remaining = threshold > 0 ? Math.max(0, threshold - totalPrice) : 0;
  const progressPct = threshold > 0 ? Math.min(100, (totalPrice / threshold) * 100) : 100;
  const qualifiesForFreeShipping = threshold > 0 && totalPrice >= threshold;

  return (
    <>
      {cartOpen && <div className="fixed inset-0 bg-espresso/40 z-40" onClick={closeCart} />}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-blush-50 shadow-xl transition-transform duration-300 flex flex-col ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="font-body text-lg font-extrabold tracking-[0.15em] uppercase text-espresso">
            Shopping Bag
          </h2>
          <button onClick={closeCart} className="p-1.5 rounded-full hover:bg-blush-100" aria-label="Close cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Free shipping progress */}
        {threshold > 0 && (
          <div className="px-6 py-4">
            <div className="bg-white rounded-2xl p-4">
              <p className="text-center text-sm text-espresso mb-3">
                {remaining > 0 ? (
                  <>You're <span className="font-semibold">LE {remaining.toFixed(2)}</span> away from Free Shipping!</>
                ) : (
                  <span className="font-semibold">You've unlocked Free Shipping!</span>
                )}
              </p>
              <div className="relative h-2 bg-nudepink-200 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-espresso rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 pt-5">
          {items.length === 0 ? (
            <p className="text-center text-muted py-16 text-sm">Your bag is empty.</p>
          ) : (
            <div className="space-y-5">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${item.imageUrl}`}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl bg-blush-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-espresso uppercase leading-snug">{item.name}</p>
                      {item.isOnSale ? (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-muted text-xs line-through">LE {item.originalPrice.toFixed(2)}</span>
                          <span className="text-sm text-rose-600 font-medium">LE {item.price.toFixed(2)}</span>
                        </div>
                      ) : (
                        <p className="text-sm text-espresso font-medium mt-1">LE {item.price.toFixed(2)}</p>
                      )}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-line rounded-full">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-espresso hover:bg-blush-100 rounded-l-full transition"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-sm text-espresso">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-espresso hover:bg-blush-100 rounded-r-full transition"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-muted hover:text-brick transition"
                        aria-label="Remove item"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
        <div className="border-t border-line px-6 py-5">
          <div className="flex items-start justify-between">
          <span className="text-xs font-semibold tracking-wide uppercase text-espresso pt-1">Subtotal</span>
          <div className="text-right leading-tight">
            {totalOriginalPrice > totalPrice && (
              <p className="text-muted text-xs line-through">LE {totalOriginalPrice.toFixed(2)}</p>
            )}
            <p className="text-espresso font-semibold text-base">LE {totalPrice.toFixed(2)}</p>
          </div>
        </div>
          <p className="text-xs text-muted leading-none mb-0.5">
            {qualifiesForFreeShipping
              ? "Free shipping applied."
              : shipping.shippingFee > 0
              ? `+ LE ${shipping.shippingFee.toFixed(2)} shipping at checkout.`
              : "Shipping calculated at checkout."}
          </p>
          <Link
            to="/checkout"
            onClick={closeCart}
            className="block text-center py-3.5 mt-4 rounded-full bg-espresso text-white text-sm font-semibold tracking-wide uppercase hover:opacity-90 transition"
          >
            Check Out
          </Link>
        </div>
      )}
      </div>
    </>
  );
}

export default CartDrawer;