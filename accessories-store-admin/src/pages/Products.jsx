import { useState, useEffect } from "react";
import {
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  uploadProductImages,
  deleteProductImage,
} from "../api/products";
import { getCategories } from "../api/categories";
import ProductModal from "../components/ProductModal";
import AppShell from "../components/AppShell";
import SearchBar from "../components/SearchBar";
import ConfirmDialog from "../components/ConfirmDialog";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        getAllProductsAdmin(),
        getCategories(),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddClick = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDeleteClick = (product) => {
    setDeleteTarget(product);
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      alert("Failed to delete product.");
    }
  };

  const handleSave = async (formData, imageFile, galleryFiles, removedImageIds) => {
    try {
      let productId;
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        productId = editingProduct.id;
      } else {
        const res = await createProduct(formData);
        productId = res.data.id;
      }

      if (imageFile) {
        await uploadProductImage(productId, imageFile);
      }

      if (removedImageIds && removedImageIds.length > 0) {
        await Promise.all(removedImageIds.map((id) => deleteProductImage(id)));
      }

      if (galleryFiles && galleryFiles.length > 0) {
        await uploadProductImages(productId, galleryFiles);
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      alert("Failed to save product.");
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q)
    );
  });

  const content = loading ? (
    <div className="p-10 text-muted">Loading…</div>
  ) : (
    <div className="p-6 md:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-muted mb-1">Catalog</p>
          <h1 className="font-display text-3xl text-espresso">Products</h1>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-[#8e625a] text-nude-50 px-5 py-2.5 rounded-md text-sm font-medium hover:bg-nude-600 transition self-start sm:self-auto"
        >
          + Add Product
        </button>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {filteredProducts.map((p) => (
          <div key={p.id} className="bg-white border border-nude-200 rounded-lg p-4 flex gap-3">
            {p.imageUrl ? (
              <img
                src={`https://localhost:7113${p.imageUrl}`}
                alt={p.name}
                className="w-16 h-16 object-cover rounded-md border border-nude-200 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 bg-nude-100 rounded-md flex items-center justify-center text-muted text-xs shrink-0">
                —
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-espresso font-medium truncate">{p.name}</p>
                <div className="shrink-0 flex items-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${p.isActive ? "bg-sage/15 text-sage" : "bg-nude-100 text-muted"}`}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                  {p.isOnSale && (
                    <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-brick/10 text-brick">
                      Sale
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted mt-0.5">{p.categoryName}</p>
              {p.isOnSale && p.salePrice ? (
                <p className="text-sm mt-2">
                  <span className="text-muted line-through mr-1.5">EGP {p.price.toFixed(2)}</span>
                  <span className="text-brick font-medium">EGP {p.salePrice.toFixed(2)}</span>
                  <span className="text-espresso"> · Stock: {p.stockQuantity}</span>
                </p>
              ) : (
                <p className="text-sm text-espresso mt-2">EGP {p.price.toFixed(2)} · Stock: {p.stockQuantity}</p>
              )}
              <div className="flex gap-3 mt-2">
                <button onClick={() => handleEditClick(p)} className="text-nude-500 hover:text-espresso text-sm font-medium transition">
                  Edit
                </button>
                <button onClick={() => handleDeleteClick(p)} className="text-brick/80 hover:text-brick text-sm font-medium transition">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="bg-white border border-nude-200 rounded-lg p-8 text-center text-muted">
            {products.length === 0 ? "No products yet — add your first piece to the catalog." : "No products match your search."}
          </div>
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white border border-nude-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left min-w-[720px]">
          <thead>
            <tr className="border-b border-nude-200">
              <th className="px-5 py-3.5 text-xs font-medium tracking-wide uppercase text-muted">Image</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wide uppercase text-muted">Name</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wide uppercase text-muted">Category</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wide uppercase text-muted">Price</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wide uppercase text-muted">Stock</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wide uppercase text-muted">Status</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wide uppercase text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-b border-nude-100 last:border-0 hover:bg-nude-50/50 transition">
                <td className="px-5 py-3">
                  {p.imageUrl ? (
                    <img
                      src={`https://localhost:7113${p.imageUrl}`}
                      alt={p.name}
                      className="w-11 h-11 object-cover rounded-md border border-nude-200"
                    />
                  ) : (
                    <div className="w-11 h-11 bg-nude-100 rounded-md flex items-center justify-center text-muted text-xs">
                      —
                    </div>
                  )}
                </td>
                <td className="px-5 py-3 text-espresso font-medium">{p.name}</td>
                <td className="px-5 py-3 text-muted">{p.categoryName}</td>
                <td className="px-5 py-3 text-espresso">
                  {p.isOnSale && p.salePrice ? (
                    <>
                      <span className="text-muted line-through mr-1.5">EGP {p.price.toFixed(2)}</span>
                      <span className="text-brick font-medium">EGP {p.salePrice.toFixed(2)}</span>
                    </>
                  ) : (
                    <>EGP {p.price.toFixed(2)}</>
                  )}
                </td>
                <td className="px-5 py-3 text-espresso">{p.stockQuantity}</td>
                <td className="px-5 py-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      p.isActive ? "bg-sage/15 text-sage" : "bg-nude-100 text-muted"
                    }`}
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                  {p.isOnSale && (
                    <span className="ml-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-brick/10 text-brick">
                      Sale
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 space-x-3 whitespace-nowrap">
                  <button onClick={() => handleEditClick(p)} className="text-nude-500 hover:text-espresso text-sm font-medium transition">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteClick(p)} className="text-brick/80 hover:text-brick text-sm font-medium transition">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-muted">
                  {products.length === 0 ? "No products yet — add your first piece to the catalog." : "No products match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );

  return (
    <AppShell
      search={
        <SearchBar value={query} onChange={setQuery} placeholder="Search products or categories…" />
      }
    >
      {content}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete product?"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? This can't be undone.` : ""}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  );
}

export default Products;