import React, { useState, useEffect } from "react";
import apiClient from "../../services/apiService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { User, Lock, ShieldCheck, Eye, EyeOff, Save } from "lucide-react";

// ─── Field wrapper ───────────────────────────────────────────────────────────
const Field = ({ label, children, hint }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>
      {label}
    </label>
    {children}
    {hint && <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{hint}</p>}
  </div>
);

// ─── Password input ───────────────────────────────────────────────────────────
const PasswordInput = ({ value, onChange, placeholder, id }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="a-input"
        style={{ paddingRight: 40 }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{
          position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer", color: "#94a3b8",
          display: "flex", padding: 4,
        }}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
};

// ─── Section Card ─────────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, desc, children }) => (
  <div className="a-card" style={{ overflow: "hidden" }}>
    <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--a-border)", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} color="var(--a-primary)" />
      </div>
      <div>
        <p style={{ fontWeight: 700, fontSize: 14, color: "var(--a-text)" }}>{title}</p>
        <p style={{ fontSize: 12, color: "var(--a-muted)", marginTop: 1 }}>{desc}</p>
      </div>
    </div>
    <div style={{ padding: "20px 22px" }}>
      {children}
    </div>
  </div>
);

// ─── Profile Page ─────────────────────────────────────────────────────────────
const AdminProfile = () => {
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  const [pwForm,   setPwForm]   = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);

  // ── Load profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/auth/verify");
        setProfile(res?.data || res);
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Change password ───────────────────────────────────────────────────────
  const validatePw = () => {
    const e = {};
    if (!pwForm.oldPassword)              e.oldPassword = "Current password is required";
    if (pwForm.newPassword.length < 8)    e.newPassword = "New password must be at least 8 characters";
    if (pwForm.newPassword !== pwForm.confirm) e.confirm = "Passwords do not match";
    setPwErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePw()) return;
    setPwSaving(true);
    try {
      await apiClient.post("/auth/change-password", {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success("✅ Password changed successfully!");
      setPwForm({ oldPassword: "", newPassword: "", confirm: "" });
      setPwErrors({});
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80, color: "#94a3b8", fontSize: 14 }}>
      Loading profile…
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 640 }}>

      {/* Page header */}
      <div>
        <h1 className="a-page-title">My Profile</h1>
        <p style={{ fontSize: 13, color: "var(--a-muted)", marginTop: 3 }}>Manage your account settings</p>
      </div>

      {/* Account Info */}
      <Section icon={User} title="Account Information" desc="Your admin account details">
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, padding: 16, background: "#f8fafc", borderRadius: 10 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "var(--a-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <User size={24} color="#fff" />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: "var(--a-text)" }}>
              {profile?.email?.split("@")[0] || "Admin"}
            </p>
            <p style={{ fontSize: 12, color: "var(--a-muted)", marginTop: 2 }}>{profile?.email}</p>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              marginTop: 6, padding: "2px 9px", borderRadius: 99,
              background: "#fef2f2", color: "var(--a-primary)",
              fontSize: 11, fontWeight: 600,
            }}>
              <ShieldCheck size={11} />
              {profile?.role?.toUpperCase() || "ADMIN"}
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 9, border: "1px solid var(--a-border)" }}>
            <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Email</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--a-text)", marginTop: 3, wordBreak: "break-all" }}>{profile?.email}</p>
          </div>
          <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 9, border: "1px solid var(--a-border)" }}>
            <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Role</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--a-text)", marginTop: 3 }}>{profile?.role || "admin"}</p>
          </div>
        </div>
      </Section>

      {/* Change Password */}
      <Section icon={Lock} title="Change Password" desc="Use a strong password with 8+ characters">
        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Field label="Current Password" hint={pwErrors.oldPassword && <span style={{ color: "#ef4444" }}>{pwErrors.oldPassword}</span>}>
            <PasswordInput
              id="old-password"
              value={pwForm.oldPassword}
              onChange={e => setPwForm(p => ({ ...p, oldPassword: e.target.value }))}
              placeholder="Enter current password"
            />
          </Field>

          <Field label="New Password" hint={pwErrors.newPassword && <span style={{ color: "#ef4444" }}>{pwErrors.newPassword}</span>}>
            <PasswordInput
              id="new-password"
              value={pwForm.newPassword}
              onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
              placeholder="Min. 8 characters"
            />
          </Field>

          <Field label="Confirm New Password" hint={pwErrors.confirm && <span style={{ color: "#ef4444" }}>{pwErrors.confirm}</span>}>
            <PasswordInput
              id="confirm-password"
              value={pwForm.confirm}
              onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
              placeholder="Re-enter new password"
            />
          </Field>

          <button
            type="submit"
            disabled={pwSaving}
            className="a-btn a-btn-primary"
            style={{ marginTop: 8, justifyContent: "center", padding: "10px 20px", opacity: pwSaving ? .7 : 1 }}
          >
            <Save size={14} /> {pwSaving ? "Saving…" : "Save New Password"}
          </button>
        </form>
      </Section>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AdminProfile;
