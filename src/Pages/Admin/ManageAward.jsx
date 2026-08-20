import React, { useEffect, useState } from "react";
import { awardsFirestoreService } from "../../services/firestoreService";
import { isFirebaseConfigured } from "../../services/firebase";
import apiClient from "../../services/apiService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LANGS = ["en", "hi", "mr"];

const ManageAwards = () => {
  const [awardsList, setAwardsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAward, setNewAward] = useState({ en: "", hi: "", mr: "" });
  const [newHeading, setNewHeading] = useState({
    en: "Awards & Honors",
    hi: "पुरस्कार और सम्मान",
    mr: "पुरस्कार आणि सन्मान",
  });
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // Load Awards
  useEffect(() => {
    let unsubscribe = () => {};

    if (isFirebaseConfigured) {
      unsubscribe = awardsFirestoreService.listenAwards(
        (items) => {
          setAwardsList(items || []);
          setLoading(false);
        },
        async () => {
          loadFromApi();
        }
      );
    } else {
      loadFromApi();
    }

    async function loadFromApi() {
      try {
        const response = await apiClient.get("/awards");
        const data = response.data;
        const flatList = [];
        if (data) {
          LANGS.forEach((lang) => {
            if (Array.isArray(data[lang])) {
              data[lang].forEach((text, idx) => {
                flatList.push({
                  id: `api-${lang}-${idx}`,
                  language: lang,
                  text,
                  heading: data.heading?.[lang] || "",
                  displayOrder: idx,
                });
              });
            }
          });
        }
        setAwardsList(flatList);
      } catch (err) {
        console.error("Failed to load awards:", err);
      } finally {
        setLoading(false);
      }
    }

    return () => unsubscribe();
  }, []);

  // Add new award
  const handleAddAward = async (e) => {
    e.preventDefault();
    if (!newAward.en.trim() && !newAward.hi.trim() && !newAward.mr.trim()) {
      toast.warning("⚠️ Enter award text in at least one language!");
      return;
    }

    try {
      if (isFirebaseConfigured) {
        for (const lang of LANGS) {
          if (newAward[lang].trim()) {
            await awardsFirestoreService.addAward({
              language: lang,
              text: newAward[lang].trim(),
              heading: newHeading[lang] || "",
              displayOrder: awardsList.length,
            });
          }
        }
      } else {
        for (const lang of LANGS) {
          if (newAward[lang].trim()) {
            await apiClient.post("/awards", {
              language: lang,
              text: newAward[lang].trim(),
              heading: newHeading[lang] || "",
              displayOrder: awardsList.length,
            });
          }
        }
      }

      toast.success("🏆 New award added successfully!");
      setNewAward({ en: "", hi: "", mr: "" });
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Failed to save award: " + (err.message || "Error"));
    }
  };

  // Delete award
  const handleDeleteAward = async (id) => {
    if (!window.confirm("Are you sure you want to delete this award?")) return;
    try {
      if (isFirebaseConfigured && !id.startsWith("api-")) {
        await awardsFirestoreService.deleteAward(id);
      } else {
        await apiClient.delete(`/awards/${id}`);
        setAwardsList((prev) => prev.filter((item) => item.id !== id));
      }
      toast.success("🗑️ Award deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Failed to delete award");
    }
  };

  // Update inline award
  const handleSaveEdit = async (award) => {
    try {
      if (isFirebaseConfigured && !award.id.startsWith("api-")) {
        await awardsFirestoreService.updateAward(award.id, {
          text: editText,
        });
      } else {
        await apiClient.put(`/awards/${award.id}`, {
          ...award,
          text: editText,
        });
        setAwardsList((prev) =>
          prev.map((item) =>
            item.id === award.id ? { ...item, text: editText } : item
          )
        );
      }
      setEditingId(null);
      setEditText("");
      toast.success("✅ Award updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Failed to update award");
    }
  };

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <div style={{ marginBottom: 24 }}>
        <h1 className="a-page-title text-2xl font-bold text-gray-900">
          🏆 Manage Awards & Honors
        </h1>
        <p style={{ fontSize: 13, color: "var(--a-muted)", marginTop: 3 }}>
          Add, edit and manage real-time awards in Marathi, English, and Hindi (Powered by Firebase Firestore)
        </p>
      </div>

      {/* Add New Award Form */}
      <div className="border bg-white p-5 rounded-xl shadow-sm mb-8">
        <h3 className="font-semibold mb-3 text-lg text-red-700">Add New Award</h3>
        <form onSubmit={handleAddAward}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                MARATHI (मराठी) *
              </label>
              <textarea
                value={newAward.mr}
                onChange={(e) => setNewAward({ ...newAward, mr: e.target.value })}
                className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="मराठीत पुरस्काराचे नाव / माहिती लिहा..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                ENGLISH *
              </label>
              <textarea
                value={newAward.en}
                onChange={(e) => setNewAward({ ...newAward, en: e.target.value })}
                className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Enter award details in English..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                HINDI (हिंदी) *
              </label>
              <textarea
                value={newAward.hi}
                onChange={(e) => setNewAward({ ...newAward, hi: e.target.value })}
                className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="हिंदी में पुरस्कार का विवरण लिखें..."
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-red-700 hover:bg-red-800 text-white font-medium px-5 py-2.5 rounded-lg transition"
          >
            + Add Award
          </button>
        </form>
      </div>

      {/* Awards List */}
      <div className="bg-white border rounded-xl shadow-sm p-5">
        <h3 className="font-semibold mb-4 text-lg text-gray-900">
          Current Awards List ({awardsList.length})
        </h3>

        {loading ? (
          <p className="text-gray-500 py-6 text-center">Loading awards...</p>
        ) : awardsList.length === 0 ? (
          <p className="text-gray-500 py-6 text-center">No awards added yet.</p>
        ) : (
          <div className="space-y-3">
            {awardsList.map((item, index) => (
              <div
                key={item.id || index}
                className="border rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded uppercase">
                      {item.language || "all"}
                    </span>
                  </div>

                  {editingId === item.id ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="border p-2 rounded-lg flex-1 text-sm"
                      />
                      <button
                        onClick={() => handleSaveEdit(item)}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-400 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-800 text-sm">{item.text}</p>
                  )}
                </div>

                {editingId !== item.id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditText(item.text);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAward(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default ManageAwards;
