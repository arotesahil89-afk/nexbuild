import React, { useEffect, useState } from "react";
import useLiveStreamLoader from "../../loaders/useLiveStreamLoader";
import { liveStreamFirestoreService } from "../../services/firestoreService";
import { isFirebaseConfigured } from "../../services/firebase";
import apiClient from "../../services/apiService";
import { extractYouTubeVideoId, getYouTubeEmbedUrl } from "../../utils/youtubeUtils";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Video, ExternalLink, Play, Radio, CheckCircle, RefreshCw } from "lucide-react";

const ManageLiveStream = () => {
  const { streamData, setStreamData, loading } = useLiveStreamLoader();

  const [formData, setFormData] = useState({
    youtubeUrl: "",
    isLive: true,
    title: "",
    description: "",
    targetDate: "",
  });

  const [saving, setSaving] = useState(false);

  // Sync initial loaded data into form
  useEffect(() => {
    if (streamData) {
      setFormData({
        youtubeUrl: streamData.youtubeUrl || "",
        isLive: streamData.isLive !== false,
        title: streamData.title || "Mumbai Cha Raja Live",
        description: streamData.description || "",
        targetDate: streamData.targetDate || "2025-08-27T08:00:00+05:30",
      });
    }
  }, [streamData]);

  const currentVideoId = extractYouTubeVideoId(formData.youtubeUrl);
  const currentEmbedUrl = getYouTubeEmbedUrl(currentVideoId);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.youtubeUrl.trim()) {
      toast.warning("⚠️ YouTube URL or Video ID is required!");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        youtubeUrl: formData.youtubeUrl.trim(),
        videoId: currentVideoId,
        isLive: formData.isLive,
        title: formData.title.trim(),
        description: formData.description.trim(),
        targetDate: formData.targetDate,
      };

      if (isFirebaseConfigured) {
        await liveStreamFirestoreService.updateLiveStream(payload);
        toast.success("✅ Live stream updated successfully in real-time!");
      } else {
        await apiClient.put("/live-stream", payload);
        toast.success("✅ Live stream updated successfully!");
      }

      setStreamData((prev) => ({ ...prev, ...payload }));
    } catch (err) {
      console.error("Error saving live stream config:", err);
      toast.error("⚠️ Failed to update live stream: " + (err.message || "Error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 max-w-5xl mx-auto">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 className="a-page-title text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Video className="text-red-600" size={28} />
          Manage YouTube Live Stream
        </h1>
        <p style={{ fontSize: 13, color: "var(--a-muted)", marginTop: 3 }}>
          Configure YouTube Live stream URL, live status toggle, and countdown timer for <strong>mumbaicharaja.co/live</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Form */}
        <div className="lg:col-span-7 bg-white border rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4 pb-2 border-b flex items-center gap-2">
            <Radio className="text-red-600 animate-pulse" size={20} />
            Live Stream Settings
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Live Status Switch */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-red-900 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${formData.isLive ? 'bg-green-500 animate-ping' : 'bg-gray-400'}`}></span>
                  Live Stream Status: {formData.isLive ? "LIVE NOW" : "OFFLINE / COUNTDOWN"}
                </p>
                <p className="text-xs text-red-700 mt-1">
                  {formData.isLive
                    ? "Devotees visiting /live will see the live YouTube video frame."
                    : "Devotees will see an offline notice with a countdown timer."}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isLive}
                  onChange={(e) => setFormData({ ...formData, isLive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            {/* YouTube URL input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                YOUTUBE LIVE STREAM URL OR VIDEO ID *
              </label>
              <input
                type="text"
                placeholder="e.g. https://www.youtube.com/watch?v=9ThLarUCcas or 9ThLarUCcas"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500 font-mono"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports watch links, shorts, youtu.be links, live links, or 11-char Video ID.
              </p>
            </div>

            {/* Detected Video ID Display */}
            {currentVideoId && (
              <div className="bg-gray-50 border p-3 rounded-lg flex items-center justify-between text-xs text-gray-600">
                <span>
                  Detected Video ID: <strong className="font-mono text-gray-900">{currentVideoId}</strong>
                </span>
                <a
                  href={`https://www.youtube.com/watch?v=${currentVideoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  Test on YouTube <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* Page Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                LIVE STREAM TITLE
              </label>
              <input
                type="text"
                placeholder="e.g. Mumbai Cha Raja Live Stream"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Optional Description / Announcement */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                DESCRIPTION / DEVOTEE MESSAGE (Optional)
              </label>
              <textarea
                placeholder="Optional announcement or notes displayed under the live video..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500"
                rows={3}
              />
            </div>

            {/* Target Date / Time for Countdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                COUNTDOWN TARGET DATE & TIME (Used when stream is set to Offline)
              </label>
              <input
                type="text"
                placeholder="e.g. 2025-08-27T08:00:00+05:30"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500 font-mono"
              />
            </div>

            {/* Save Action */}
            <div className="pt-3 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-red-700 hover:bg-red-800 text-white font-bold px-6 py-2.5 rounded-lg transition flex items-center gap-2 shadow"
              >
                {saving ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} /> Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} /> Save & Publish Live Stream
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right column: Live Video Frame Preview */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white border rounded-xl shadow-sm p-5">
            <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center justify-between">
              <span>Live Video Frame Preview</span>
              <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded">
                /live frame
              </span>
            </h3>

            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl bg-black shadow-md">
              {currentVideoId ? (
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={currentEmbedUrl}
                  title="Live Stream Preview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <Play size={40} className="mb-2 opacity-50" />
                  <p className="text-xs">Enter a YouTube URL to preview</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t text-xs text-gray-600 space-y-1">
              <p>
                <strong>Current Status:</strong>{" "}
                <span className={formData.isLive ? "text-green-600 font-bold" : "text-amber-600 font-bold"}>
                  {formData.isLive ? "LIVE STREAM ACTIVE" : "OFFLINE / COUNTDOWN"}
                </span>
              </p>
              <p className="truncate">
                <strong>Title:</strong> {formData.title || "Mumbai Cha Raja Live"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default ManageLiveStream;
