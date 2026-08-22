import { Link } from "react-router-dom";

function Footer() {
  return (
      <footer className="bg-blush-100 text-espresso mt-20">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <p className="font-display text-xl mb-2">Nara Accessories</p>
          <p className="text-sm text-muted">
            Handmade accessories crafted with love and care. Each piece tells a unique story.
          </p>
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] uppercase mb-3 text-muted">Quick Links</p>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/products" className="hover:underline">All Products</Link>
            <Link to="/about" className="hover:underline">About</Link>
            <Link to="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] uppercase mb-3 text-muted">Track an Order</p>
          <Link to="/track-order" className="text-sm hover:underline">Check order status →</Link>
        </div>
      </div>
      <div className="border-t border-blush-200 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Nara Accessories. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;