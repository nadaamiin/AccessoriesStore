import { useLocation, Link, Navigate } from "react-router-dom";
import Layout from "../components/Layout";

function OrderConfirmation() {
  const { state } = useLocation();
  const order = state?.order;

  if (!order) return <Navigate to="/" replace />;

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-sage/15 flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7A8C6E" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="font-display text-3xl text-espresso mb-3">Thank you!</h1>
        <p className="text-muted mb-1">Your order has been placed successfully.</p>
        <p className="text-espresso font-medium mb-8">Order #{order.orderNumber}</p>

        <div className="bg-blush-100 rounded-2xl p-6 text-left space-y-2 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Total</span>
            <span className="text-espresso font-medium">LE {order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Payment</span>
            <span className="text-espresso font-medium">Cash on Delivery</span>
          </div>
        </div>

        <p className="text-sm text-muted mb-8">
          A confirmation email has been sent to <strong>{order.customerEmail}</strong>. You can track your order anytime using your order number and email.
        </p>

        <Link
          to="/products"
          className="inline-block px-8 py-3.5 rounded-full bg-espresso text-white text-sm font-medium hover:opacity-90 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </Layout>
  );
}

export default OrderConfirmation;