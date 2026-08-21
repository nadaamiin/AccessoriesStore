import { useState, useEffect } from "react";

function CategoryModal({ category, onClose, onSave }) {
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    if (category) {
      setForm({ name: category.name, description: category.description || "" });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const inputClass =
    "w-full bg-white border border-nude-200 rounded-md px-3.5 py-2.5 text-espresso placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-nude-400 focus:border-nude-400 transition";
  const labelClass = "block text-xs font-medium tracking-wide uppercase text-muted mb-1.5";

  return (
    <div className="fixed inset-0 bg-espresso/40 flex items-center justify-center z-50 p-4">
      <div className="bg-nude-50 rounded-lg shadow-xl w-full max-w-sm p-6 md:p-8 border border-nude-200">
        <h2 className="font-display text-2xl text-espresso mb-6">
          {category ? "Edit Category" : "Add Category"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={inputClass} />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-md border border-nude-200 text-espresso hover:bg-nude-100 transition text-sm font-medium">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2.5 rounded-md bg-[#8e625a] text-nude-50 hover:bg-nude-600 transition text-sm font-medium">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryModal;