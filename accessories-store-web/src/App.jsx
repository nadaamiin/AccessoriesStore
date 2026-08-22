import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { UIProvider } from "./context/UIContext";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";

function Placeholder({ title }) {
  return (
    <div className="p-10 text-center text-muted">
      <p className="font-display text-2xl text-espresso mb-2">{title}</p>
      <p>Coming soon.</p>
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <FavoritesProvider>
        <UIProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/checkout" element={<Placeholder title="Checkout" />} />
              <Route path="/about" element={<Placeholder title="About" />} />
              <Route path="/contact" element={<Placeholder title="Contact" />} />
              <Route path="/track-order" element={<Placeholder title="Track Order" />} />
              <Route path="/cart" element={<Navigate to="/" replace />} />
              <Route path="/favorites" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </UIProvider>
      </FavoritesProvider>
    </CartProvider>
  );
}

export default App;