import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUI } from "../context/UIContext";
import logo from "../assets/logo.png";

const HERO_IMAGE_URL = "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80";

function CheckoutHeader() {
  const { totalCount } = useCart();
  const { openCart } = useUI();

  return (
    <div className="relative h-14 overflow-hidden">
      <img
        src={HERO_IMAGE_URL}
        alt=""
        className="absolute inset-0 w-full h-full object-cover scale-110 blur-md"
      />
      <div className="absolute inset-0 bg-espresso/35" />

      <div className="relative h-full flex items-center justify-between px-4">
        <Link to="/">
          <img src={logo} alt="Nara Accessories" className="w-8 h-8 rounded-full object-cover border border-white/60" />
        </Link>

        <button onClick={openCart} className="relative text-white p-1.5" aria-label="Cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {totalCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export default CheckoutHeader;