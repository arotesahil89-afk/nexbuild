import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      const adminDoc = await getDoc(doc(db, "admins", user.uid));
      if (adminDoc.exists()) {
        setIsAdmin(true);
      } else {
        await signOut(auth);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!isAdmin) return <Navigate to="/admin-login" replace />;

  return children;
}
