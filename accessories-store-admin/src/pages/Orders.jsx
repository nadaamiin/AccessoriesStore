import { useState, useEffect } from "react";
import { getAllOrders, updateOrderStatus } from "../api/orders";
import AppShell from "../components/AppShell";
import SearchBar from "../components/SearchBar";

const STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const statusStyles = {
  Pending: "bg-nude-100 text-muted",
  Processing: "bg-nude-200 text-nude-600",
  Shipped: "bg-sage/15 text-sage",
  Delivered: "bg-sage/25 text-sage",
  Cancelled: "bg-brick/10 text-brick",
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getAllOrders();
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (order, newStatus) => {
    setUpdatingId(order.id);
    try {
      await updateOrderStatus(order.id, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert("Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = query.toLowerCase();
    if (!q) return true;
    const matchesOrderNumber = o.orderNumber.toLowerCase().includes(q);
    const matchesItems = o.items.some(
      (item) =>
        item.productName.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q)
    );
    return matchesOrderNumber || matchesItems;
  });

  const content = loading ? (
    <div className="p-10 text-muted">Loading…</div>
  ) : (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <p className="text-xs tracking-[0.3em] uppercase text-muted mb-1">Fulfillment</p>
        <h1 className="font-display text-3xl text-espresso">Orders</h1>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white border border-nude-200 rounded-lg p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div>
                <p className="font-display text-lg text-espresso">{order.orderNumber}</p>
                <p className="text-xs text-muted mt-0.5">
                  {order.customerName} · {order.customerEmail} · {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[order.status] || "bg-nude-100 text-muted"}`}>
                  {order.status}
                </span>
                <select
                  value={order.status}
                  disabled={updatingId === order.id}
                  onChange={(e) => handleStatusChange(order, e.target.value)}
                  className="border border-nude-200 rounded-md px-3 py-1.5 text-sm text-espresso bg-nude-50 focus:outline-none focus:ring-2 focus:ring-nude-400 disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-nude-100 pt-3 space-y-1.5">
              {order.items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-espresso">
                    {item.productName} <span className="text-muted">· {item.categoryName}</span> × {item.quantity}
                  </span>
                  <span className="text-muted">EGP {(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-medium pt-2 border-t border-nude-100 mt-2">
                <span className="text-espresso">Total</span>
                <span className="text-espresso">EGP {order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="bg-white border border-nude-200 rounded-lg p-10 text-center text-muted">
            {orders.length === 0 ? "No orders yet." : "No orders match your search."}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AppShell
      search={
        <SearchBar value={query} onChange={setQuery} placeholder="Search by order no., prod, or cat…" />
      }
    >
      {content}
    </AppShell>
  );
}

export default Orders;