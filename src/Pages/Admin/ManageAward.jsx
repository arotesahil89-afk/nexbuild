import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
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

  const awardsDocRef = doc(db, "translations", "awards");

  // Real-time listener
  useEffect(() => {
    const unsubscribe = onSnapshot(
      awardsDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAwardsData({
            en: data.en || [],
            hi: data.hi || [],
            mr: data.mr || [],
            heading: data.heading || { en: "", hi: "", mr: "" },
          });
          setNewHeading(data.heading || { en: "", hi: "", mr: "" });
        } else {
          console.warn("No awards document found!");
        }
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("⚠️ Failed to fetch awards data");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Save updated data to Firestore
  const saveAwards = async (updatedData, msg = "✅ Saved successfully!") => {
    try {
      await setDoc(awardsDocRef, updatedData);
      toast.success(msg);
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Failed to save awards");
      setError("Failed to save awards");
    }
  };

  // Add new award (to top)
  const handleAddAward = async () => {
    // JS validation
    if (!newAward.en.trim() || !newAward.hi.trim() || !newAward.mr.trim()) {
      toast.warning("⚠️ All fields are required!");
      return;
    }

    const updatedData = { ...awardsData };
    LANGS.forEach((lang) => {
      updatedData[lang] = [newAward[lang], ...(updatedData[lang] || [])]; // add at top
    });

    await saveAwards(updatedData, "🏆 New award added!");
    setNewAward({ en: "", hi: "", mr: "" });
  };

  // Delete award by index
  const handleDeleteAward = async (index) => {
    const updatedData = { ...awardsData };
    LANGS.forEach((lang) => {
      updatedData[lang] = (updatedData[lang] || []).filter((_, i) => i !== index);
    });
    await saveAwards(updatedData, "🗑️ Award deleted!");
  };

  // Update heading
  const handleUpdateHeading = async () => {
    if (!newHeading.en.trim() || !newHeading.hi.trim() || !newHeading.mr.trim()) {
      toast.warning("⚠️ All heading fields are required!");
      return;
    }

    const updatedData = { ...awardsData, heading: newHeading };
    await saveAwards(updatedData, "📝 Heading updated!");
  };

  // Edit existing award
  const handleEditAward = async (index, lang, value) => {
    const updatedData = { ...awardsData };
    updatedData[lang][index] = value;
    await saveAwards(updatedData, "✏️ Award updated!");
  };

  if (loading) return <div className="p-5">Loading...</div>;
  if (error) return <div className="p-5 text-red-500">{error}</div>;

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">🏆 Manage Awards</h2>

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
