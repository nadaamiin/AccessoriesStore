import { useState, useEffect } from "react";
import { getPromoCodes, createPromoCode, updatePromoCode, deletePromoCode } from "../api/promoCodes";
import AppShell from "../components/AppShell";
import SearchBar from "../components/SearchBar";
import ConfirmDialog from "../components/ConfirmDialog";

const HIDE_EXPIRED_AFTER_DAYS = 10;

function getStatus(code) {
  if (code.expiresAt && new Date(code.expiresAt) < new Date()) return "Expired";
  return code.isActive ? "Active" : "Inactive";
}

function daysSince(dateStr) {
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
}

function statusStyle(status) {
  if (status === "Active") return "bg-sage/15 text-sage";
  if (status === "Expired") return "bg-brick/10 text-brick";
  return "bg-nude-100 text-muted";
}

function PromoCodeModal({ code, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    code: "", ownerName: "", isPercentage: true, discountValue: "", isActive: true, expiresAt: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (code) {
      setForm({
        code: code.code,
        ownerName: code.ownerName || "",
        isPercentage: code.isPercentage,
        discountValue: code.discountValue,
        isActive: code.isActive,
        expiresAt: code.expiresAt ? code.expiresAt.slice(0, 10) : "",
      });
    }
  }, [code]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.code.trim()) newErrors.code = "Code is required.";
    if (form.discountValue === "" || Number.isNaN(Number(form.discountValue))) {
      newErrors.discountValue = "Discount value is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      code: form.code,
      ownerName: form.ownerName,
      isPercentage: form.isPercentage,
      discountValue: parseFloat(form.discountValue),
      isActive: form.isActive,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    });
  };

  const inputClass =
    "w-full bg-white border border-nude-200 rounded-md px-3.5 py-2.5 text-espresso placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-nude-400 focus:border-nude-400 transition";
  const labelClass = "block text-xs font-medium tracking-wide uppercase text-muted mb-1.5";

  return (
    <div className="fixed inset-0 bg-espresso/40 flex items-center justify-center z-50 p-4">
      <div className="bg-nude-50 rounded-lg shadow-xl w-full max-w-md p-6 md:p-8 max-h-[90vh] overflow-y-auto border border-nude-200">
        <h2 className="font-display text-2xl text-espresso mb-6">
          {code ? "Edit Promo Code" : "Add Promo Code"}
        </h2>

        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Code</label>
            <input value={form.code} onChange={(e) => {
              setForm((p) => ({ ...p, code: e.target.value }));
              if (errors.code) setErrors((p) => ({ ...p, code: undefined }));
            }} required aria-invalid={!!errors.code} className={`${inputClass} ${errors.code ? "border-brick focus:border-brick focus:ring-brick/30" : ""}`} />
            {errors.code && <p className="text-brick text-xs mt-1.5">{errors.code}</p>}
          </div>

          <div>
            <label className={labelClass}>Owner Name</label>
            <input value={form.ownerName} onChange={(e) => setForm((p) => ({ ...p, ownerName: e.target.value }))} placeholder="e.g. Sara" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Type</label>
              <select
                value={form.isPercentage ? "pct" : "fixed"}
                onChange={(e) => setForm((p) => ({ ...p, isPercentage: e.target.value === "pct" }))}
                className={inputClass}
              >
                <option value="pct">Percentage</option>
                <option value="fixed">Fixed (EGP)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Value</label>
              <input type="number" step="0.01" value={form.discountValue} onChange={(e) => {
                setForm((p) => ({ ...p, discountValue: e.target.value }));
                if (errors.discountValue) setErrors((p) => ({ ...p, discountValue: undefined }));
              }} required aria-invalid={!!errors.discountValue} className={`${inputClass} ${errors.discountValue ? "border-brick focus:border-brick focus:ring-brick/30" : ""}`} />
              {errors.discountValue && <p className="text-brick text-xs mt-1.5">{errors.discountValue}</p>}
            </div>
          </div>

          <div>
            <label className={labelClass}>Expires (optional)</label>
            <input type="date" value={form.expiresAt} onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))} className={inputClass} />
          </div>

          <label className="flex items-center gap-2 text-sm text-espresso">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
            Active
          </label>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2.5 rounded-md border border-nude-200 text-espresso hover:bg-nude-100 transition text-sm font-medium disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-md bg-[#8e625a] text-nude-50 hover:bg-nude-600 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CodeRow({ c, onEdit, onDelete }) {
  const status = getStatus(c);
  return (
    <>
      {/* Mobile card */}
      <div className="md:hidden bg-white border border-nude-200 rounded-lg p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-espresso font-semibold">{c.code}</p>
            <p className="text-xs text-muted mt-0.5">{c.ownerName || "No owner"}</p>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusStyle(status)}`}>{status}</span>
        </div>
        <p className="text-sm text-espresso mt-2">
          {c.isPercentage ? `${c.discountValue}% off` : `EGP ${c.discountValue} off`}
        </p>
        <p className="text-xs text-muted mt-1">
          {c.expiresAt ? `Expires ${new Date(c.expiresAt).toLocaleDateString()}` : "Never expires"}
        </p>
        <div className="flex gap-3 mt-3">
          <button onClick={() => onEdit(c)} className="text-nude-500 hover:text-espresso text-sm font-medium transition">Edit</button>
          <button onClick={() => onDelete(c)} className="text-brick/80 hover:text-brick text-sm font-medium transition">Delete</button>
        </div>
      </div>

      {/* Desktop row */}
      <tr className="hidden md:table-row border-b border-nude-100 last:border-0 hover:bg-nude-50/50 transition">
        <td className="px-5 py-3 font-medium text-espresso">{c.code}</td>
        <td className="px-5 py-3 text-muted">{c.ownerName || "—"}</td>
        <td className="px-5 py-3 text-espresso">{c.isPercentage ? `${c.discountValue}%` : `EGP ${c.discountValue}`}</td>
        <td className="px-5 py-3 text-muted">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}</td>
        <td className="px-5 py-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle(status)}`}>{status}</span>
        </td>
        <td className="px-5 py-3 space-x-3 whitespace-nowrap">
          <button onClick={() => onEdit(c)} className="text-nude-500 hover:text-espresso text-sm font-medium transition">Edit</button>
          <button onClick={() => onDelete(c)} className="text-brick/80 hover:text-brick text-sm font-medium transition">Delete</button>
        </td>
      </tr>
    </>
  );
}

