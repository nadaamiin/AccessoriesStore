import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Home from "./pages/Home";
import Products from "./pages/Products";

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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<Placeholder title="Product Detail" />} />
          <Route path="/cart" element={<Placeholder title="Cart" />} />
          <Route path="/favorites" element={<Placeholder title="Wishlist" />} />
          <Route path="/about" element={<Placeholder title="About" />} />
          <Route path="/contact" element={<Placeholder title="Contact" />} />
          <Route path="/track-order" element={<Placeholder title="Track Order" />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;