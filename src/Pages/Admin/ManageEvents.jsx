import React, { useState } from "react";
import useEventsLoader from "../../loaders/useEventsLoader";
import { eventsFirestoreService } from "../../services/firestoreService";
import { isFirebaseConfigured } from "../../services/firebase";
import apiClient from "../../services/apiService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageEvents = () => {
  const { events, setEvents, loading } = useEventsLoader();
  const [newEvent, setNewEvent] = useState({
    title: { en: "", hi: "", mr: "" },
    description: { en: "", hi: "", mr: "" },
    date: "",
    time: "",
  });
  const [editingEventId, setEditingEventId] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (lang, field, value) => {
    setNewEvent((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));
  };

  // Convert "HH:mm" -> "hh:mm AM/PM"
  const formatToAmPm = (time24) => {
    if (!time24) return "";
    if (time24.includes("AM") || time24.includes("PM")) return time24;
    const parts = time24.split(":");
    if (parts.length < 2) return time24;
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  const addOrUpdateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.date) {
      toast.warning("⚠️ Event Date is required!");
      return;
    }
    if (!newEvent.title.mr && !newEvent.title.en && !newEvent.title.hi) {
      toast.warning("⚠️ Event Title is required!");
      return;
    }

    setSaving(true);
    try {
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        time: formatToAmPm(newEvent.time),
      };

      if (editingEventId) {
        // Update Event
        if (isFirebaseConfigured && !editingEventId.startsWith("api-")) {
          await eventsFirestoreService.updateEvent(editingEventId, eventData);
        } else {
          await apiClient.put(`/events/${editingEventId}`, eventData);
          setEvents((prev) =>
            prev.map((ev) => (ev.id === editingEventId ? { ...ev, ...eventData } : ev))
          );
        }
        toast.success("✅ Event updated successfully!");
      } else {
        // Add Event
        if (isFirebaseConfigured) {
          await eventsFirestoreService.addEvent(eventData);
        } else {
          const res = await apiClient.post("/events", eventData);
          setEvents((prev) => [...prev, res.data || eventData]);
        }
        toast.success("📅 New Event added successfully!");
      }

      // Reset form
      setNewEvent({
        title: { en: "", hi: "", mr: "" },
        description: { en: "", hi: "", mr: "" },
        date: "",
        time: "",
      });
      setEditingEventId(null);
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("⚠️ Failed to save event: " + (error.message || "Error"));
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      if (isFirebaseConfigured && !eventId.startsWith("api-")) {
        await eventsFirestoreService.deleteEvent(eventId);
      } else {
        await apiClient.delete(`/events/${eventId}`);
        setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
      }
      toast.success("🗑️ Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("⚠️ Failed to delete event");
    }
  };

  const startEdit = (event) => {
    setNewEvent({
      title: {
        en: event.title?.en || (typeof event.title === "string" ? event.title : ""),
        hi: event.title?.hi || "",
        mr: event.title?.mr || "",
      },
      description: {
        en: event.description?.en || (typeof event.description === "string" ? event.description : ""),
        hi: event.description?.hi || "",
        mr: event.description?.mr || "",
      },
      date: event.date || "",
      time: event.time || "",
    });
    setEditingEventId(event.id);
  };

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <div style={{ marginBottom: 20 }}>
        <h1 className="a-page-title text-2xl font-bold text-gray-900">
          📅 Manage Events Schedule
        </h1>
        <p style={{ fontSize: 13, color: "var(--a-muted)", marginTop: 3 }}>
          Schedule and manage upcoming events in real-time (Powered by Firebase Firestore)
        </p>
      </div>

      {/* Add / Edit Event Form */}
      <div className="bg-white border rounded-xl shadow-sm p-5 mb-8">
        <h3 className="font-semibold mb-4 text-lg text-red-700">
          {editingEventId ? "✏️ Edit Event" : "➕ Schedule New Event"}
        </h3>
        <form onSubmit={addOrUpdateEvent}>
          {/* Titles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                TITLE (MARATHI) *
              </label>
              <input
                type="text"
                placeholder="कार्यक्रमाचे नाव (मराठी)"
                value={newEvent.title.mr}
                onChange={(e) => handleChange("mr", "title", e.target.value)}
                className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                TITLE (ENGLISH) *
              </label>
              <input
                type="text"
                placeholder="Event Title (English)"
                value={newEvent.title.en}
                onChange={(e) => handleChange("en", "title", e.target.value)}
                className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                TITLE (HINDI) *
              </label>
              <input
                type="text"
                placeholder="कार्यक्रम का नाम (हिंदी)"
                value={newEvent.title.hi}
                onChange={(e) => handleChange("hi", "title", e.target.value)}
                className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                DESCRIPTION (MARATHI)
              </label>
              <textarea
                placeholder="तपशील (मराठी)"
                value={newEvent.description.mr}
                onChange={(e) => handleChange("mr", "description", e.target.value)}
                className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                DESCRIPTION (ENGLISH)
              </label>
              <textarea
                placeholder="Details (English)"
                value={newEvent.description.en}
                onChange={(e) => handleChange("en", "description", e.target.value)}
                className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                DESCRIPTION (HINDI)
              </label>
              <textarea
                placeholder="विवरण (हिंदी)"
                value={newEvent.description.hi}
                onChange={(e) => handleChange("hi", "description", e.target.value)}
                className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500"
                rows={2}
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                DATE *
              </label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, date: e.target.value }))}
                className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                TIME (e.g. 06:00 PM)
              </label>
              <input
                type="text"
                placeholder="e.g. 06:00 PM or 18:00"
                value={newEvent.time}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, time: e.target.value }))}
                className="border p-2.5 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className={`${
                editingEventId ? "bg-blue-600 hover:bg-blue-700" : "bg-red-700 hover:bg-red-800"
              } text-white font-medium px-5 py-2.5 rounded-lg transition`}
            >
              {saving
                ? "Saving..."
                : editingEventId
                ? "Update Event"
                : "+ Add Event"}
            </button>

            {editingEventId && (
              <button
                type="button"
                onClick={() => {
                  setEditingEventId(null);
                  setNewEvent({
                    title: { en: "", hi: "", mr: "" },
                    description: { en: "", hi: "", mr: "" },
                    date: "",
                    time: "",
                  });
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white font-medium px-4 py-2.5 rounded-lg transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Existing Events List */}
      <div className="bg-white border rounded-xl shadow-sm p-5">
        <h3 className="font-semibold mb-4 text-lg text-gray-900">
          Scheduled Events ({events.length})
        </h3>
        {loading ? (
          <p className="text-gray-500 py-6 text-center">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-500 py-6 text-center">No events found.</p>
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => {
              const displayTitle =
                typeof event.title === "object"
                  ? event.title.mr || event.title.en || event.title.hi
                  : event.title;

              return (
                <div
                  key={event.id || index}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 border p-4 rounded-lg gap-3 hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="font-bold text-gray-900 text-base">{displayTitle}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      📅 {event.date} {event.time && `| ⏰ ${event.time}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => startEdit(event)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id || index)}
                      className="text-red-600 hover:text-red-800 text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default ManageEvents;
