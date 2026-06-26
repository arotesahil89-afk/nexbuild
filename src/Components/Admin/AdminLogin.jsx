import apiClient from "../../services/apiService";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import "./admin.css";

const AdminLogin = () => {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      localStorage.setItem("authToken", response.data.token);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container admin-scope">
      {/* ── Left Side: Bappa Image with Canvas Texture & Typography (70% on desktop) ── */}
      <div className="admin-login-left">
        <div className="admin-login-left-texture" />
        
        {/* Top brand header */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/images/logo - img.png" alt="Mumbaicha Raja Logo" style={{ height: 50, width: "auto" }} />
          <div>
            <div style={{ color: "#f59e0b", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em" }}>मुंबईचा राजा</div>
            <div style={{ color: "#a8a29e", fontSize: 10, fontWeight: 500 }}>Ganesh Galli Mandal · Estd. 1928</div>
          </div>
        </div>

        {/* Center content featuring Gold Logo and Legacy text */}
        <div style={{ position: "relative", zIndex: 2, maxWidth: 550, margin: "auto 0" }}>
          <img 
            src="/images/MUMBAICHA RAJA - GOLD TEXT.png" 
            alt="Mumbaicha Raja Gold" 
            style={{ 
              width: "90%", 
              maxWidth: 380, 
              height: "auto", 
              marginBottom: 16, 
              filter: "drop-shadow(0 4px 15px rgba(0,0,0,0.65))" 
            }}
          />
          <h2 style={{ 
            color: "#ffffff", 
            fontSize: "2.4rem", 
            fontWeight: 800, 
            lineHeight: 1.25, 
            margin: "0 0 14px 0",
            textShadow: "0 3px 10px rgba(0,0,0,0.7)"
          }}>
            ९६ वर्षांचा भव्य वारसा
          </h2>
          <p style={{ 
            color: "#d6d3d1", 
            fontSize: "1.05rem", 
            lineHeight: 1.6, 
            margin: 0,
            textShadow: "0 2px 6px rgba(0,0,0,0.5)"
          }}>
            Lalbaug, Mumbai. Establishing devotion, community care, and social transformation since 1928.
          </p>
        </div>

        {/* Bottom footer credit */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <p style={{ color: "#78716c", fontSize: 11, margin: 0, fontWeight: 500 }}>
            © {new Date().getFullYear()} Ganesh Galli Mandal. Secure Administrator Panel.
          </p>
        </div>
      </div>

      {/* ── Right Side: Dark Mode Login Box (30% on desktop, 100% on mobile) ── */}
      <div className="admin-login-right">
        {/* Subtle grid background inside the login panel */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,.015) 1px, transparent 0)",
          backgroundSize: "24px 24px",
          zIndex: 0,
        }} />

        {/* Floating backing spotlight aura */}
        <div style={{
          position: "absolute",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(153, 27, 27, 0.16) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }} />

        <div style={{
          width: "100%",
          maxWidth: 350,
          position: "relative",
          zIndex: 1,
        }}>
          {/* Logo Shield */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg, var(--a-primary) 0%, #b91c1c 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 12px",
              boxShadow: "0 6px 20px rgba(153,27,27,.4)",
              border: "1px solid rgba(255,255,255,.08)",
            }}>
              <Shield size={24} color="#fff" />
            </div>
            <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: 0 }}>
              Mumbai Cha Raja
            </h1>
            <p style={{ color: "#a8a29e", fontSize: 12, marginTop: 4 }}>
              Admin Panel — Secure Login
            </p>
          </div>

          {/* Glassmorphic Login Card */}
          <div style={{
            background: "rgba(255,255,255,.03)",
            border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 20,
            padding: "28px 24px",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          }}>
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#a8a29e", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>
                  Email
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#57534e" }} />
                  <input
                    type="email"
                    placeholder="admin@mumbaicharaja.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{
                      width: "100%", padding: "11px 12px 11px 38px",
                      background: "rgba(255,255,255,.05)",
                      border: "1.5px solid rgba(255,255,255,.08)",
                      borderRadius: 10, color: "#fff", fontSize: 13.5,
                      outline: "none", boxSizing: "border-box",
                      transition: "border-color .2s",
                    }}
                    onFocus={e => e.target.style.borderColor = "var(--a-primary)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.08)"}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#a8a29e", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#57534e" }} />
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{
                      width: "100%", padding: "11px 40px 11px 38px",
                      background: "rgba(255,255,255,.05)",
                      border: "1.5px solid rgba(255,255,255,.08)",
                      borderRadius: 10, color: "#fff", fontSize: 13.5,
                      outline: "none", boxSizing: "border-box",
                      transition: "border-color .2s",
                    }}
                    onFocus={e => e.target.style.borderColor = "var(--a-primary)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.08)"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => !s)}
                    style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", color: "#57534e", padding: 0,
                    }}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.2)",
                  borderRadius: 8, padding: "10px 14px",
                  color: "#fca5a5", fontSize: 13,
                }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "12px 20px",
                  background: loading ? "#6b1a1a" : "var(--a-primary)",
                  border: "none", borderRadius: 10, color: "#fff",
                  fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background .2s, transform .2s",
                  boxShadow: "0 6px 20px rgba(153,27,27,.35)",
                  marginTop: 4,
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <LogIn size={16} />
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
