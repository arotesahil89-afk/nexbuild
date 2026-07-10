import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Edit2, Trash2, Shield, AlertTriangle, Search, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../services/apiService";

const DEFAULT_FORM = {
  id: "",
  name: "",
  email: "",
  password: "",
  role: "admin",
  active: true,
};

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [form, setForm] = useState(DEFAULT_FORM);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admins");
      if (res.success) {
        setAdmins(res.admins);
      }
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setForm(DEFAULT_FORM);
  };

  const startEdit = (admin) => {
    setForm({
      id: admin.id,
      name: admin.name || "",
      email: admin.email,
      password: "", // empty for edit
      role: admin.role || "admin",
      active: admin.active,
    });
    setView("edit");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.warning("Name and Email are required");
      return;
    }
    if (view === "create" && !form.password) {
      toast.warning("Password is required for new users");
      return;
    }

    try {
      if (view === "edit") {
        const payload = { ...form };
        if (!payload.password) delete payload.password; // Don't update if empty
        const res = await apiClient.put(`/admins/${form.id}`, payload);
        if (res.success) {
          toast.success("User updated successfully");
          fetchAdmins();
          setView("list");
        }
      } else {
        const res = await apiClient.post("/admins", form);
        if (res.success) {
          toast.success("User created successfully");
          fetchAdmins();
          setView("list");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const deleteAdmin = async (id) => {
    try {
      const res = await apiClient.delete(`/admins/${id}`);
      if (res.success) {
        toast.success("User deleted successfully");
        setDeleteConfirmId(null);
        fetchAdmins();
      }
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full relative">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Shield className="text-[#B91C1C]" /> User Master
        </h1>
        <p className="text-xs text-gray-500 mt-1">Manage system administrators and their access.</p>
      </div>

      {view === "list" ? (
        <div className="w-full bg-white overflow-hidden shadow-sm border border-gray-150 rounded-2xl">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C] outline-none transition"
              />
            </div>
            <button
              onClick={() => {
                handleResetForm();
                setView("create");
              }}
              className="w-full sm:w-auto bg-[#B91C1C] hover:bg-red-800 text-white font-bold py-2 px-4 rounded-xl transition text-sm flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus size={16} /> Create User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-xs font-bold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8">Loading users...</td>
                  </tr>
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-400">No users found.</td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50/40">
                      <td className="px-6 py-4 font-bold text-gray-900">{admin.name}</td>
                      <td className="px-6 py-4 text-gray-500">{admin.email}</td>
                      <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">{admin.role}</span></td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${admin.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {admin.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => startEdit(admin)} className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setDeleteConfirmId(admin.id)} className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-150 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <button onClick={() => setView("list")} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{view === "edit" ? "Edit User" : "Create New User"}</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-xl p-2.5 text-sm focus:border-[#B91C1C] outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-xl p-2.5 text-sm focus:border-[#B91C1C] outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password {view === "edit" && "(Leave blank to keep current)"}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border rounded-xl p-2.5 text-sm focus:border-[#B91C1C] outline-none" required={view === "create"} />
            </div>
            
            <div className="flex gap-2 pt-4">
              <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl">
                {view === "edit" ? "Update User" : "Save User"}
              </button>
              <button type="button" onClick={() => setView("list")} className="bg-gray-150 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-xl">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete User?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this user? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl">Cancel</button>
              <button onClick={() => deleteAdmin(deleteConfirmId)} className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default ManageAdmins;