function CodeTable({ codes, onEdit, onDelete, emptyText }) {
  if (codes.length === 0) {
    return (
      <div className="bg-white border border-nude-200 rounded-lg p-8 text-center text-muted">
        {emptyText}
      </div>
    );
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="md:hidden space-y-3">
        {codes.map((c) => <CodeRow key={c.id} c={c} onEdit={onEdit} onDelete={onDelete} />)}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white border border-nude-200 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-nude-200">
              <th className="px-5 py-3.5 text-xs font-medium tracking-wide uppercase text-muted">Code</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wide uppercase text-muted">Owner</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wide uppercase text-muted">Discount</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wide uppercase text-muted">Expires</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wide uppercase text-muted">Status</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wide uppercase text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => <CodeRow key={c.id} c={c} onEdit={onEdit} onDelete={onDelete} />)}
          </tbody>
        </table>
      </div>
    </>
  );
}

function PromoCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("active"); // active | expired | all

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPromoCodes();
      setCodes(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAddClick = () => {
    setEditingCode(null);
    setModalOpen(true);
  };

  const handleEditClick = (c) => {
    setEditingCode(c);
    setModalOpen(true);
  };

  const handleDeleteClick = (c) => setDeleteTarget(c);

  const confirmDelete = async () => {
    try {
      await deletePromoCode(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch {
      alert("Failed to delete promo code.");
    }
  };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editingCode) {
        await updatePromoCode(editingCode.id, payload);
      } else {
        await createPromoCode(payload);
      }
      setModalOpen(false);
      load();
    } catch {
      alert("Failed to save promo code.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = codes.filter((c) => {
    const q = query.toLowerCase();
    return c.code.toLowerCase().includes(q) || (c.ownerName || "").toLowerCase().includes(q);
  });

  const activeCodes = filtered.filter((c) => getStatus(c) !== "Expired");

  const expiredCodes = filtered.filter(
    (c) => getStatus(c) === "Expired" && daysSince(c.expiresAt) <= HIDE_EXPIRED_AFTER_DAYS
  );

  const allCodes = filtered;

  const content = loading ? (
    <div className="p-10 text-muted">Loading…</div>
  ) : (
    <div className="p-6 md:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-muted mb-1">Storefront</p>
          <h1 className="font-display text-3xl text-espresso">Promo Codes</h1>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-[#8e625a] text-nude-50 px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition self-start sm:self-auto"
        >
          + Add Promo Code
        </button>
      </div>

      <div className="inline-flex bg-nude-100 rounded-md p-1 mb-6">
        <button
          onClick={() => setTab("active")}
          className={`px-4 py-1.5 rounded text-sm font-medium transition ${
            tab === "active" ? "bg-white text-espresso shadow-sm" : "text-muted hover:text-espresso"
          }`}
        >
          Active ({activeCodes.length})
        </button>
        <button
          onClick={() => setTab("expired")}
          className={`px-4 py-1.5 rounded text-sm font-medium transition ${
            tab === "expired" ? "bg-white text-espresso shadow-sm" : "text-muted hover:text-espresso"
          }`}
        >
          Expired ({expiredCodes.length})
        </button>
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-1.5 rounded text-sm font-medium transition ${
            tab === "all" ? "bg-white text-espresso shadow-sm" : "text-muted hover:text-espresso"
          }`}
        >
          All ({allCodes.length})
        </button>
      </div>

      {tab === "active" && (
        <CodeTable codes={activeCodes} onEdit={handleEditClick} onDelete={handleDeleteClick} emptyText="No active promo codes." />
      )}
      {tab === "expired" && (
        <CodeTable
          codes={expiredCodes}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          emptyText={`No recently expired codes (shown for ${HIDE_EXPIRED_AFTER_DAYS} days after expiry).`}
        />
      )}
      {tab === "all" && (
        <CodeTable codes={allCodes} onEdit={handleEditClick} onDelete={handleDeleteClick} emptyText="No promo codes yet." />
      )}
    </div>
  );

  return (
    <AppShell search={<SearchBar value={query} onChange={setQuery} placeholder="Search by code or owner…" />}>
      {content}
      {modalOpen && (
        <PromoCodeModal code={editingCode} onClose={() => setModalOpen(false)} onSave={handleSave} saving={saving} />
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete promo code?"
        message={deleteTarget ? `Delete "${deleteTarget.code}"? This can't be undone.` : ""}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  );
}

export default PromoCodes;
