import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import MobileSidebar from "./MobileSidebar";
import logo from "../assets/logo.png";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { totalCount } = useCart();

  return (
    <>
      <header className="bg-blush-50/95 backdrop-blur sticky top-0 z-30 shadow-sm">
        <div className="px-4 md:px-8 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-full hover:bg-blush-100"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>

          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="Nara Accessories" className="w-10 h-10 rounded-full object-cover" />
            <div className="leading-tight hidden sm:block">
              <p className="font-display text-lg text-espresso">Nara</p>
              <p className="text-[9px] tracking-[0.2em] uppercase text-muted -mt-0.5">Accessories</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-full text-sm font-medium transition ${
                    isActive ? "text-espresso bg-nudepink-300/50" : "text-muted hover:text-espresso hover:bg-blush-100"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Link to="/favorites" className="p-2.5 rounded-full hover:bg-blush-100 text-espresso" aria-label="Wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link to="/cart" className="relative p-2.5 rounded-full hover:bg-blush-100 text-espresso" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

export default Navbar;