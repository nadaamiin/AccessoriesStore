import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-blush-100 text-espresso mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        
        {/* Brand */}
        <div>
          <p className="font-display text-xl mb-2">
            Nara Accessories
          </p>

          <p className="text-sm text-muted">
            Handmade accessories crafted with love and care. Each piece tells a
            unique story.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <p className="text-xs tracking-[0.2em] uppercase mb-3 text-muted">
            Quick Links
          </p>

          <div className="flex flex-col gap-2 text-sm">
            <Link to="/products" className="hover:underline">
              All Products
            </Link>

            <Link to="/about" className="hover:underline">
              About
            </Link>

            <Link to="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>

        {/* Connect */}
        <div>
          <p className="text-xs tracking-[0.2em] uppercase mb-3 text-muted">
            Connect
          </p>

          <div className="flex flex-col gap-2 text-sm">

            {/* Email */}
            <a
              href="mailto:nara@gmail.com"
              className="flex items-center gap-2 hover:underline w-fit"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path
                  d="m2 7 10 6 10-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              nara@gmail.com
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/nara_accesories"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:underline w-fit"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="0.5"
                  fill="currentColor"
                />
              </svg>

              @nara_accesories
            </a>

          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-blush-200 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Nara Accessories. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;