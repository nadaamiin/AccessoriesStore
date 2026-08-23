import { useState, useEffect } from "react";
import { getShipping, updateShipping } from "../api/shipping";
import AppShell from "../components/AppShell";

function Shipping() {
  const [shippingFee, setShippingFee] = useState("");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getShipping()
      .then((res) => {
        setShippingFee(res.data.shippingFee);
        setFreeShippingThreshold(res.data.freeShippingThreshold);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateShipping({
        shippingFee: parseFloat(shippingFee) || 0,
        freeShippingThreshold: parseFloat(freeShippingThreshold) || 0,
      });
    } catch (err) {
      alert("Failed to save shipping settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AppShell><div className="p-10 text-muted">Loading…</div></AppShell>;

  return (
    <AppShell>
      <div className="p-6 md:p-10 max-w-xl">
        <p className="text-xs tracking-[0.3em] uppercase text-muted mb-1">Storefront</p>
        <h1 className="font-display text-3xl text-espresso mb-8">Shipping</h1>

        <div className="bg-white border border-nude-200 rounded-lg p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium tracking-wide uppercase text-muted mb-1.5">
              Shipping Fee (EGP)
            </label>
            <input
              type="number"
              step="0.01"
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              className="w-full bg-white border border-nude-200 rounded-md px-3.5 py-2.5 text-espresso focus:outline-none focus:ring-2 focus:ring-nude-400 focus:border-nude-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium tracking-wide uppercase text-muted mb-1.5">
              Free Shipping Threshold (EGP)
            </label>
            <input
              type="number"
              step="0.01"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              placeholder="0 = disabled"
              className="w-full bg-white border border-nude-200 rounded-md px-3.5 py-2.5 text-espresso focus:outline-none focus:ring-2 focus:ring-nude-400 focus:border-nude-400 transition"
            />
            <p className="text-xs text-muted mt-1.5">
              Orders at or above this amount get free shipping. Set to 0 to disable.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-md bg-[#8e625a] text-nude-50 text-sm font-medium hover:bg-nude-600 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

export default Shipping;