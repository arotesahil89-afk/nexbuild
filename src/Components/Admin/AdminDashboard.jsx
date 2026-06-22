// AdminDashboard.jsx
import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import ManageAwards from "../../Pages/Admin/ManageAward";
import ManageEvents from "../../Pages/Admin/ManageEvents";
import {
  LogOut,
  Award,
  CalendarDays,
  Menu,
  X,
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("awards");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // mobile drawer

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-red-50 via-white to-yellow-50 mt-[50px]">
      {/* Sidebar for large screens */}
      <aside className="w-64 bg-white border-r shadow-sm hidden md:flex flex-col p-6">
        <h1 className="text-2xl font-bold text-red-700 mb-8">Admin Panel</h1>
        <nav className="flex-1">
          <ul className="space-y-3">
            <li
              className={`flex items-center gap-2 font-medium p-2 rounded-lg cursor-pointer ${
                activeTab === "awards"
                  ? "bg-red-100 text-red-700"
                  : "text-red-600 hover:bg-red-50"
              }`}
              onClick={() => setActiveTab("awards")}
            >
              <Award size={18} /> Manage Awards
            </li>
            <li
              className={`flex items-center gap-2 font-medium p-2 rounded-lg cursor-pointer ${
                activeTab === "events"
                  ? "bg-red-100 text-red-700"
                  : "text-red-600 hover:bg-red-50"
              }`}
              onClick={() => setActiveTab("events")}
            >
              <CalendarDays size={18} /> Manage Events
            </li>
          </ul>
        </nav>
        <button
          onClick={() => signOut(auth)}
          className="mt-auto flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Mobile sidebar */}
      <div className="md:hidden">
        {/* Top bar with menu */}
        <div className="flex items-center justify-between bg-white shadow px-4 py-3 fixed top-[50px] left-0 right-0 z-20">
          <h1 className="text-lg font-bold text-red-700">Admin Panel</h1>
          <button
            className="p-2 rounded-md bg-red-100 text-red-700"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Drawer */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-30 flex">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/40"
              onClick={() => setIsSidebarOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside className="relative w-64 bg-white shadow-lg flex flex-col p-6 z-40">
              <button
                className="absolute top-4 right-4 text-red-600"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X size={22} />
              </button>

              <h1 className="text-2xl font-bold text-red-700 mb-8">
                Admin Panel
              </h1>
              <nav className="flex-1">
                <ul className="space-y-3">
                  <li
                    className={`flex items-center gap-2 font-medium p-2 rounded-lg cursor-pointer ${
                      activeTab === "awards"
                        ? "bg-red-100 text-red-700"
                        : "text-red-600 hover:bg-red-50"
                    }`}
                    onClick={() => {
                      setActiveTab("awards");
                      setIsSidebarOpen(false);
                    }}
                  >
                    <Award size={18} /> Manage Awards
                  </li>
                  <li
                    className={`flex items-center gap-2 font-medium p-2 rounded-lg cursor-pointer ${
                      activeTab === "events"
                        ? "bg-red-100 text-red-700"
                        : "text-red-600 hover:bg-red-50"
                    }`}
                    onClick={() => {
                      setActiveTab("events");
                      setIsSidebarOpen(false);
                    }}
                  >
                    <CalendarDays size={18} /> Manage Events
                  </li>
                </ul>
              </nav>
              <button
                onClick={() => signOut(auth)}
                className="mt-auto flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition"
              >
                <LogOut size={18} /> Logout
              </button>
            </aside>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 mt-[60px] md:mt-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Welcome, <span className="text-red-600">Admin</span>
          </h2>
        </div>

        {/* Sections */}
        <div className="grid gap-6">
          {activeTab === "awards" && (
            <div className="bg-white border shadow-md rounded-2xl p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2">
                <Award size={22} className="text-yellow-500" /> Manage Awards
              </h3>
              <ManageAwards />
            </div>
          )}

          {activeTab === "events" && (
            <div className="bg-white border shadow-md rounded-2xl p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2">
                <CalendarDays size={22} className="text-blue-500" /> Manage Events
              </h3>
              <ManageEvents />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
