import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import MobileSidebar from "./MobileSidebar";
import logo from "../assets/logo.png";
import { useUI } from "../context/UIContext";
import { useSearch } from "../context/SearchContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/contact", label: "Contact" },
];

function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { totalCount } = useCart();
  const { openCart, openFavorites } = useUI();
  const { searchQuery, setSearchQuery, shouldFocusSearch, setShouldFocusSearch } = useSearch();  
  const navigate = useNavigate();  
  const location = useLocation();
  
  const desktopSearchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  
  const handleSearchChange = (value) => {
    setSearchQuery(value);

    if (location.pathname !== "/products") {
      setShouldFocusSearch(true);
      setMobileSearchOpen(true);
      navigate("/products");
    }
  };
  
  useEffect(() => {
    if (location.pathname === "/products" && shouldFocusSearch) {
      const input =
        mobileSearchInputRef.current || desktopSearchInputRef.current;

      if (input) {
        input.focus();

        const len = input.value.length;
        input.setSelectionRange(len, len);

        setShouldFocusSearch(false);
      }
    }
  }, [location.pathname, shouldFocusSearch, setShouldFocusSearch]);

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
                    isActive ? "text-espresso bg-nav" : "text-muted hover:text-espresso hover:bg-blush-100"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden sm:block w-36 md:w-48">
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" strokeLinecap="round" />
              </svg>
              <input
                ref={desktopSearchInputRef}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search…"
                className="w-full bg-blush-100 border border-transparent rounded-full pl-9 pr-3 py-1.5 text-sm text-espresso placeholder:text-muted/60 focus:outline-none focus:border-espresso focus:bg-white transition"
              />
            </div>

            <button
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="sm:hidden p-2.5 rounded-full hover:bg-blush-100 text-espresso"
              aria-label="Search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" strokeLinecap="round" />
              </svg>
            </button>

            <button onClick={openFavorites} className="p-2.5 rounded-full hover:bg-blush-100 text-espresso" aria-label="Wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" strokeLinejoin="round" />
              </svg>
            </button>

            <button onClick={openCart} className="relative p-2.5 rounded-full hover:bg-blush-100 text-espresso" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {mobileSearchOpen && (
          <div className="sm:hidden border-t border-blush-200 px-4 py-3">
            <div className="relative">
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" strokeLinecap="round" />
              </svg>
              <input
                ref={mobileSearchInputRef}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search products…"
                className="w-full bg-blush-100 border border-transparent rounded-full pl-9 pr-3 py-2 text-sm text-espresso placeholder:text-muted/60 focus:outline-none focus:border-espresso focus:bg-white transition"
              />
            </div>
          </div>
        )}
      </header>

      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

export default Navbar;