import React, { useEffect, useState } from "react";
import { flashFirestoreService } from "../../services/firestoreService";
import { isFirebaseConfigured } from "../../services/firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageFlashBanner = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    imagesStr: "", // comma separated
    videoUrl: "",
    linkUrl: "",
    linkName: "",
    language: "all",
    isActive: true,
  });

  useEffect(() => {
    let unsubscribe = () => {};

    if (isFirebaseConfigured) {
      unsubscribe = flashFirestoreService.listenFlashMessages(
        (items) => {
          setMessages(items || []);
          setLoading(false);
        },
        (err) => {
          console.error("Error loading flash banners:", err);
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image: "",
      imagesStr: "",
      videoUrl: "",
      linkUrl: "",
      linkName: "",
      language: "all",
      isActive: true,
    });
    setEditingId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.warning("⚠️ Title is required!");
      return;
    }

    setSaving(true);
    try {
      // Build data payload
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        language: formData.language,
        isActive: formData.isActive,
      };

      if (formData.image.trim()) {
        payload.image = formData.image.trim();
      }

      if (formData.imagesStr.trim()) {
        payload.images = formData.imagesStr
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (formData.videoUrl.trim()) {
        let embedUrl = formData.videoUrl.trim();
        // Auto convert standard YouTube URL to embed URL if needed
        if (embedUrl.includes("watch?v=")) {
          embedUrl = embedUrl.replace("watch?v=", "embed/");
        } else if (embedUrl.includes("youtu.be/")) {
          embedUrl = embedUrl.replace("youtu.be/", "www.youtube.com/embed/");
        }
        payload.videos = [embedUrl];
      }

      if (formData.linkUrl.trim()) {
        payload.links = {
          url: formData.linkUrl.trim(),
          name: formData.linkName.trim() || "Open Link",
        };
      }

      if (isFirebaseConfigured) {
        if (editingId) {
          await flashFirestoreService.updateFlashMessage(editingId, payload);
          toast.success("✅ Flash banner updated successfully!");
        } else {
          await flashFirestoreService.addFlashMessage(payload);
          toast.success("📢 New Flash banner created successfully!");
        }
      } else {
        toast.info("Firebase is not configured. Changes saved in demo state.");
        if (editingId) {
          setMessages((prev) =>
            prev.map((m) => (m.id === editingId ? { ...m, ...payload } : m))
          );
        } else {
          setMessages((prev) => [{ id: `demo-${Date.now()}`, ...payload }, ...prev]);
        }
      }

      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Failed to save: " + (err.message || "Error"));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (msg) => {
    try {
      const newStatus = !msg.isActive;
      if (isFirebaseConfigured && !msg.id.startsWith("demo-")) {
        await flashFirestoreService.updateFlashMessage(msg.id, {
          isActive: newStatus,
        });
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, isActive: newStatus } : m))
        );
      }
      toast.success(newStatus ? "🔔 Flash banner activated" : "🔕 Flash banner deactivated");
    } catch (err) {
      toast.error("Failed to toggle status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this flash popup?")) return;
    try {
      if (isFirebaseConfigured && !id.startsWith("demo-")) {
        await flashFirestoreService.deleteFlashMessage(id);
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }
      toast.success("🗑️ Flash banner deleted!");
    } catch (err) {
      toast.error("Failed to delete banner");
    }
  };

  const startEdit = (msg) => {
    setFormData({
      title: msg.title || "",
      description: msg.description || "",
      image: msg.image || "",
      imagesStr: Array.isArray(msg.images) ? msg.images.join(", ") : "",
      videoUrl: Array.isArray(msg.videos) && msg.videos[0] ? msg.videos[0] : "",
      linkUrl: msg.links?.url || "",
      linkName: msg.links?.name || "",
      language: msg.language || "all",
      isActive: msg.isActive !== false,
    });
    setEditingId(msg.id);
  };

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <div style={{ marginBottom: 20 }}>
        <h1 className="a-page-title text-2xl font-bold text-gray-900">
          📢 Manage Flash Banners & Popups
        </h1>
        <p style={{ fontSize: 13, color: "var(--a-muted)", marginTop: 3 }}>
          Create and manage live popup notifications, announcements, YouTube videos and images in real-time (Powered by Firebase Firestore)
        </p>
      </div>

      {/* Form */}
      <div className="bg-white border rounded-xl shadow-sm p-5 mb-8">
        <h3 className="font-semibold mb-4 text-lg text-red-700">
          {editingId ? "✏️ Edit Flash Banner" : "➕ Create New Flash Announcement"}
        </h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                TITLE *
              </label>
              <input
                type="text"
                placeholder="e.g. Vaishnavas' Wari Arrives in Ganesh Galli"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                LANGUAGE FILTER
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Languages</option>
                <option value="mr">Marathi (मराठी)</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              DESCRIPTION (Multi-line text supported)
            </label>
            <textarea
              placeholder="Enter announcement description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                MAIN IMAGE URL (or /images/... path)
              </label>
              <input
                type="text"
                placeholder="e.g. /images/award1.jpeg or https://..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                YOUTUBE VIDEO EMBED / WATCH URL
              </label>
              <input
                type="text"
                placeholder="e.g. https://youtu.be/kT-oOenEmo0"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                ACTION BUTTON LINK (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. https://youtube.com/..."
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                LINK BUTTON NAME
              </label>
              <input
                type="text"
                placeholder="e.g. Watch Video / Official YouTube"
                value={formData.linkName}
                onChange={(e) => setFormData({ ...formData, linkName: e.target.value })}
                className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-red-600"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active (Visible on website popups)
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className={`${
                editingId ? "bg-blue-600 hover:bg-blue-700" : "bg-red-700 hover:bg-red-800"
              } text-white font-medium px-5 py-2.5 rounded-lg transition`}
            >
              {saving ? "Saving..." : editingId ? "Update Banner" : "+ Publish Flash Banner"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-400 hover:bg-gray-500 text-white font-medium px-4 py-2.5 rounded-lg transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Messages List */}
      <div className="bg-white border rounded-xl shadow-sm p-5">
        <h3 className="font-semibold mb-4 text-lg text-gray-900">
          Published Flash Announcements ({messages.length})
        </h3>
        {loading ? (
          <p className="text-gray-500 py-6 text-center">Loading flash banners...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500 py-6 text-center">No flash banners created yet.</p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`border rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition ${
                  msg.isActive !== false ? "bg-white" : "bg-gray-100 opacity-60"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        msg.isActive !== false
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {msg.isActive !== false ? "ACTIVE" : "INACTIVE"}
                    </span>
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      Lang: {msg.language || "all"}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-base truncate">{msg.title}</h4>
                  {msg.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{msg.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => handleToggleActive(msg)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                  >
                    {msg.isActive !== false ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => startEdit(msg)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default ManageFlashBanner;
