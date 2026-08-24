import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/products", label: "Products" },
  { to: "/categories", label: "Categories" },
  { to: "/orders", label: "Orders" },
  { to: "/reviews", label: "Reviews" },
  { to: "/announcement", label: "Announcement" },
  { to: "/shipping", label: "Shipping" },
  { to: "/messages", label: "Messages" },
  { to: "/promo-codes", label: "Promo Codes" },
];

function AppShell({ children, search }) {
  const [navOpen, setNavOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-nude-50 overflow-x-hidden">
      <header className="bg-white border-b border-nude-200 sticky top-0 z-30">
        <div className="max-w-full px-4 xl:px-6 py-3 flex items-center gap-2 xl:gap-3">
          {/* Hamburger — mobile, tablet, and laptop */}
          <button
            onClick={() => setNavOpen((v) => !v)}
            className="xl:hidden shrink-0 p-2 rounded-md hover:bg-nude-50"
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>

          {/* Logo — always visible, text never hidden */}
          <div className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="Nara Accessories" className="w-9 h-9 rounded-full object-cover" />
            <div className="leading-tight hidden xl:block">
              <p className="font-display text-sm text-espresso">Nara</p>
              <p className="text-[9px] tracking-[0.2em] uppercase text-muted -mt-0.5">
                Accessories
              </p>
            </div>
          </div>

          {/* Nav links — true wide desktop only, no scrolling needed */}
          <nav className="hidden xl:flex items-center gap-0.5 shrink-0">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-2.5 py-2 rounded-md text-sm font-medium whitespace-nowrap transition ${
                    isActive
                      ? "text-espresso bg-nude-100"
                      : "text-muted hover:text-espresso hover:bg-nude-50"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Search */}
          <div className="ml-auto flex items-center shrink-0">
            <div className="hidden xl:block xl:w-64 2xl:w-72">{search}</div>
            <button
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="xl:hidden p-2 rounded-md hover:bg-nude-50"
              aria-label="Toggle search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#8e625a] text-nude-50 text-sm font-medium hover:bg-nude-600 transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden xl:inline">Sign Out</span>
          </button>
        </div>

        {/* Mobile/tablet/laptop nav dropdown */}
        {navOpen && (
          <nav className="xl:hidden border-t border-nude-200 px-4 py-2 flex flex-col max-h-[70vh] overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setNavOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-md text-sm font-medium transition ${
                    isActive
                      ? "text-espresso bg-nude-100"
                      : "text-muted hover:text-espresso hover:bg-nude-50"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Mobile/tablet/laptop search dropdown */}
        {mobileSearchOpen && (
          <div className="xl:hidden border-t border-nude-200 px-4 py-3">{search}</div>
        )}
      </header>

      <main>{children}</main>
    </div>
  );
}

export default AppShell;