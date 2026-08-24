import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Categories from "./pages/Categories";
import ProtectedRoute from "./components/ProtectedRoute";
import Announcement from "./pages/Announcement";
import Reviews from "./pages/Reviews";
import Shipping from "./pages/Shipping";
import PromoCodes from "./pages/PromoCodes";
import Messages from "./pages/Messages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        <Route path="/announcement" element={<ProtectedRoute><Announcement /></ProtectedRoute>} />
        <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
        <Route path="/shipping" element={<ProtectedRoute><Shipping /></ProtectedRoute>} />
        <Route path="/promo-codes" element={<ProtectedRoute><PromoCodes /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;