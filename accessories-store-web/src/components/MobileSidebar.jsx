import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories } from "../api/categories";
import logo from "../assets/logo.png";
import { useUI } from "../context/UIContext";

function MobileSidebar({ open, onClose }) {
  const [categories, setCategories] = useState([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const navigate = useNavigate();
  const { openFavorites, openCart } = useUI();

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const go = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-espresso/40 z-40 md:hidden" onClick={onClose} />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-blush-50 shadow-xl transition-transform duration-300 md:hidden flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-blush-100" aria-label="Close menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
        <img src={logo} alt="Nara Accessories" className="w-10 h-10 rounded-full object-cover ml-auto" />
      </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
          <button onClick={() => go("/")} className="text-left px-4 py-3 rounded-xl text-espresso font-medium hover:bg-blush-100 transition">
            Home
          </button>
          <button onClick={() => go("/products")} className="text-left px-4 py-3 rounded-xl text-espresso font-medium hover:bg-blush-100 transition">
            Products
          </button>

          <button
            onClick={() => setCategoriesOpen((v) => !v)}
            className="flex items-center justify-between px-4 py-3 rounded-xl text-espresso font-medium hover:bg-blush-100 transition"
          >
            Categories
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`transition-transform ${categoriesOpen ? "rotate-90" : ""}`}
            >
              <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {categoriesOpen && (
            <div className="pl-4 flex flex-col gap-1">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => go(`/products?category=${c.id}`)}
                  className="text-left px-4 py-2.5 rounded-xl text-muted hover:bg-blush-100 hover:text-espresso transition text-sm"
                >
                  {c.name}
                </button>
              ))}
              {categories.length === 0 && (
                <p className="px-4 py-2 text-sm text-muted">No categories yet.</p>
              )}
            </div>
          )}

          <button onClick={() => go("/contact")} className="text-left px-4 py-3 rounded-xl text-espresso font-medium hover:bg-blush-100 transition">
            Contact
          </button>
          <button onClick={() => { openFavorites(); onClose(); }} className="text-left px-4 py-3 rounded-xl text-espresso font-medium hover:bg-blush-100 transition">
            Wishlist
          </button>
         <button onClick={() => { openCart(); onClose(); }} className="text-left px-4 py-3 rounded-xl text-espresso font-medium hover:bg-blush-100 transition">
            Cart
          </button>
          </nav>

          <div className="mt-auto px-4 pt-4 pb-6 border-t border-blush-200 flex justify-start">
            <a
              href="https://instagram.com/nara__accessories_"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full hover:bg-blush-100 text-espresso transition"
              aria-label="Instagram"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
              </svg>
            </a>
          </div>
      </div>
    </>
  );
}

export default MobileSidebar;