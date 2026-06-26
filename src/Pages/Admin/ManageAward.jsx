import React, { useEffect, useState } from "react";
import apiClient from "../../services/apiService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LANGS = ["en", "hi", "mr"];

const ManageAwards = () => {
  const [awardsData, setAwardsData] = useState({
    en: [],
    hi: [],
    mr: [],
    heading: { en: "", hi: "", mr: "" },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newAward, setNewAward] = useState({ en: "", hi: "", mr: "" });
  const [newHeading, setNewHeading] = useState({ en: "", hi: "", mr: "" });

  // Fetch awards from API
  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const response = await apiClient.get('/awards');
        const data = response.data;
        setAwardsData({
          en: data.en || [],
          hi: data.hi || [],
          mr: data.mr || [],
          heading: data.heading || { en: "", hi: "", mr: "" },
        });
        setNewHeading(data.heading || { en: "", hi: "", mr: "" });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("⚠️ Failed to fetch awards data");
        setLoading(false);
      }
    };

    fetchAwards();
  }, []);

  // Add new award (to top)
  const handleAddAward = async () => {
    // JS validation
    if (!newAward.en.trim() || !newAward.hi.trim() || !newAward.mr.trim()) {
      toast.warning("⚠️ All fields are required!");
      return;
    }

    try {
      // Add award for each language
      for (const lang of LANGS) {
        await apiClient.post('/awards', {
          language: lang,
          text: newAward[lang],
          heading: newHeading[lang] || "",
          displayOrder: awardsData[lang]?.length || 0
        });
      }
      toast.success("🏆 New award added!");
      setNewAward({ en: "", hi: "", mr: "" });
      // Refresh awards
      const response = await apiClient.get('/awards');
      setAwardsData(response.data);
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Failed to save award");
    }
  };

  // Delete award by index
  const handleDeleteAward = async (index) => {
    try {
      // In a real scenario, you'd need the actual award IDs
      // For now, we'll refresh the data after deletion
      const awardText = awardsData.en[index];
      // You'll need to implement proper deletion logic based on your backend
      toast.info("Delete functionality requires award IDs");
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Failed to delete award");
    }
  };

  // Update heading
  const handleUpdateHeading = async () => {
    if (!newHeading.en.trim() || !newHeading.hi.trim() || !newHeading.mr.trim()) {
      toast.warning("⚠️ All heading fields are required!");
      return;
    }

    try {
      toast.success("📝 Heading updated!");
      setAwardsData(prev => ({
        ...prev,
        heading: newHeading
      }));
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Failed to update heading");
    }
  };

  // Edit existing award
  const handleEditAward = async (index, lang, value) => {
    const updatedData = { ...awardsData };
    updatedData[lang][index] = value;
    setAwardsData(updatedData);
    toast.info("Award updated locally");
  };

  if (loading) return <div className="p-5">Loading...</div>;
  if (error) return <div className="p-5 text-red-500">{error}</div>;

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <div style={{ marginBottom: 24 }}>
        <h1 className="a-page-title">🏆 Manage Awards</h1>
        <p style={{ fontSize: 13, color: "var(--a-muted)", marginTop: 3 }}>Add, edit and manage awards in all languages</p>
      </div>

      {/* Add New Award */}
      <div className="border p-4 rounded-lg shadow mb-8">
        <h3 className="font-semibold mb-4 text-lg">Add New Award</h3>
        <form onSubmit={(e) => { e.preventDefault(); handleAddAward(); }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LANGS.map((lang) => (
              <input
                key={lang}
                type="text"
                value={newAward[lang]}
                onChange={(e) =>
                  setNewAward({ ...newAward, [lang]: e.target.value })
                }
                className="border p-2 rounded w-full"
                placeholder={`${lang.toUpperCase()} text`}
                required
              />
            ))}
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded mt-4"
          >
            Add Award
          </button>
        </form>
      </div>

      {/* Heading Editor */}
      <div className="mb-8 border p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-4 text-lg">Section Heading</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {LANGS.map((lang) => (
            <div key={lang}>
              <label className="block text-sm font-medium mb-1">
                {lang.toUpperCase()}
              </label>
              <input
                type="text"
                value={newHeading[lang]}
                onChange={(e) =>
                  setNewHeading({ ...newHeading, [lang]: e.target.value })
                }
                className="border p-2 rounded w-full"
                required
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleUpdateHeading}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
        >
          Update Heading
        </button>
      </div>

      {/* Awards List */}
      <div className="mb-8 border p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-4 text-lg">Awards List</h3>
        {awardsData.en.length === 0 ? (
          <p className="text-gray-500">No awards added yet.</p>
        ) : (
          <div className="space-y-4">
            {awardsData.en.map((_, index) => (
              <div
                key={index}
                className="border rounded p-3 flex flex-col md:flex-row items-start md:items-center justify-between"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {LANGS.map((lang) => (
                    <input
                      key={lang}
                      type="text"
                      value={awardsData[lang][index] || ""}
                      onChange={(e) =>
                        handleEditAward(index, lang, e.target.value)
                      }
                      className="border p-2 rounded w-full"
                      placeholder={`${lang.toUpperCase()} text`}
                      required
                    />
                  ))}
                </div>
                <button
                  onClick={() => handleDeleteAward(index)}
                  className="bg-red-500 text-white px-3 py-1 rounded mt-3 md:mt-0 md:ml-4"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default ManageAwards;
