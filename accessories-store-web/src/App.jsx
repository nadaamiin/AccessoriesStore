import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { UIProvider } from "./context/UIContext";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Contact from "./pages/Contact";
import { SearchProvider } from "./context/SearchContext";

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
        <SearchProvider>
          <UIProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/track-order" element={<Placeholder title="Track Order" />} />
                <Route path="/cart" element={<Navigate to="/" replace />} />
                <Route path="/favorites" element={<Navigate to="/" replace />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
              </Routes>
            </BrowserRouter>
          </UIProvider>
        </SearchProvider>
      </FavoritesProvider>
    </CartProvider>
  );
}

export default App;