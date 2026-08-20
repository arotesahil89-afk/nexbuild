import { db, isFirebaseConfigured } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// Helper to check firestore availability
const ensureDb = () => {
  if (!isFirebaseConfigured || !db) {
    throw new Error(
      "Firebase is not configured yet. Please add your Firebase configuration in .env"
    );
  }
  return db;
};

// ─────────────────────────────────────────────────────────────────────────────
// 🏆 1. AWARDS FIRESTORE SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const awardsFirestoreService = {
  // Real-time listener
  listenAwards: (callback, onError) => {
    if (!isFirebaseConfigured || !db) {
      if (onError) onError(new Error("Firebase not configured"));
      return () => {};
    }
    try {
      const q = query(collection(db, "awards"), orderBy("displayOrder", "asc"));
      return onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          callback(items);
        },
        (error) => {
          console.warn("[Firestore] listenAwards error:", error);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      if (onError) onError(err);
      return () => {};
    }
  },

  // Fetch once
  getAwards: async () => {
    const firestore = ensureDb();
    const q = query(collection(firestore, "awards"), orderBy("displayOrder", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  },

  // Add award
  addAward: async (awardData) => {
    const firestore = ensureDb();
    const docRef = await addDoc(collection(firestore, "awards"), {
      ...awardData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...awardData };
  },

  // Update award
  updateAward: async (id, awardData) => {
    const firestore = ensureDb();
    const docRef = doc(firestore, "awards", id);
    await updateDoc(docRef, {
      ...awardData,
      updatedAt: serverTimestamp(),
    });
    return { id, ...awardData };
  },

  // Delete award
  deleteAward: async (id) => {
    const firestore = ensureDb();
    await deleteDoc(doc(firestore, "awards", id));
    return { id, success: true };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 📅 2. EVENTS FIRESTORE SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const eventsFirestoreService = {
  // Real-time listener
  listenEvents: (callback, onError) => {
    if (!isFirebaseConfigured || !db) {
      if (onError) onError(new Error("Firebase not configured"));
      return () => {};
    }
    try {
      const q = query(collection(db, "events"), orderBy("date", "asc"));
      return onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          callback(items);
        },
        (error) => {
          console.warn("[Firestore] listenEvents error:", error);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      if (onError) onError(err);
      return () => {};
    }
  },

  // Fetch once
  getEvents: async () => {
    const firestore = ensureDb();
    const q = query(collection(firestore, "events"), orderBy("date", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  },

  // Add event
  addEvent: async (eventData) => {
    const firestore = ensureDb();
    const docRef = await addDoc(collection(firestore, "events"), {
      ...eventData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...eventData };
  },

  // Update event
  updateEvent: async (id, eventData) => {
    const firestore = ensureDb();
    const docRef = doc(firestore, "events", id);
    await updateDoc(docRef, {
      ...eventData,
      updatedAt: serverTimestamp(),
    });
    return { id, ...eventData };
  },

  // Delete event
  deleteEvent: async (id) => {
    const firestore = ensureDb();
    await deleteDoc(doc(firestore, "events", id));
    return { id, success: true };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 📢 3. FLASH BANNER FIRESTORE SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const flashFirestoreService = {
  // Real-time listener
  listenFlashMessages: (callback, onError) => {
    if (!isFirebaseConfigured || !db) {
      if (onError) onError(new Error("Firebase not configured"));
      return () => {};
    }
    try {
      const q = query(collection(db, "flash_banners"), orderBy("createdAt", "desc"));
      return onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          callback(items);
        },
        (error) => {
          console.warn("[Firestore] listenFlashMessages error:", error);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      if (onError) onError(err);
      return () => {};
    }
  },

  // Fetch once
  getFlashMessages: async () => {
    const firestore = ensureDb();
    const q = query(collection(firestore, "flash_banners"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  },

  // Add flash message
  addFlashMessage: async (flashData) => {
    const firestore = ensureDb();
    const docRef = await addDoc(collection(firestore, "flash_banners"), {
      ...flashData,
      isActive: flashData.isActive !== false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...flashData };
  },

  // Update flash message
  updateFlashMessage: async (id, flashData) => {
    const firestore = ensureDb();
    const docRef = doc(firestore, "flash_banners", id);
    await updateDoc(docRef, {
      ...flashData,
      updatedAt: serverTimestamp(),
    });
    return { id, ...flashData };
  },

  // Delete flash message
  deleteFlashMessage: async (id) => {
    const firestore = ensureDb();
    await deleteDoc(doc(firestore, "flash_banners", id));
    return { id, success: true };
  },
};
