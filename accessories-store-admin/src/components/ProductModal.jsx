import { useState, useEffect } from "react";

function ProductModal({ product, categories, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    categoryId: "",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description || "",
        price: product.price,
        stockQuantity: product.stockQuantity,
        categoryId: product.categoryId,
        isActive: product.isActive,
      });
      if (product.imageUrl) {
        setImagePreview(`https://localhost:7113${product.imageUrl}`);
      }
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(
      {
        ...form,
        price: parseFloat(form.price),
        stockQuantity: parseInt(form.stockQuantity, 10),
        categoryId: parseInt(form.categoryId, 10),
      },
      imageFile
    );
  };

  const inputClass =
    "w-full bg-white border border-nude-200 rounded-md px-3.5 py-2.5 text-espresso placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-nude-400 focus:border-nude-400 transition";
  const labelClass = "block text-xs font-medium tracking-wide uppercase text-muted mb-1.5";

  return (
    <div className="fixed inset-0 bg-espresso/40 flex items-center justify-center z-50 p-4">
      <div className="bg-nude-50 rounded-lg shadow-xl w-full max-w-md p-6 md:p-8 max-h-[90vh] overflow-y-auto border border-nude-200">
        <h2 className="font-display text-2xl text-espresso mb-6">
          {product ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Product Image</label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-md border border-nude-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-md border border-dashed border-nude-300 flex items-center justify-center text-muted text-xs bg-white">
                  No image
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-muted" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Price</label>
              <input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Stock</label>
              <input type="number" name="stockQuantity" value={form.stockQuantity} onChange={handleChange} required className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Category</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange} required className={inputClass}>
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {product && (
            <label className="flex items-center gap-2 text-sm text-espresso">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
              Active (visible to customers)
            </label>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-md border border-nude-200 text-espresso hover:bg-nude-100 transition text-sm font-medium">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2.5 rounded-md bg-espresso text-nude-50 hover:bg-nude-600 transition text-sm font-medium">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;