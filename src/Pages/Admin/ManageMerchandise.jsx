import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useMerchandiseLoader from "../../loaders/useMerchandiseLoader";
import {
  Plus, Edit2, Trash2, Globe, Shirt, HelpCircle, ImagePlus,
  ArrowLeft, Search, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LANGS = ["en", "hi", "mr"];

const DEFAULT_FORM_STATE = {
  id: "",
  type: "keychain",
  price: "",
  oldPrice: "",
  sizes: "Standard",
  stock: "100",
  color: "#5e6b72",
  image: "/images/merch/keychain.png",
  subImage1: "",
  subImage2: "",
  subImage3: "",
  subImage4: "",
  rating: 4.8,
  reviews: 1,
  
  // Translated details
  name: { en: "", hi: "", mr: "" },
  tagline: { en: "", hi: "", mr: "" },
  description: { en: "", hi: "", mr: "" },
  colorName: { en: "Standard", hi: "मानक", mr: "मानक" },
  
  // Highlights
  h1: { en: "", hi: "", mr: "" },
  h2: { en: "", hi: "", mr: "" },
  h3: { en: "", hi: "", mr: "" },
  h4: { en: "", hi: "", mr: "" },

  // Specs
  specMaterial: { en: "", hi: "", mr: "" },
  specSize: { en: "", hi: "", mr: "" },
  specWeight: { en: "", hi: "", mr: "" },
  specCare: { en: "", hi: "", mr: "" },
};

/* ─── Reusable Image Slot ─── */
const ImageUploaderSlot = ({ label, value, onChange, onClear }) => {
  return (
    <div className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm flex flex-col gap-2">
      <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">{label}</span>
      <div className="flex gap-2.5 items-center">
        {/* Upload file button */}
        <div className="relative w-9 h-9 border border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:border-[#B91C1C] hover:bg-red-50/20 transition cursor-pointer shrink-0">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                if (file.size > 2 * 1024 * 1024) {
                  toast.error("⚠️ Image file size must be under 2MB!");
                  return;
                }
                const reader = new FileReader();
                reader.onloadend = () => {
                  onChange(reader.result);
                  toast.info(`📸 Image uploaded for ${label}!`);
                };
                reader.readAsDataURL(file);
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <ImagePlus size={15} className="text-gray-400" />
        </div>
        
        {/* URL Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Image URL or Base64 data..."
          className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[11px] outline-none bg-white focus:border-[#B91C1C] transition font-mono truncate"
        />

        {/* Preview & Clear */}
        {value && (
          <div className="flex items-center gap-1.5 shrink-0">
            <img src={value} alt="Preview" className="w-9 h-9 object-contain rounded border bg-gray-50" />
            <button
              type="button"
              onClick={onClear}
              className="text-[10px] text-red-600 hover:text-white hover:bg-red-650 font-bold px-1.5 py-1 border border-red-200 hover:border-red-600 bg-white rounded-lg transition"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ManageMerchandise = () => {
  const { products, loading, setProducts } = useMerchandiseLoader();
  const [form, setForm] = useState(DEFAULT_FORM_STATE);
  const [formTab, setFormTab] = useState("en");
  const [editId, setEditId] = useState(null);
  
  // Custom states for view division & searching & delete confirmation
  const [view, setView] = useState("list"); // "list" | "create" | "edit"
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleLangInputChange = (lang, field, val) => {
    setForm((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: val },
    }));
  };

  const handleResetForm = () => {
    setForm(DEFAULT_FORM_STATE);
    setEditId(null);
  };

  const startEdit = (product) => {
    const isLegacy = !!product.nameKey;
    
    // Extract highlights
    const hListEn = isLegacy ? ["", "", "", ""] : (product.highlights?.en || []);
    const hListHi = isLegacy ? ["", "", "", ""] : (product.highlights?.hi || []);
    const hListMr = isLegacy ? ["", "", "", ""] : (product.highlights?.mr || []);

    // Extract specs
    const getSpec = (key, lang) => {
      if (isLegacy) return "";
      const found = product.specs?.find(s => s.key === key);
      return found?.value?.[lang] || "";
    };

    // Extract gallery/sub-images
    const galleryItems = product.gallery || [];
    const mainImg = product.image || (galleryItems[0]?.src || "");
    const subImages = galleryItems.filter(g => g.src !== mainImg);

    setForm({
      id: product.id || "",
      type: product.type || "other",
      price: product.price || "",
      oldPrice: product.oldPrice || "",
      sizes: product.sizes?.join(", ") || "Standard",
      stock: product.sizes?.map(s => product.stock[s] ?? 100).join(", ") || "100",
      color: product.color || "#5e6b72",
      image: mainImg || "/images/merch/keychain.png",
      subImage1: subImages[0]?.src || "",
      subImage2: subImages[1]?.src || "",
      subImage3: subImages[2]?.src || "",
      subImage4: subImages[3]?.src || "",
      rating: product.rating || 4.8,
      reviews: product.reviews || 1,

      name: isLegacy ? { en: product.id, hi: product.id, mr: product.id } : (product.name || { en: "", hi: "", mr: "" }),
      tagline: isLegacy ? { en: "", hi: "", mr: "" } : (product.tagline || { en: "", hi: "", mr: "" }),
      description: isLegacy ? { en: "", hi: "", mr: "" } : (product.description || { en: "", hi: "", mr: "" }),
      colorName: isLegacy ? { en: product.colorName || "", hi: product.colorName || "", mr: product.colorName || "" } : (product.colorName || { en: "", hi: "", mr: "" }),

      h1: { en: hListEn[0] || "", hi: hListHi[0] || "", mr: hListMr[0] || "" },
      h2: { en: hListEn[1] || "", hi: hListHi[1] || "", mr: hListMr[1] || "" },
      h3: { en: hListEn[2] || "", hi: hListHi[2] || "", mr: hListMr[2] || "" },
      h4: { en: hListEn[3] || "", hi: hListHi[3] || "", mr: hListMr[3] || "" },

      specMaterial: { en: getSpec("material", "en"), hi: getSpec("material", "hi"), mr: getSpec("material", "mr") },
      specSize: { en: getSpec("size", "en"), hi: getSpec("size", "hi"), mr: getSpec("size", "mr") },
      specWeight: { en: getSpec("weight", "en"), hi: getSpec("weight", "hi"), mr: getSpec("weight", "mr") },
      specCare: { en: getSpec("care", "en"), hi: getSpec("care", "hi"), mr: getSpec("care", "mr") },
    });
    
    setEditId(product.id);
    setView("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validations
    if (!form.id.trim()) {
      toast.warning("⚠️ Product ID is required!");
      return;
    }
    if (!form.name.en.trim() || !form.name.hi.trim() || !form.name.mr.trim()) {
      toast.warning("⚠️ Product Name in all languages is required!");
      return;
    }
    if (!form.price) {
      toast.warning("⚠️ Product Price is required!");
      return;
    }

    // Process sizes and stock
    const parsedSizes = form.sizes.split(",").map(s => s.trim()).filter(Boolean);
    const parsedStockList = form.stock.split(",").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    
    const sizeStockMap = {};
    parsedSizes.forEach((s, idx) => {
      sizeStockMap[s] = parsedStockList[idx] !== undefined ? parsedStockList[idx] : (parsedStockList[0] || 100);
    });

    // Compile gallery
    const gallery = [{ src: form.image, view: "hero" }];
    if (form.subImage1) gallery.push({ src: form.subImage1, view: "side" });
    if (form.subImage2) gallery.push({ src: form.subImage2, view: "side" });
    if (form.subImage3) gallery.push({ src: form.subImage3, view: "side" });
    if (form.subImage4) gallery.push({ src: form.subImage4, view: "side" });

    const compiledProduct = {
      id: form.id.trim(),
      type: form.type,
      price: parseFloat(form.price),
      oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null,
      sizes: parsedSizes,
      stock: sizeStockMap,
      rating: parseFloat(form.rating) || 4.8,
      reviews: parseInt(form.reviews, 10) || 1,
      color: form.color,
      colorName: form.colorName,
      image: form.image,
      gallery: gallery,
      
      name: form.name,
      tagline: form.tagline,
      description: form.description,
      
      highlights: {
        en: [form.h1.en, form.h2.en, form.h3.en, form.h4.en].filter(Boolean),
        hi: [form.h1.hi, form.h2.hi, form.h3.hi, form.h4.hi].filter(Boolean),
        mr: [form.h1.mr, form.h2.mr, form.h3.mr, form.h4.mr].filter(Boolean)
      },

      specs: [
        { key: "material", value: form.specMaterial },
        { key: "size", value: form.specSize },
        { key: "weight", value: form.specWeight },
        { key: "care", value: form.specCare },
      ].filter(s => s.value.en || s.value.hi || s.value.mr)
    };

    let updatedList;
    if (editId !== null) {
      updatedList = products.map(p => p.id === editId ? compiledProduct : p);
      toast.success("📦 Product updated successfully!");
    } else {
      // Check for duplicate ID
      if (products.some(p => p.id === compiledProduct.id)) {
        toast.error("⚠️ Product with this ID already exists!");
        return;
      }
      updatedList = [...products, compiledProduct];
      toast.success("📦 Product added successfully!");
    }

    setProducts(updatedList);
    handleResetForm();
    setView("list");
  };

  const filteredProducts = products.filter(p => {
    const displayName = p.nameKey ? p.id : (p.name?.en || p.id);
    const idMatch = p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const nameMatch = displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = (p.type || "").toLowerCase().includes(searchTerm.toLowerCase());
    return idMatch || nameMatch || typeMatch;
  });

  if (loading) return <div className="p-6 text-gray-500 font-semibold">Loading merchandise catalog...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 relative">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Shirt className="text-[#B91C1C]" /> Manage Merchandise
          </h1>
          <p className="text-xs text-gray-500 mt-1">Create, update, and manage official Mandal merchandise products</p>
        </div>
      </div>

      {view === "list" ? (
        /* ─── DATATABLE VIEW (All products listed) ─── */
        <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden w-full">
          {/* Controls */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
            {/* Search */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, ID or type..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C] outline-none bg-white transition"
              />
            </div>
            
            {/* Create Button in Top-Right of Data Table */}
            <button
              onClick={() => {
                handleResetForm();
                setView("create");
              }}
              className="w-full sm:w-auto bg-[#B91C1C] hover:bg-red-800 text-white font-bold py-2 px-4 rounded-xl transition text-sm flex items-center justify-center gap-1.5 shadow-sm shadow-red-200 cursor-pointer"
            >
              <Plus size={16} /> Create Product
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Product Info</th>
                  <th className="px-6 py-4">Product ID</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Sizes &amp; Stock</th>
                  <th className="px-6 py-4">Swatch Color</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-400 font-medium">
                      No products found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const displayName = p.nameKey ? p.id : (p.name?.en || p.id);
                    const totalStock = Object.values(p.stock || {}).reduce((a, b) => a + b, 0);
                    const soldOut = totalStock === 0;

                    return (
                      <tr key={p.id} className="hover:bg-gray-50/40 transition duration-150">
                        {/* Info (thumbnail + name + type) */}
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
                            <img src={p.image || p.gallery?.[0]?.src} alt={displayName} className="w-full h-full object-contain" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate max-w-[180px]">{displayName}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="inline-block text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold uppercase">{p.type || "other"}</span>
                              <span className="inline-block text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">{p.gallery?.length || 1} imgs</span>
                            </div>
                          </div>
                        </td>

                        {/* ID */}
                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                          {p.id}
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-gray-900">₹{p.price}</span>
                            {p.oldPrice && <span className="text-xs text-gray-400 line-through">₹{p.oldPrice}</span>}
                          </div>
                        </td>

                        {/* Sizes & Stock */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-max ${
                              soldOut
                                ? "bg-red-50 text-red-600"
                                : totalStock < 20
                                ? "bg-amber-50 text-amber-600"
                                : "bg-green-50 text-green-600"
                            }`}>
                              {soldOut ? "Sold Out" : `Stock: ${totalStock}`}
                            </span>
                            <div className="flex gap-1 flex-wrap mt-1">
                              {Object.entries(p.stock || {}).map(([sz, stk]) => (
                                <span key={sz} className="text-[10px] bg-gray-150 text-gray-600 px-1 py-0.5 rounded font-semibold">
                                  {sz}: {stk}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>

                        {/* Color */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full border border-gray-200 shrink-0 shadow-sm" style={{ backgroundColor: p.color }} />
                            <span className="font-mono text-xs text-gray-500">{p.color}</span>
                          </div>
                        </td>

                        {/* Rating */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-gray-700">★ {p.rating || "4.8"}</span>
                            <span className="text-gray-400 text-xs">({p.reviews || 0})</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => startEdit(p)}
                              className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center transition border-none cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(p.id)}
                              className="w-8 h-8 bg-red-50 text-red-650 rounded-lg hover:bg-red-100 flex items-center justify-center transition border-none cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ─── CREATE / UPDATE FORM VIEW (Separate page experience) ─── */
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-150 p-6 shadow-sm">
          {/* Form Header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <button
              onClick={() => {
                handleResetForm();
                setView("list");
              }}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer transition"
              type="button"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {view === "edit" ? "Edit Product Details" : "Create New Product"}
              </h2>
              <p className="text-xs text-gray-400">Configure the pricing, translations, and options for this product</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Global Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product ID *</label>
                <input
                  type="text"
                  disabled={view === "edit"}
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  placeholder="e.g. mr-keychain-2025"
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C] outline-none disabled:bg-gray-50 disabled:text-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product Type *</label>
                <input
                  type="text"
                  list="product-types"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  placeholder="e.g. keychain, mug, polo, bag"
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C] outline-none"
                  required
                />
                <datalist id="product-types">
                  <option value="polo">Polo T-Shirt</option>
                  <option value="keychain">Keychain</option>
                  <option value="mug">Coffee Mug</option>
                  <option value="bag">Tote Bag</option>
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Price (₹) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. 199"
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:border-[#B91C1C] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Old Price (₹)</label>
                <input
                  type="number"
                  value={form.oldPrice}
                  onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                  placeholder="e.g. 299"
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:border-[#B91C1C] outline-none"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Swatch Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-10 h-10 border border-gray-200 rounded-xl p-0.5 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    placeholder="#D4AF37"
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:border-[#B91C1C] font-mono outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Sizes & Stock Configuration */}
            <div className="border border-gray-150 rounded-2xl p-4 bg-gray-50/50 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Sizes &amp; Stock Configuration</label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, sizes: "S, M, L, XL, XXL", stock: "50, 50, 50, 50, 50" });
                      toast.info("👕 Clothing sizes preset applied!");
                    }}
                    className="text-xs bg-white border hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg font-semibold shadow-sm transition cursor-pointer"
                  >
                    Preset: Clothing (S, M, L, XL, XXL)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, sizes: "Standard", stock: "100" });
                      toast.info("📦 Standard non-clothing size applied!");
                    }}
                    className="text-xs bg-white border hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg font-semibold shadow-sm transition cursor-pointer"
                  >
                    Preset: Non-Clothing (Standard)
                  </button>
                </div>
              </div>

              {form.sizes.split(",").map(s => s.trim().toUpperCase()).some(s => ["S", "M", "L", "XL", "XXL"].includes(s)) ? (
                /* Apparel Size Matrix Checklist */
                <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-3 shadow-sm">
                  <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Apparel Size Matrix</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {["S", "M", "L", "XL", "XXL"].map((sz) => {
                      const sizesArr = form.sizes.split(",").map(s => s.trim()).filter(Boolean);
                      const stockArr = form.stock.split(",").map(s => s.trim()).filter(Boolean);
                      const sizeIdx = sizesArr.indexOf(sz);
                      const isChecked = sizeIdx !== -1;
                      const sizeStock = isChecked ? (stockArr[sizeIdx] || "0") : "";

                      const handleCheckboxToggle = () => {
                        let newSizes = [...sizesArr];
                        let newStock = [...stockArr];
                        if (isChecked) {
                          newSizes.splice(sizeIdx, 1);
                          newStock.splice(sizeIdx, 1);
                        } else {
                          newSizes.push(sz);
                          newStock.push("50");
                        }
                        // Sort sizes to maintain S, M, L, XL, XXL order
                        const order = ["S", "M", "L", "XL", "XXL"];
                        const paired = newSizes.map((name, i) => ({ name, val: newStock[i] || "50" }));
                        paired.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
                        
                        setForm({
                          ...form,
                          sizes: paired.map(p => p.name).join(", "),
                          stock: paired.map(p => p.val).join(", ")
                        });
                      };

                      const handleStockChange = (e) => {
                        let newStock = [...stockArr];
                        if (sizeIdx !== -1) {
                          newStock[sizeIdx] = e.target.value;
                          setForm({ ...form, stock: newStock.join(", ") });
                        }
                      };

                      return (
                        <div key={sz} className={`border rounded-xl p-2.5 flex flex-col items-center gap-1.5 transition ${
                          isChecked ? "bg-red-50/20 border-[#B91C1C] shadow-sm" : "bg-gray-50/40 border-gray-150 opacity-50"
                        }`}>
                          <label className="flex items-center gap-1.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={handleCheckboxToggle}
                              className="accent-[#B91C1C]"
                            />
                            <span className="font-bold text-xs text-gray-800">{sz}</span>
                          </label>
                          {isChecked ? (
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] text-gray-400 font-semibold mb-0.5">Stock</span>
                              <input
                                type="number"
                                min="0"
                                value={sizeStock}
                                onChange={handleStockChange}
                                placeholder="Qty"
                                className="w-14 text-center border border-gray-200 rounded px-1 py-0.5 text-xs focus:border-[#B91C1C] outline-none"
                              />
                            </div>
                          ) : (
                            <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">Not Offered</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-gray-400 leading-tight">
                    * Checking a size enables it. Unchecked sizes will be marked as <strong>Not Available / N/A</strong> on the user-facing store page.
                  </p>
                </div>
              ) : (
                /* Fallback Comma-separated Inputs (for keychain, mug, etc.) */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Sizes (Comma-separated)</label>
                    <input
                      type="text"
                      value={form.sizes}
                      onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                      placeholder="e.g. Standard"
                      className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:border-[#B91C1C] outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Stock (Comma-separated)</label>
                    <input
                      type="text"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      placeholder="e.g. 100"
                      className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:border-[#B91C1C] outline-none bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Main Product Image Section */}
            <div className="border border-gray-150 rounded-2xl p-4 bg-gray-50/50">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-3">Main Product Image *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* File Upload from PC */}
                <div className="flex flex-col justify-center items-center border-2 border-dashed border-gray-250 rounded-2xl p-4 bg-white hover:bg-red-50/10 hover:border-[#B91C1C] transition relative min-h-[110px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          toast.error("⚠️ Image file size must be under 2MB!");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setForm({ ...form, image: reader.result });
                          toast.info("📸 Main image loaded from PC!");
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="text-center pointer-events-none">
                    <ImagePlus size={20} className="text-gray-450 mx-auto mb-1" />
                    <span className="text-xs font-bold text-gray-600">Choose main image file</span>
                    <p className="text-[9px] text-gray-400 mt-0.5">PNG, JPG, JPEG, WebP (Max 2MB)</p>
                  </div>
                </div>

                {/* Text input for URL */}
                <div className="flex flex-col justify-between">
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Or enter image URL</span>
                    <input
                      type="text"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder="e.g. /images/merch/keychain.png"
                      className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:border-[#B91C1C] outline-none"
                    />
                  </div>
                  {form.image && (
                    <div className="mt-2 flex items-center gap-2 border rounded-xl p-1.5 bg-white shadow-sm">
                      <img src={form.image} alt="Preview" className="w-10 h-10 object-contain rounded shrink-0 bg-gray-50 border" />
                      <span className="text-[10px] text-gray-400 font-mono truncate max-w-[150px]">{form.image.startsWith("data:") ? "Uploaded Local Image" : form.image}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sub Gallery / Side Images Section */}
            <div className="border border-gray-150 rounded-2xl p-4 bg-gray-50/50">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-3">Product Gallery Sub-Images (Optional, up to 4 side images)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ImageUploaderSlot
                  label="Sub Image 1 (Side View)"
                  value={form.subImage1}
                  onChange={(val) => setForm({ ...form, subImage1: val })}
                  onClear={() => setForm({ ...form, subImage1: "" })}
                />
                <ImageUploaderSlot
                  label="Sub Image 2 (Detail View)"
                  value={form.subImage2}
                  onChange={(val) => setForm({ ...form, subImage2: val })}
                  onClear={() => setForm({ ...form, subImage2: "" })}
                />
                <ImageUploaderSlot
                  label="Sub Image 3 (Packaging View)"
                  value={form.subImage3}
                  onChange={(val) => setForm({ ...form, subImage3: val })}
                  onClear={() => setForm({ ...form, subImage3: "" })}
                />
                <ImageUploaderSlot
                  label="Sub Image 4 (Extra View)"
                  value={form.subImage4}
                  onChange={(val) => setForm({ ...form, subImage4: val })}
                  onClear={() => setForm({ ...form, subImage4: "" })}
                />
              </div>
            </div>

            {/* TAB CONTAINER (Language Fields) */}
            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
              <div className="flex items-center justify-between border-b pb-2 mb-4">
                <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <Globe size={15} className="text-gray-500" /> Locale Translation Details
                </span>
                
                {/* Languages selector tabs */}
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  {LANGS.map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setFormTab(l)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-md transition ${
                        formTab === l ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Render Tab Contents */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Product Name ({formTab.toUpperCase()}) *</label>
                  <input
                    type="text"
                    value={form.name[formTab]}
                    onChange={(e) => handleLangInputChange(formTab, "name", e.target.value)}
                    placeholder="Enter product title..."
                    className="w-full border border-gray-200 bg-white rounded-xl p-2.5 text-sm focus:border-[#B91C1C] outline-none"
                    required={formTab === "en"}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Tagline ({formTab.toUpperCase()})</label>
                    <input
                      type="text"
                      value={form.tagline[formTab]}
                      onChange={(e) => handleLangInputChange(formTab, "tagline", e.target.value)}
                      placeholder="e.g. Keep the blessings close..."
                      className="w-full border border-gray-200 bg-white rounded-xl p-2.5 text-sm focus:border-[#B91C1C] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Color Name ({formTab.toUpperCase()})</label>
                    <input
                      type="text"
                      value={form.colorName[formTab]}
                      onChange={(e) => handleLangInputChange(formTab, "colorName", e.target.value)}
                      placeholder="e.g. Heritage Grey"
                      className="w-full border border-gray-200 bg-white rounded-xl p-2.5 text-sm focus:border-[#B91C1C] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Description ({formTab.toUpperCase()})</label>
                  <textarea
                    rows={3}
                    value={form.description[formTab]}
                    onChange={(e) => handleLangInputChange(formTab, "description", e.target.value)}
                    placeholder="Enter rich details about the product..."
                    className="w-full border border-gray-200 bg-white rounded-xl p-2.5 text-sm focus:border-[#B91C1C] outline-none"
                  />
                </div>

                {/* Highlights */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Key Highlights / Features ({formTab.toUpperCase()})</label>
                  <div className="space-y-2">
                    {["h1", "h2", "h3", "h4"].map((hField, idx) => (
                      <input
                        key={hField}
                        type="text"
                        value={form[hField][formTab]}
                        onChange={(e) => handleLangInputChange(formTab, hField, e.target.value)}
                        placeholder={`Feature bullet ${idx + 1}`}
                        className="w-full border border-gray-200 bg-white rounded-xl p-2 text-xs focus:border-[#B91C1C] outline-none"
                      />
                    ))}
                  </div>
                </div>

                {/* Specs */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Product Specifications ({formTab.toUpperCase()})</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[10px] text-gray-500 font-semibold mb-0.5">Material</span>
                      <input
                        type="text"
                        value={form.specMaterial[formTab]}
                        onChange={(e) => handleLangInputChange(formTab, "specMaterial", e.target.value)}
                        placeholder="e.g. Zinc Alloy"
                        className="w-full border border-gray-200 bg-white rounded-xl p-2 text-xs focus:border-[#B91C1C] outline-none"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 font-semibold mb-0.5">Size/Dimension</span>
                      <input
                        type="text"
                        value={form.specSize[formTab]}
                        onChange={(e) => handleLangInputChange(formTab, "specSize", e.target.value)}
                        placeholder="e.g. 2.5 x 1.5 inches"
                        className="w-full border border-gray-200 bg-white rounded-xl p-2 text-xs focus:border-[#B91C1C] outline-none"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 font-semibold mb-0.5">Weight/Capacity</span>
                      <input
                        type="text"
                        value={form.specWeight[formTab]}
                        onChange={(e) => handleLangInputChange(formTab, "specWeight", e.target.value)}
                        placeholder="e.g. 45 Grams"
                        className="w-full border border-gray-200 bg-white rounded-xl p-2 text-xs focus:border-[#B91C1C] outline-none"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 font-semibold mb-0.5">Care/Finish</span>
                      <input
                        type="text"
                        value={form.specCare[formTab]}
                        onChange={(e) => handleLangInputChange(formTab, "specCare", e.target.value)}
                        placeholder="e.g. Gold Plated / Microwave Safe"
                        className="w-full border border-gray-200 bg-white rounded-xl p-2 text-xs focus:border-[#B91C1C] outline-none"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className={`flex-1 ${
                  view === "edit" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
                } text-white font-bold py-2.5 px-4 rounded-xl transition text-sm shadow-sm flex items-center justify-center gap-1.5 cursor-pointer`}
              >
                {view === "edit" ? "Update Product" : "Create Product"}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  handleResetForm();
                  setView("list");
                }}
                className="bg-gray-150 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl transition text-sm shadow-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Product?</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  Are you sure you want to delete the product with ID <span className="font-semibold text-gray-700 font-mono">{deleteConfirmId}</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedList = products.filter(p => p.id !== deleteConfirmId);
                      setProducts(updatedList);
                      setDeleteConfirmId(null);
                      toast.success("📦 Product deleted successfully!");
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition text-sm cursor-pointer shadow-md shadow-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default ManageMerchandise;
