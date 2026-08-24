import { Link } from "react-router-dom";
import { useUI } from "../context/UIContext";
import logo from "../assets/logo.png";
import bgImage from "../assets/bg.png";

function CheckoutHeader() {
  const { openCart } = useUI();

  const handleCartClick = () => {  
    openCart();  
  };

  return (
    <div className="relative h-14 overflow-hidden">
      <img
        src={bgImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover scale-100 blur-sm"
      />
      <div className="absolute inset-0 bg-espresso/35" />

      <div className="relative h-full flex items-center justify-between px-4">
        <Link to="/">
          <img src={logo} alt="Nara Accessories" className="w-8 h-8 rounded-full object-cover border border-white/60" />
        </Link>

        <button onClick={handleCartClick} className="text-white p-1.5" aria-label="Cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default CheckoutHeader;