import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "../context/CartContext";
import { useUI } from "../context/UIContext";

function FavoritesDrawer() {
  const { favorites, removeFavorite } = useFavorites();
  const { addItem } = useCart();
  const { favoritesOpen, closeFavorites, openCart } = useUI();

  return (
    <>
      {favoritesOpen && <div className="fixed inset-0 bg-espresso/40 z-40" onClick={closeFavorites} />}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-blush-50 shadow-xl transition-transform duration-300 flex flex-col ${
          favoritesOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-line">
          <h2 className="font-body text-lg font-extrabold tracking-[0.15em] uppercase text-espresso">
            Wishlist
          </h2>
          <button onClick={closeFavorites} className="p-1.5 rounded-full hover:bg-blush-100" aria-label="Close wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {favorites.length === 0 ? (
            <p className="text-center text-muted py-16 text-sm">No favorites yet.</p>
          ) : (
            <div className="space-y-5">
              {favorites.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <Link to={`/products/${item.id}`} onClick={closeFavorites}>
                    <img
                      src={`${import.meta.env.VITE_API_URL}${item.imageUrl}`}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl bg-blush-100 shrink-0"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.id}`} onClick={closeFavorites}>
                      <p className="text-sm font-semibold text-espresso uppercase leading-snug">{item.name}</p>
                    </Link>
                    {item.isOnSale && item.salePrice ? (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-muted text-xs line-through">LE {item.price.toFixed(2)}</span>
                        <span className="text-rose-600 text-sm font-medium">LE {item.salePrice.toFixed(2)}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-espresso font-medium mt-1">LE {item.price.toFixed(2)}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                        <button
                        onClick={() => {
                            addItem(item, 1);
                            closeFavorites();
                            openCart();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-espresso text-white text-xs font-medium hover:opacity-90 transition"
                        >
                        Add to Cart
                        </button>
                      <button
                        onClick={() => removeFavorite(item.id)}
                        className="text-muted hover:text-brick transition"
                        aria-label="Remove from wishlist"
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
      </div>
    </>
  );
}

export default FavoritesDrawer;