import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories } from "../api/categories";
import logo from "../assets/logo.png";

function MobileSidebar({ open, onClose }) {
  const [categories, setCategories] = useState([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const navigate = useNavigate();

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
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-blush-50 shadow-xl transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-blush-100" aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
          <img src={logo} alt="Nara Accessories" className="w-10 h-10 rounded-full object-cover" />
          <div className="w-9" /> {/* spacer to balance the X */}
        </div>

        <nav className="px-3 py-2 flex flex-col gap-1">
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

          <button onClick={() => go("/about")} className="text-left px-4 py-3 rounded-xl text-espresso font-medium hover:bg-blush-100 transition">
            About
          </button>
          <button onClick={() => go("/contact")} className="text-left px-4 py-3 rounded-xl text-espresso font-medium hover:bg-blush-100 transition">
            Contact
          </button>
          <button onClick={() => go("/favorites")} className="text-left px-4 py-3 rounded-xl text-espresso font-medium hover:bg-blush-100 transition">
            Wishlist
          </button>
          <button onClick={() => go("/cart")} className="text-left px-4 py-3 rounded-xl text-espresso font-medium hover:bg-blush-100 transition">
            Cart
          </button>
        </nav>
      </div>
    </>
  );
}

export default MobileSidebar;