import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/admin"; // login ke baad dashboard
    } catch (err) {
      setError("Login failed: " + err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 mt-20 border-t-4 border-red-600">
        <h2 className="text-2xl font-bold mb-6 text-center text-red-700">
          Admin Login
        </h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Login
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      </div>
    </div>
  );
}
