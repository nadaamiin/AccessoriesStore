import { useState, useEffect } from "react";

function ProductModal({ product, categories, onClose, onSave }) {
  const [form, setForm] = useState({
  name: "",
  description: "",
  material: "",
  dimensions: "",
  price: "",
  stockQuantity: "",
  categoryId: "",
  isActive: true,
  isOnSale: false,
  salePrice: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Gallery state
  const [existingImages, setExistingImages] = useState([]); // [{id, url}]
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]); // File[]
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]); // string[]

  useEffect(() => {
    if (product) {
      setForm({
      name: product.name,
      description: product.description || "",
      material: product.material || "",
      dimensions: product.dimensions || "",
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: product.categoryId,
      isActive: product.isActive,
      isOnSale: product.isOnSale || false,
      salePrice: product.salePrice || "",
      });
      if (product.imageUrl) {
        setImagePreview(`${import.meta.env.VITE_SERVER_URL}${product.imageUrl}`);
      }
      if (product.images) {
        setExistingImages(product.images);
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

  const handleGalleryFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setNewGalleryFiles((prev) => [...prev, ...files]);
    setNewGalleryPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = ""; // allow re-selecting the same file again if needed
  };

  const removeExistingImage = (imageId) => {
    setRemovedImageIds((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const removeNewGalleryFile = (index) => {
    setNewGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setNewGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(
    {
      ...form,
      price: parseFloat(form.price),
      stockQuantity: parseInt(form.stockQuantity, 10),
      categoryId: parseInt(form.categoryId, 10),
      salePrice: form.isOnSale && form.salePrice ? parseFloat(form.salePrice) : null,
    },
    imageFile,
    newGalleryFiles,
    removedImageIds
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
            <label className={labelClass}>Primary Image</label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-md border border-nude-200" />
              ) : (
                <div className="w-20 h-20 rounded-md border border-dashed border-nude-300 flex items-center justify-center text-muted text-xs bg-white">
                  No image
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-muted" />
            </div>
          </div>

          {/* Additional photos gallery*/}
          <div>
            <label className={labelClass}>Additional Photos</label>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img) => (
                <div key={img.id} className="relative w-16 h-16">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${img.imageUrl}`}
                    alt=""
                    className="w-16 h-16 object-cover rounded-md border border-nude-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brick text-white text-xs flex items-center justify-center"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}

              {newGalleryPreviews.map((src, i) => (
                <div key={i} className="relative w-16 h-16">
                  <img src={src} alt="" className="w-16 h-16 object-cover rounded-md border border-nude-300" />
                  <button
                    type="button"
                    onClick={() => removeNewGalleryFile(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brick text-white text-xs flex items-center justify-center"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}

              <label className="w-16 h-16 rounded-md border border-dashed border-nude-300 flex items-center justify-center text-muted text-xs bg-white cursor-pointer hover:bg-nude-100 transition">
                + Add
                <input type="file" accept="image/*" multiple onChange={handleGalleryFilesChange} className="hidden" />
              </label>
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

          <div>
          <label className={labelClass}>Material</label>
          <input name="material" value={form.material} onChange={handleChange} placeholder="e.g. 925 Sterling Silver" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Dimensions</label>
          <input name="dimensions" value={form.dimensions} onChange={handleChange} placeholder="e.g. 45cm chain length" className={inputClass} />
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

          {/* ----------------------- */}
          <div className="bg-nude-100 rounded-md p-4 space-y-3">
            <label className="flex items-center gap-2 text-sm text-espresso font-medium">
              <input
                type="checkbox"
                checked={form.isOnSale}
                onChange={(e) => setForm((prev) => ({ ...prev, isOnSale: e.target.checked }))}
              />
              On Sale
            </label>
            {form.isOnSale && (
              <div>
                <label className={labelClass}>Sale Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.salePrice}
                  onChange={(e) => setForm((prev) => ({ ...prev, salePrice: e.target.value }))}
                  placeholder="Discounted price"
                  required={form.isOnSale}
                  className={inputClass}
                />
              </div>
            )}
          </div>
          {/* ----------------------- */}


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
            <button type="submit" className="px-4 py-2.5 rounded-md bg-[#8e625a] text-nude-50 hover:bg-nude-600 transition text-sm font-medium">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;