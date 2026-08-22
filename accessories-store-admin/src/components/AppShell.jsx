import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/products", label: "Products" },
  { to: "/categories", label: "Categories" },
  { to: "/orders", label: "Orders" },
  { to: "/announcement", label: "Announcement" },
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
    <div className="min-h-screen bg-nude-50">
      <header className="bg-white border-b border-nude-200 sticky top-0 z-30">
        <div className="px-4 md:px-8 py-3 flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setNavOpen((v) => !v)}
            className="md:hidden shrink-0 p-2 rounded-md hover:bg-nude-50"
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>

          {/* Logo — always visible, text never hidden */}
          <div className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="Nara Accessories" className="w-9 h-9 rounded-full object-cover" />
            <div className="leading-tight">
              <p className="font-display text-sm text-espresso">Nara</p>
              <p className="text-[9px] tracking-[0.2em] uppercase text-muted -mt-0.5">
                Accessories
              </p>
            </div>
          </div>

          {/* Nav links — desktop only */}
          <nav className="hidden md:flex items-center gap-1 shrink-0">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition ${
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
          <div className="ml-auto flex items-center">
            <div className="hidden md:block md:w-72 lg:w-96">{search}</div>
            <button
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="md:hidden p-2 rounded-md hover:bg-nude-50"
              aria-label="Toggle search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Sign Out — now with a filled background */}
          <button
            onClick={handleLogout}
            className="shrink-0 flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-md bg-[#8e625a] text-nude-50 text-sm font-medium hover:bg-nude-600 transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        {/* Mobile nav dropdown */}
        {navOpen && (
          <nav className="md:hidden border-t border-nude-200 px-4 py-2 flex flex-col">
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

        {/* Mobile search dropdown */}
        {mobileSearchOpen && (
          <div className="md:hidden border-t border-nude-200 px-4 py-3">{search}</div>
        )}
      </header>

      <main>{children}</main>
    </div>
  );
}

export default AppShell;