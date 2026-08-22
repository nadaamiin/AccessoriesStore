import { useState, useEffect } from "react";
import { getAnnouncement, updateAnnouncement } from "../api/announcement";
import AppShell from "../components/AppShell";

function Announcement() {
  const [message, setMessage] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAnnouncement()
      .then((res) => {
        setMessage(res.data.message);
        setIsActive(res.data.isActive);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAnnouncement({ message, isActive });
    } catch (err) {
      alert("Failed to save announcement.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AppShell><div className="p-10 text-muted">Loading…</div></AppShell>;

  return (
    <AppShell>
      <div className="p-6 md:p-10 max-w-xl">
        <p className="text-xs tracking-[0.3em] uppercase text-muted mb-1">Storefront</p>
        <h1 className="font-display text-3xl text-espresso mb-8">Announcement Banner</h1>

        <div className="bg-white border border-nude-200 rounded-lg p-6 space-y-5">
          <label className="flex items-center gap-2 text-sm text-espresso font-medium">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Show banner on the storefront
          </label>

          <div>
            <label className="block text-xs font-medium tracking-wide uppercase text-muted mb-1.5">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="e.g. Free shipping on orders over EGP 1000 this week!"
              className="w-full bg-white border border-nude-200 rounded-md px-3.5 py-2.5 text-espresso focus:outline-none focus:ring-2 focus:ring-nude-400 focus:border-nude-400 transition"
            />
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

export default Announcement;