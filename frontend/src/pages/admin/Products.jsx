import { useState, useEffect } from 'react';
import API from '../../api/axios';

import toast from 'react-hot-toast';
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiX,
  HiEye,
  HiEyeOff,
  HiCube,
  HiCurrencyRupee,
  HiTag,
  HiSearch,
  HiSortDescending,
  HiFilter,
} from 'react-icons/hi';

const emptyProduct = {
  name: '',
  description: '',
  category: '',
  price: '',
  discountPrice: '',
  stock: '',
  active: true,
  images: [],
  specifications: [],
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get('/products?limit=100');
      setProducts(data.products);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyProduct);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product._id);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      discountPrice: product.discountPrice || '',
      stock: product.stock,
      active: product.active,
      images: product.images || [],
      specifications: product.specifications || [],
    });
    setShowModal(true);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, reader.result],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        stock: Number(form.stock),
        specifications: form.specifications.filter((s) => s.key.trim() && s.value.trim()),
      };

      if (editing) {
        await API.put(`/products/${editing}`, payload);
        toast.success('Product updated');
      } else {
        await API.post('/products', payload);
        toast.success('Product created');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (product) => {
    try {
      await API.put(`/products/${product._id}`, { active: !product.active });
      toast.success(product.active ? 'Product deactivated' : 'Product activated');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to update product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  // Get short product name (before first comma)
  const getShortName = (name) => {
    if (!name) return 'Unknown';
    const parts = name.split(',');
    return parts[0].length > 45 ? parts[0].substring(0, 45) + '…' : parts[0];
  };

  // Derived data
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const totalValue = products.reduce((sum, p) => sum + (p.discountPrice || p.price) * p.stock, 0);
  const activeCount = products.filter((p) => p.active).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  // Filter & sort
  const filteredProducts = products
    .filter((p) => {
      const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = !filterCategory || p.category === filterCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      if (sortBy === 'price-desc') return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      if (sortBy === 'stock') return a.stock - b.stock;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // newest (default order from API)
    });

  // Stock color helper
  const stockColor = (stock) => {
    if (stock === 0) return 'text-red-600 bg-red-50';
    if (stock <= 5) return 'text-amber-600 bg-amber-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  const discountPercent = (price, discountPrice) => {
    if (!discountPrice || discountPrice >= price) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                <HiCube className="w-4 h-4 text-primary-600" />
              </div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <HiEye className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Active</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <HiTag className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Low Stock</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{lowStockCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                <HiX className="w-4 h-4 text-red-500" />
              </div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Out of Stock</span>
            </div>
            <p className="text-2xl font-bold text-red-500">{outOfStockCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <HiCurrencyRupee className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Inventory</span>
            </div>
            <p className="text-xl font-bold text-gray-900">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <HiFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="relative">
          <HiSortDescending className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none appearance-none cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="name">Name</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="stock">Stock: Low → High</option>
          </select>
        </div>

        {/* Add Product */}
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-md shadow-primary-200 text-sm whitespace-nowrap"
        >
          <HiPlus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="w-full h-40 skeleton rounded-xl mb-3" />
              <div className="h-4 skeleton rounded w-3/4 mb-2" />
              <div className="h-3 skeleton rounded w-1/2 mb-3" />
              <div className="flex justify-between">
                <div className="h-5 skeleton rounded w-20" />
                <div className="h-5 skeleton rounded w-12" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">{searchTerm || filterCategory ? '🔍' : '📦'}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">
            {searchTerm || filterCategory ? 'No matching products' : 'No products yet'}
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            {searchTerm || filterCategory ? 'Try a different search or filter' : 'Add your first product to get started'}
          </p>
          {!searchTerm && !filterCategory && (
            <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2">
              <HiPlus className="w-4 h-4" /> Add Product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const dp = discountPercent(product.price, product.discountPrice);
            const displayPrice = product.discountPrice || product.price;

            return (
              <div
                key={product._id}
                className={`group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 ${
                  !product.active ? 'opacity-60' : ''
                }`}
              >
                {/* Image Area */}
                <div className="relative h-44 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt=""
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center">
                      <HiCube className="w-8 h-8 text-gray-300" />
                    </div>
                  )}

                  {/* Discount Badge */}
                  {dp > 0 && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                      {dp}% OFF
                    </span>
                  )}

                  {/* Status Badge */}
                  <span
                    className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      product.active
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-400 text-white'
                    }`}
                  >
                    {product.active ? 'Active' : 'Inactive'}
                  </span>

                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="w-9 h-9 bg-white rounded-xl shadow-lg flex items-center justify-center text-primary-600 hover:bg-primary-50 transition-all active:scale-90"
                        title="Edit"
                      >
                        <HiPencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(product)}
                        className="w-9 h-9 bg-white rounded-xl shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all active:scale-90"
                        title={product.active ? 'Deactivate' : 'Activate'}
                      >
                        {product.active ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="w-9 h-9 bg-white rounded-xl shadow-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-all active:scale-90"
                        title="Delete"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Category */}
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
                    {product.category || 'Uncategorized'}
                  </span>

                  {/* Name */}
                  <h3 className="text-sm font-semibold text-gray-900 mt-2 line-clamp-2 leading-snug min-h-[2.5rem]">
                    {getShortName(product.name)}
                  </h3>

                  {/* Price & Stock Row */}
                  <div className="flex items-end justify-between mt-3 pt-3 border-t border-gray-50">
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        ₹{displayPrice.toLocaleString('en-IN')}
                      </p>
                      {product.discountPrice && product.discountPrice < product.price && (
                        <p className="text-xs text-gray-400 line-through">
                          ₹{product.price.toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${stockColor(product.stock)}`}
                    >
                      {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Results count */}
      {!loading && filteredProducts.length > 0 && (searchTerm || filterCategory) && (
        <p className="text-center text-sm text-gray-400">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editing ? 'bg-blue-50' : 'bg-emerald-50'}`}>
                    {editing ? <HiPencil className="w-5 h-5 text-blue-600" /> : <HiPlus className="w-5 h-5 text-emerald-600" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Product' : 'New Product'}</h2>
                    <p className="text-xs text-gray-400">{editing ? 'Update product details' : 'Add a new product to your store'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
                >
                  <HiX className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input-field h-24 resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="input-field"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="input-field"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (₹)</label>
                    <input
                      type="number"
                      value={form.discountPrice}
                      onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                      className="input-field"
                      min="0"
                      step="0.01"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="input-field text-sm"
                  />
                  {form.images.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {form.images.map((img, i) => (
                        <div key={i} className="relative w-16 h-16">
                          <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Specifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specifications</label>
                  {form.specifications.map((spec, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) => {
                          const updated = [...form.specifications];
                          updated[i] = { ...updated[i], key: e.target.value };
                          setForm({ ...form, specifications: updated });
                        }}
                        className="input-field flex-1"
                        placeholder="e.g. Weight"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => {
                          const updated = [...form.specifications];
                          updated[i] = { ...updated[i], value: e.target.value };
                          setForm({ ...form, specifications: updated });
                        }}
                        className="input-field flex-1"
                        placeholder="e.g. 250g"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setForm({
                            ...form,
                            specifications: form.specifications.filter((_, idx) => idx !== i),
                          });
                        }}
                        className="text-red-400 hover:text-red-600 px-1"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        specifications: [...form.specifications, { key: '', value: '' }],
                      })
                    }
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    <HiPlus className="w-3.5 h-3.5" /> Add Specification
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">Active</label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all active:scale-95 text-sm">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-md shadow-primary-200 disabled:opacity-50 text-sm"
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </span>
                    ) : editing ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}
