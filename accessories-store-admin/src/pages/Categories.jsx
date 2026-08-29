import { useState, useEffect } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../api/categories";
import AppShell from "../components/AppShell";
import SearchBar from "../components/SearchBar";
import CategoryModal from "../components/CategoryModal";
import ConfirmDialog from "../components/ConfirmDialog";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddClick = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleDeleteClick = (category) => {
    setDeleteError("");
    setDeleteTarget(category);
  };

  const confirmDelete = async () => {
    try {
      await deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      setDeleteError("Couldn't delete — this category may still have products assigned to it.");
    }
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      alert("Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const content = loading ? (
    <div className="p-10 text-muted">Loading…</div>
  ) : (
    <div className="p-6 md:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-muted mb-1">Catalog</p>
          <h1 className="font-display text-3xl text-espresso">Categories</h1>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-[#8e625a] text-nude-50 px-5 py-2.5 rounded-md text-sm font-medium hover:bg-nude-600 transition self-start sm:self-auto"
        >
          + Add Category
        </button>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {filteredCategories.map((c) => (
          <div key={c.id} className="bg-white border border-nude-200 rounded-lg p-4">
            <p className="text-espresso font-medium">{c.name}</p>
            <p className="text-xs text-muted mt-1">{c.description || "—"}</p>
            <div className="flex gap-3 mt-3">
              <button onClick={() => handleEditClick(c)} className="text-nude-500 hover:text-espresso text-sm font-medium transition">
                Edit
              </button>
              <button onClick={() => handleDeleteClick(c)} className="text-brick/80 hover:text-brick text-sm font-medium transition">
                Delete
              </button>
            </div>
          </div>
        ))}
        {filteredCategories.length === 0 && (
          <div className="bg-white border border-nude-200 rounded-lg p-8 text-center text-muted">
            {categories.length === 0 ? "No categories yet." : "No categories match your search."}
          </div>
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white border border-nude-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left min-w-[480px]">
          <thead>
            <tr className="border-b border-nude-200">
              <th className="px-5 py-3.5 text-xs font-medium tracking-wide uppercase text-muted">Name</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wide uppercase text-muted">Description</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wide uppercase text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((c) => (
              <tr key={c.id} className="border-b border-nude-100 last:border-0 hover:bg-nude-50/50 transition">
                <td className="px-5 py-3 text-espresso font-medium">{c.name}</td>
                <td className="px-5 py-3 text-muted">{c.description || "—"}</td>
                <td className="px-5 py-3 space-x-3 whitespace-nowrap">
                  <button onClick={() => handleEditClick(c)} className="text-nude-500 hover:text-espresso text-sm font-medium transition">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteClick(c)} className="text-brick/80 hover:text-brick text-sm font-medium transition">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredCategories.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-muted">
                  {categories.length === 0 ? "No categories yet." : "No categories match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );

  return (
    <AppShell
      search={<SearchBar value={query} onChange={setQuery} placeholder="Search categories…" />}
    >
      {content}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete category?"
        message={
          deleteError
            ? deleteError
            : deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This can't be undone.`
            : ""
        }
        confirmLabel={deleteError ? "OK" : "Delete"}
        onConfirm={deleteError ? () => setDeleteTarget(null) : confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  );
}

export default Categories;
