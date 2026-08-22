import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import { isFavorite, toggleFavorite } from "../utils/favorites";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const [fav, setFav] = useState(isFavorite(product.id));
  const [activeIndex, setActiveIndex] = useState(0);
  const { addItem } = useCart();
  const intervalRef = useRef(null);

  const images = [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...(product.imageUrls || []),
  ].filter((url, index, arr) => arr.indexOf(url) === index);

  const handleFav = (e) => {
    e.preventDefault();
    setFav(toggleFavorite(product.id).includes(product.id));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (product.stockQuantity === 0) return;
    addItem(product, 1);
  };

  const startCycle = () => {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 900);
  };

  const stopCycle = () => {
    clearInterval(intervalRef.current);
    setActiveIndex(0);
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block"
      onMouseEnter={startCycle}
      onMouseLeave={stopCycle}
    >
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-blush-100">
        {images.length > 0 ? (
          <img
            src={`https://localhost:7113${images[activeIndex]}`}
            alt={product.name}
            className="w-full h-full object-cover transition duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-sm">No image</div>
        )}

        {/* Sale / Out of Stock ribbon — same slot, out of stock takes priority */}
        {product.stockQuantity === 0 ? (
          <span className="absolute top-3 left-3 bg-espresso text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
            Out of Stock
          </span>
        ) : product.isOnSale && product.salePrice != null ? (
          <span className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
            Sale
          </span>
        ) : null}

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition ${
                  i === activeIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        <button
          onClick={handleFav}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-blush-100 transition"
          aria-label="Toggle favorite"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={fav ? "#A8896A" : "none"} stroke={fav ? "#A8896A" : "#7A6A5C"} strokeWidth="2">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" strokeLinejoin="round" />
          </svg>
        </button>

        {product.stockQuantity > 0 && (
          <button
            onClick={handleAdd}
            className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-blush-100 transition"
            aria-label="Add to cart"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 6h18M16 10a4 4 0 0 1-8 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      <div className="pt-3 text-center">
        <p className="text-espresso text-xs font-semibold tracking-wide uppercase">{product.name}</p>
        {product.isOnSale && product.salePrice ? (
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-muted text-sm line-through">LE {product.price.toFixed(2)}</p>
            <p className="text-rose-600 text-sm font-semibold">LE {product.salePrice.toFixed(2)}</p>
          </div>
        ) : (
          <p className="text-muted text-sm mt-1">LE {product.price.toFixed(2)}</p>
        )}
      </div>
    </Link>
  );
}

export default ProductCard;