import { useState, useEffect, useMemo } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import {
  HiPlus, HiPencil, HiTrash, HiX, HiEye, HiEyeOff,
  HiSearch, HiClipboard, HiCheck, HiTicket, HiClock,
  HiExclamationCircle, HiFilter, HiChevronDown, HiSparkles,
  HiTrendingUp, HiTag, HiCalendar, HiShieldCheck,
} from 'react-icons/hi';

const emptyCoupon = {
  code: '',
  type: 'percentage',
  value: '',
  minOrderValue: '',
  maxDiscountCap: '',
  usageLimit: '',
  expiry: '',
  active: true,
};

/* ─── tiny helper ─── */
const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCoupon);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | inactive | expired
  const [copiedId, setCopiedId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [modalAnimating, setModalAnimating] = useState(false);

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      const { data } = await API.get('/coupons');
      setCoupons(data);
    } catch { toast.error('Failed to load coupons'); }
    finally { setLoading(false); }
  };

  /* ── derived data ── */
  const isExpired = (date) => new Date(date) < new Date();

  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter(c => c.active && !isExpired(c.expiry)).length;
    const expired = coupons.filter(c => isExpired(c.expiry)).length;
    const totalUsed = coupons.reduce((s, c) => s + (c.usedCount || 0), 0);
    return { total, active, expired, totalUsed };
  }, [coupons]);

  const filtered = useMemo(() => {
    let list = [...coupons];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.code.toLowerCase().includes(q));
    }
    if (filter === 'active') list = list.filter(c => c.active && !isExpired(c.expiry));
    else if (filter === 'inactive') list = list.filter(c => !c.active);
    else if (filter === 'expired') list = list.filter(c => isExpired(c.expiry));
    return list;
  }, [coupons, search, filter]);

  /* ── actions ── */
  const openAdd = () => { setEditing(null); setForm(emptyCoupon); openModal(); };

  const openEdit = (coupon) => {
    setEditing(coupon._id);
    setForm({
      code: coupon.code, type: coupon.type, value: coupon.value,
      minOrderValue: coupon.minOrderValue || '',
      maxDiscountCap: coupon.maxDiscountCap || '',
      usageLimit: coupon.usageLimit || '',
      expiry: coupon.expiry ? new Date(coupon.expiry).toISOString().split('T')[0] : '',
      active: coupon.active,
    });
    openModal();
  };

  const openModal = () => { setShowModal(true); setTimeout(() => setModalAnimating(true), 10); };
  const closeModal = () => { setModalAnimating(false); setTimeout(() => setShowModal(false), 250); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code: form.code, type: form.type, value: Number(form.value),
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
        maxDiscountCap: form.type === 'percentage' && form.maxDiscountCap ? Number(form.maxDiscountCap) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiry: form.expiry, active: form.active,
      };
      if (editing) { await API.put(`/coupons/${editing}`, payload); toast.success('Coupon updated'); }
      else { await API.post('/coupons', payload); toast.success('Coupon created'); }
      closeModal();
      fetchCoupons();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save coupon'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (coupon) => {
    try {
      await API.put(`/coupons/${coupon._id}`, { active: !coupon.active });
      toast.success(coupon.active ? 'Coupon deactivated' : 'Coupon activated');
      fetchCoupons();
    } catch { toast.error('Failed to update coupon'); }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      setDeleteConfirm(null);
      fetchCoupons();
    } catch { toast.error('Failed to delete coupon'); }
  };

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success(`Copied "${code}"`);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getExpiryBadge = (date) => {
    const days = daysUntil(date);
    if (days < 0) return { text: 'Expired', cls: 'bg-red-50 text-red-600 border-red-200' };
    if (days <= 7) return { text: `${days}d left`, cls: 'bg-amber-50 text-amber-600 border-amber-200' };
    return { text: new Date(date).toLocaleDateString('en-IN'), cls: 'bg-gray-50 text-gray-600 border-gray-200' };
  };

  const usagePercent = (c) => (c.usageLimit ? Math.min((c.usedCount || 0) / c.usageLimit * 100, 100) : 0);

  /* ─────────── RENDER ─────────── */

  const statCards = [
    { label: 'Total Coupons', value: stats.total, icon: HiTicket, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', iconBg: 'bg-violet-100', text: 'text-violet-600' },
    { label: 'Active', value: stats.active, icon: HiShieldCheck, gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', text: 'text-emerald-600' },
    { label: 'Expired', value: stats.expired, icon: HiClock, gradient: 'from-rose-500 to-red-600', bg: 'bg-rose-50', iconBg: 'bg-rose-100', text: 'text-rose-600' },
    { label: 'Total Redemptions', value: stats.totalUsed, icon: HiTrendingUp, gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', iconBg: 'bg-amber-100', text: 'text-amber-600' },
  ];

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' },
    { key: 'expired', label: 'Expired' },
  ];

  return (
    <div className="space-y-6">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label}
            className="group relative bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100/50 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
            {/* decorative accent */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${s.gradient} opacity-[0.06] rounded-bl-[60px] -mr-4 -mt-4 group-hover:opacity-[0.10] transition-opacity`} />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1.5">{s.value}</p>
              </div>
              <div className={`${s.iconBg} p-2.5 rounded-xl`}>
                <s.icon className={`w-5 h-5 ${s.text}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {filterTabs.map((t) => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === t.key
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="flex items-center bg-white rounded-xl px-4 py-2.5 gap-2 flex-1 sm:w-64 border border-gray-200 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all shadow-sm">
            <HiSearch className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code..."
              className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500 transition">
                <HiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Add button */}
          <button onClick={openAdd}
            className="btn-primary flex items-center gap-2 whitespace-nowrap shadow-lg shadow-primary-200/50 hover:shadow-primary-300/50 transition-all">
            <HiPlus className="w-4 h-4" /> Add Coupon
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 skeleton rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        /* Empty State */
        <div className="card flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-5">
            <HiTicket className="w-10 h-10 text-primary-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            {search || filter !== 'all' ? 'No coupons found' : 'No coupons yet'}
          </h3>
          <p className="text-sm text-gray-400 mb-6 max-w-xs">
            {search || filter !== 'all'
              ? 'Try a different search term or filter.'
              : 'Create your first coupon to start offering discounts to your customers.'}
          </p>
          {!search && filter === 'all' && (
            <button onClick={openAdd} className="btn-primary flex items-center gap-2">
              <HiSparkles className="w-4 h-4" /> Create First Coupon
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ─ Desktop Table ─ */}
          <div className="hidden lg:block card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-50/50 text-left">
                    <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Code</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Value</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Min Order</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Usage</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Expiry</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((coupon) => {
                    const expBadge = getExpiryBadge(coupon.expiry);
                    return (
                      <tr key={coupon._id} className="group hover:bg-primary-50/30 transition-colors duration-200">
                        {/* Code */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 font-mono font-bold text-xs px-3 py-1.5 rounded-lg border border-primary-100">
                              <HiTag className="w-3.5 h-3.5" />
                              {coupon.code}
                            </span>
                            <button onClick={() => copyCode(coupon.code, coupon._id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-primary-600 rounded-md transition-all duration-200">
                              {copiedId === coupon._id
                                ? <HiCheck className="w-3.5 h-3.5 text-green-500" />
                                : <HiClipboard className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        {/* Type */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                            coupon.type === 'percentage'
                              ? 'bg-blue-50 text-blue-600 border border-blue-100'
                              : 'bg-purple-50 text-purple-600 border border-purple-100'
                          }`}>
                            {coupon.type === 'percentage' ? '% Percent' : '₹ Fixed'}
                          </span>
                        </td>
                        {/* Value */}
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-gray-900">
                            {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                          </span>
                          {coupon.maxDiscountCap && (
                            <span className="text-[11px] text-gray-400 block mt-0.5">cap ₹{coupon.maxDiscountCap}</span>
                          )}
                        </td>
                        {/* Min Order */}
                        <td className="px-6 py-4">
                          <span className="text-gray-700 font-medium">₹{coupon.minOrderValue || 0}</span>
                        </td>
                        {/* Usage */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-16">
                              <div className="flex justify-between text-[11px] font-medium mb-1">
                                <span className="text-gray-600">{coupon.usedCount || 0}</span>
                                <span className="text-gray-400">/{coupon.usageLimit || '∞'}</span>
                              </div>
                              {coupon.usageLimit && (
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      usagePercent(coupon) >= 90 ? 'bg-red-400' :
                                      usagePercent(coupon) >= 60 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                    style={{ width: `${usagePercent(coupon)}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        {/* Expiry */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${expBadge.cls}`}>
                            <HiCalendar className="w-3 h-3" />
                            {expBadge.text}
                          </span>
                        </td>
                        {/* Status */}
                        <td className="px-6 py-4">
                          <button onClick={() => toggleActive(coupon)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                              coupon.active ? 'bg-emerald-500 focus:ring-emerald-300' : 'bg-gray-300 focus:ring-gray-300'
                            }`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                              coupon.active ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </td>
                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEdit(coupon)}
                              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                              title="Edit coupon">
                              <HiPencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(coupon._id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                              title="Delete coupon">
                              <HiTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ─ Mobile / Tablet Cards ─ */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((coupon) => {
              const expBadge = getExpiryBadge(coupon.expiry);
              return (
                <div key={coupon._id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300">
                  {/* header strip */}
                  <div className={`h-1.5 ${coupon.active && !isExpired(coupon.expiry)
                    ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                    : isExpired(coupon.expiry)
                      ? 'bg-gradient-to-r from-red-400 to-rose-500'
                      : 'bg-gradient-to-r from-gray-300 to-gray-400'}`} />

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 font-mono font-bold text-sm px-3 py-1.5 rounded-lg border border-primary-100">
                          <HiTag className="w-3.5 h-3.5" />
                          {coupon.code}
                        </span>
                        <button onClick={() => copyCode(coupon.code, coupon._id)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg transition">
                          {copiedId === coupon._id ? <HiCheck className="w-4 h-4 text-green-500" /> : <HiClipboard className="w-4 h-4" />}
                        </button>
                      </div>
                      <button onClick={() => toggleActive(coupon)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                          coupon.active ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}>
                        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                          coupon.active ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="text-3xl font-extrabold text-gray-900 mb-4">
                      {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                      <span className="text-xs font-medium text-gray-400 ml-1.5">{coupon.type === 'percentage' ? 'OFF' : 'FLAT'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                      <div className="bg-gray-50 rounded-xl p-2.5">
                        <p className="text-gray-400 mb-0.5">Min Order</p>
                        <p className="font-bold text-gray-700">₹{coupon.minOrderValue || 0}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2.5">
                        <p className="text-gray-400 mb-0.5">Usage</p>
                        <p className="font-bold text-gray-700">{coupon.usedCount || 0}/{coupon.usageLimit || '∞'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${expBadge.cls}`}>
                        <HiCalendar className="w-3 h-3" />
                        {expBadge.text}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(coupon)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition">
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(coupon._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition">
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Result count */}
          <p className="text-xs text-gray-400 text-center pt-2">
            Showing {filtered.length} of {coupons.length} coupon{coupons.length !== 1 ? 's' : ''}
          </p>
        </>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiExclamationCircle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Delete Coupon?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This action cannot be undone. The coupon will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-250 ${
          modalAnimating ? 'bg-black/40 backdrop-blur-sm' : 'bg-black/0'}`}
          onClick={closeModal}>
          <div className={`bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-250 ${
            modalAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
            onClick={(e) => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="relative px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  editing ? 'bg-primary-50' : 'bg-emerald-50'}`}>
                  {editing
                    ? <HiPencil className="w-5 h-5 text-primary-600" />
                    : <HiSparkles className="w-5 h-5 text-emerald-600" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Coupon' : 'Create New Coupon'}</h2>
                  <p className="text-xs text-gray-400">{editing ? 'Update coupon details' : 'Set up a new discount for your customers'}</p>
                </div>
              </div>
              <button onClick={closeModal}
                className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <HiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Coupon Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <HiTag className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="input-field font-mono pl-10 tracking-wider"
                    placeholder="e.g. SAVE20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discount Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Value {form.type === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input type="number" value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    className="input-field" min="0" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Min Order Value (₹)</label>
                  <input type="number" value={form.minOrderValue}
                    onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                    className="input-field" min="0" placeholder="0" />
                </div>
                {form.type === 'percentage' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Max Discount Cap (₹)</label>
                    <input type="number" value={form.maxDiscountCap}
                      onChange={(e) => setForm({ ...form, maxDiscountCap: e.target.value })}
                      className="input-field" min="0" placeholder="No cap" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Usage Limit</label>
                  <input type="number" value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    className="input-field" min="0" placeholder="Unlimited" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expiry Date</label>
                  <input type="date" value={form.expiry}
                    onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                    className="input-field" required />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Active Status</p>
                  <p className="text-xs text-gray-400">Coupon will be available for customers</p>
                </div>
                <button type="button" onClick={() => setForm({ ...form, active: !form.active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                    form.active ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}>
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    form.active ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={saving}>
                  {saving ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                  ) : editing ? (
                    <><HiCheck className="w-4 h-4" /> Update Coupon</>
                  ) : (
                    <><HiPlus className="w-4 h-4" /> Create Coupon</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
