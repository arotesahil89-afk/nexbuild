import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useMerchandiseLoader from "../../loaders/useMerchandiseLoader";
import { Plus, Edit2, Trash2, Globe, Shirt, HelpCircle, ImagePlus } from "lucide-react";

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

const ManageMerchandise = () => {
  const { products, loading, setProducts } = useMerchandiseLoader();
  const [form, setForm] = useState(DEFAULT_FORM_STATE);
  const [formTab, setFormTab] = useState("en");
  const [editId, setEditId] = useState(null);

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

    setForm({
      id: product.id || "",
      type: product.type || "other",
      price: product.price || "",
      oldPrice: product.oldPrice || "",
      sizes: product.sizes?.join(", ") || "Standard",
      stock: product.sizes?.map(s => product.stock[s] ?? 100).join(", ") || "100",
      color: product.color || "#5e6b72",
      image: product.image || (product.gallery?.[0]?.src || "/images/merch/keychain.png"),
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this merchandise product?")) {
      const updatedList = products.filter(p => p.id !== productId);
      setProducts(updatedList);
      toast.success("📦 Product deleted successfully!");
    }
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
      gallery: [{ src: form.image, view: "hero" }],
      
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
  };

  if (loading) return <div className="p-6 text-gray-500 font-semibold">Loading merchandise catalog...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Shirt className="text-[#B91C1C]" /> Manage Merchandise
          </h1>
          <p className="text-xs text-gray-500 mt-1">Create, update, and manage official Mandal merchandise products</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORM CONTAINER (Left column) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm self-start">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
            {editId !== null ? <Edit2 size={18} className="text-blue-500" /> : <Plus size={18} className="text-green-500" />}
            {editId !== null ? "Edit Product Details" : "Add New Merchandise"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Global Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product ID *</label>
                <input
                  type="text"
                  disabled={editId !== null}
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  placeholder="e.g. mr-keychain-2025"
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C] disabled:bg-gray-50 disabled:text-gray-400"
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
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
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
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:border-[#B91C1C]"
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
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:border-[#B91C1C]"
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
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:border-[#B91C1C] font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1">
                  Sizes <span className="text-[10px] text-gray-400 font-normal">(Comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={form.sizes}
                  onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                  placeholder="e.g. S, M, L or Standard"
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:border-[#B91C1C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1">
                  Stock <span className="text-[10px] text-gray-400 font-normal">(Comma-separated matching sizes)</span>
                </label>
                <input
                  type="text"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="e.g. 45, 12, 120 or 150"
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:border-[#B91C1C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product Image</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* File Upload from PC */}
                <div className="flex flex-col justify-center items-center border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300 transition relative min-h-[110px]">
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
                          toast.info("📸 Image loaded from PC!");
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="text-center pointer-events-none">
                    <ImagePlus size={20} className="text-gray-400 mx-auto mb-1" />
                    <span className="text-xs font-bold text-gray-600">Choose file from PC</span>
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
                      className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:border-[#B91C1C]"
                    />
                  </div>
                  {form.image && (
                    <div className="mt-2 flex items-center gap-2 border rounded-xl p-1.5 bg-white">
                      <img src={form.image} alt="Preview" className="w-10 h-10 object-contain rounded shrink-0 bg-gray-50 border" />
                      <span className="text-[10px] text-gray-400 font-mono truncate max-w-[150px]">{form.image.startsWith("data:") ? "Uploaded Local Image" : form.image}</span>
                    </div>
                  )}
                </div>
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
                    className="w-full border border-gray-200 bg-white rounded-xl p-2.5 text-sm focus:border-[#B91C1C]"
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
                      className="w-full border border-gray-200 bg-white rounded-xl p-2.5 text-sm focus:border-[#B91C1C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Color Name ({formTab.toUpperCase()})</label>
                    <input
                      type="text"
                      value={form.colorName[formTab]}
                      onChange={(e) => handleLangInputChange(formTab, "colorName", e.target.value)}
                      placeholder="e.g. Heritage Grey"
                      className="w-full border border-gray-200 bg-white rounded-xl p-2.5 text-sm focus:border-[#B91C1C]"
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
                    className="w-full border border-gray-200 bg-white rounded-xl p-2.5 text-sm focus:border-[#B91C1C]"
                  />
                </div>

                {/* Highlights Tab Specific */}
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
                        className="w-full border border-gray-200 bg-white rounded-xl p-2 text-xs focus:border-[#B91C1C]"
                      />
                    ))}
                  </div>
                </div>

                {/* Specs Tab Specific */}
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
                        className="w-full border border-gray-200 bg-white rounded-xl p-2 text-xs focus:border-[#B91C1C]"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 font-semibold mb-0.5">Size/Dimension</span>
                      <input
                        type="text"
                        value={form.specSize[formTab]}
                        onChange={(e) => handleLangInputChange(formTab, "specSize", e.target.value)}
                        placeholder="e.g. 2.5 x 1.5 inches"
                        className="w-full border border-gray-200 bg-white rounded-xl p-2 text-xs focus:border-[#B91C1C]"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 font-semibold mb-0.5">Weight/Capacity</span>
                      <input
                        type="text"
                        value={form.specWeight[formTab]}
                        onChange={(e) => handleLangInputChange(formTab, "specWeight", e.target.value)}
                        placeholder="e.g. 45 Grams"
                        className="w-full border border-gray-200 bg-white rounded-xl p-2 text-xs focus:border-[#B91C1C]"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 font-semibold mb-0.5">Care/Finish</span>
                      <input
                        type="text"
                        value={form.specCare[formTab]}
                        onChange={(e) => handleLangInputChange(formTab, "specCare", e.target.value)}
                        placeholder="e.g. Gold Plated / Microwave Safe"
                        className="w-full border border-gray-200 bg-white rounded-xl p-2 text-xs focus:border-[#B91C1C]"
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
                  editId !== null ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
                } text-white font-bold py-2.5 px-4 rounded-xl transition text-sm shadow-sm flex items-center justify-center gap-1.5`}
              >
                {editId !== null ? "Update Product" : "Add Product"}
              </button>
              
              {editId !== null && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2.5 px-4 rounded-xl transition text-sm shadow-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* PRODUCTS CATALOG LIST (Right column) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm self-start">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
            Active Catalog ({products.length})
          </h2>

          <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
            {products.map((p) => {
              const displayName = p.nameKey ? p.id : (p.name?.en || p.id);
              const totalStock = Object.values(p.stock).reduce((a, b) => a + b, 0);
              
              return (
                <div
                  key={p.id}
                  className={`flex gap-3 border rounded-xl p-3 bg-gray-50/30 transition hover:bg-white hover:shadow-sm ${
                    editId === p.id ? "ring-2 ring-blue-500 bg-blue-50/10 border-blue-200" : "border-gray-100"
                  }`}
                >
                  {/* Thumb image */}
                  <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={p.image || (p.gallery?.[0]?.src)}
                      alt={displayName}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Info details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs truncate uppercase tracking-tight">{displayName}</h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">ID: {p.id}</p>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm font-extrabold text-[#B91C1C]">₹{p.price}</span>
                      <span className="text-[10px] bg-red-50 text-[#B91C1C] px-1.5 py-0.5 rounded font-bold">
                        Stock: {totalStock}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-1 justify-center shrink-0 border-l pl-2">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      title="Edit Product"
                      className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center transition border-none cursor-pointer"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      title="Delete Product"
                      className="w-7 h-7 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center transition border-none cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
      
      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default ManageMerchandise;
