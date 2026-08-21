import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { getDashboardStats } from "../api/dashboard";
import AppShell from "../components/AppShell";

const STATUS_COLORS = {
  Pending: "#B98B76",
  Processing: "#D6C3B5",
  Shipped: "#8A6350",
  Delivered: "#7A8C6E",
  Cancelled: "#B5615A",
};

const STATUS_LABELS = {
  Pending: "Pending",
  Processing: "Processing",
  Shipped: "Shipped",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
};

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Failed to load dashboard stats:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AppShell><div className="p-10 text-muted">Loading…</div></AppShell>;
  if (!stats) return <AppShell><div className="p-10 text-muted">Couldn't load dashboard data.</div></AppShell>;

  const cards = [
    { label: "Total Products", value: stats.totalProducts },
    { label: "Active Products", value: stats.activeProducts },
    { label: "Total Orders", value: stats.totalOrders },
    { label: "Pending Orders", value: stats.pendingOrders },
    { label: "Total Revenue", value: `EGP ${stats.totalRevenue.toFixed(2)}` },
    { label: "Low Stock (≤5)", value: stats.lowStockCount, warn: stats.lowStockCount > 0 },
  ];

  const hasRevenue = stats.revenueLast14Days.some((d) => d.revenue > 0);
  const statusData = stats.ordersByStatus.map((s) => ({
    ...s,
    label: STATUS_LABELS[s.status] || s.status,
  }));

  return (
    <AppShell>
      <div className="p-6 md:p-10">
        <p className="text-xs tracking-[0.3em] uppercase text-muted mb-1">Overview</p>
        <h1 className="font-display text-3xl text-espresso mb-8">Welcome back</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {cards.map((stat) => (
            <div key={stat.label} className="bg-white border border-nude-200 rounded-lg p-5">
              <p className="text-xs tracking-wide uppercase text-muted mb-2">{stat.label}</p>
              <p className={`font-display text-2xl ${stat.warn ? "text-brick" : "text-espresso"}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-nude-200 rounded-lg p-6">
            <h2 className="font-display text-lg text-espresso mb-1">Revenue, last 14 days</h2>
            <p className="text-xs text-muted mb-4">Excludes cancelled orders</p>

            {!hasRevenue ? (
              <div className="h-[260px] flex items-center justify-center text-muted text-sm">
                No revenue recorded in the last 14 days.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={stats.revenueLast14Days} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#E5D8CE" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#8A7A72", fontSize: 11 }}
                    axisLine={{ stroke: "#E5D8CE" }}
                    tickLine={false}
                    interval="preserveStartEnd"
                    minTickGap={24}
                  />
                  <YAxis
                    tick={{ fill: "#8A7A72", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={55}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip
                    contentStyle={{ background: "#fff", border: "1px solid #E5D8CE", borderRadius: 8, fontSize: 12 }}
                    formatter={(value) => [`EGP ${Number(value).toFixed(2)}`, "Revenue"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#B98B76"
                    strokeWidth={2.5}
                    dot={{ fill: "#B98B76", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white border border-nude-200 rounded-lg p-6">
            <h2 className="font-display text-lg text-espresso mb-1">Orders by status</h2>
            <p className="text-xs text-muted mb-4">All-time breakdown</p>
            {statusData.length === 0 ? (
              <div className="h-[260px] flex items-center justify-center text-muted text-sm">
                No orders yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.status] || "#B98B76"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#fff", border: "1px solid #E5D8CE", borderRadius: 8, fontSize: 12 }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12, color: "#3A2E2A" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default Dashboard;