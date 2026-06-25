import React, { useState } from "react";
import apiClient from "../../services/apiService";
import useEventsLoader from "../../loaders/useEventsLoader";

const ManageEvents = () => {
  const { events, setEvents, loading } = useEventsLoader();
  const [newEvent, setNewEvent] = useState({
    title: { en: "", hi: "", mr: "" },
    description: { en: "", hi: "", mr: "" },
    date: "",
    time: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (lang, field, value) => {
    setNewEvent((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));
  };

  // Convert "HH:mm" -> "hh:mm AM/PM"
  const formatToAmPm = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

  const addOrUpdateEvent = async () => {
    // Validation
    if (!newEvent.date) {
      setError("⚠️ Date is required!");
      return;
    }
    if (!newEvent.time) {
      setError("⚠️ Time is required!");
      return;
    }
    if (!newEvent.title.en || !newEvent.title.hi || !newEvent.title.mr) {
      setError("⚠️ Title in all languages is required!");
      return;
    }

    setError(""); // reset error

    try {
      let updatedEvents = [...events];
      const eventData = { ...newEvent, time: formatToAmPm(newEvent.time) };

      if (editIndex !== null) {
        // Update event
        updatedEvents[editIndex] = eventData;
        await apiClient.put(`/events/${editIndex}`, eventData);
      } else {
        // Add new event
        updatedEvents.push(eventData);
        await apiClient.post('/events', eventData);
      }
      
      setEvents(updatedEvents);

      // Reset form
      setNewEvent({
        title: { en: "", hi: "", mr: "" },
        description: { en: "", hi: "", mr: "" },
        date: "",
        time: "",
      });
      setEditIndex(null);
    } catch (error) {
      console.error("Error saving event:", error);
      setError("⚠️ Failed to save event");
    }
  };

  const deleteEvent = async (eventId) => {
  try {
    await apiClient.delete(`/events/${eventId}`);

    setEvents(events.filter(event => event.id !== eventId));
  } catch (error) {
    console.error("Error deleting event:", error);
    setError("⚠️ Failed to delete event");
  }
};

  const startEdit = (index) => {
    const event = events[index];
    setNewEvent({
      ...event,
      time: event.time.includes("AM") || event.time.includes("PM")
        ? "" // input type="time" can't take AM/PM directly
        : event.time,
    });
    setEditIndex(index);
    setError("");
  };

  if (loading) return <p>Loading events...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Manage Events</h2>

      {/* Error Message */}
      {error && <p className="text-red-600 mb-2">{error}</p>}

      {/* Add/Edit Event Form */}
      <div className="space-y-2 mb-6">
        {["en", "hi", "mr"].map((lang) => (
          <input
            key={lang}
            type="text"
            placeholder={`Title (${lang}) *`}
            value={newEvent.title[lang]}
            onChange={(e) => handleChange(lang, "title", e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        ))}

        {["en", "hi", "mr"].map((lang) => (
          <input
            key={lang}
            type="text"
            placeholder={`Description (${lang})`}
            value={newEvent.description[lang]}
            onChange={(e) => handleChange(lang, "description", e.target.value)}
            className="border p-2 rounded w-full"
          />
        ))}

        <input
          type="date"
          value={newEvent.date}
          onChange={(e) =>
            setNewEvent((prev) => ({ ...prev, date: e.target.value }))
          }
          className="border p-2 rounded w-full"
          required
        />

        <input
          type="time"
          value={newEvent.time}
          onChange={(e) =>
            setNewEvent((prev) => ({ ...prev, time: e.target.value }))
          }
          className="border p-2 rounded w-full"
          required
        />

        <button
          onClick={addOrUpdateEvent}
          className={`${
            editIndex !== null
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-green-600 hover:bg-green-700"
          } text-white px-4 py-2 rounded`}
        >
          {editIndex !== null ? "Update Event" : "Add Event"}
        </button>

        {editIndex !== null && (
          <button
            onClick={() => {
              setEditIndex(null);
              setNewEvent({
                title: { en: "", hi: "", mr: "" },
                description: { en: "", hi: "", mr: "" },
                date: "",
                time: "",
              });
              setError("");
            }}
            className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Existing Events List */}
      <div>
        <h3 className="font-semibold mb-2">Existing Events</h3>
        {events.length > 0 ? (
          events.map((event, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-100 p-3 rounded mb-2"
            >
              <div>
                <p className="font-medium">{event.title.en}</p>
                <p className="text-sm text-gray-600">
                  {event.date} – {event.time}
                </p>
              </div>
              <div className="space-x-3">
                <button
                  onClick={() => startEdit(index)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No events found</p>
        )}
      </div>
    </div>
  );
};

export default ManageEvents;
