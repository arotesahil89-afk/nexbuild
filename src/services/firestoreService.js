import { db, isFirebaseConfigured } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
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
// 📢 3. FLASH BANNER FIRESTORE SERVICE (Supports Subcollections for Images)
// ─────────────────────────────────────────────────────────────────────────────
export const flashFirestoreService = {
  // Fetch images from subcollection for a specific banner
  getBannerImages: async (bannerId) => {
    if (!isFirebaseConfigured || !db || !bannerId) return [];
    try {
      const q = query(
        collection(db, "flash_banners", bannerId, "images"),
        orderBy("index", "asc")
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data().url).filter(Boolean);
    } catch (err) {
      console.warn(`[Firestore] getBannerImages error for ${bannerId}:`, err);
      return [];
    }
  },

  // Save multiple images into the subcollection (each image gets its own 1MB document)
  saveBannerImages: async (bannerId, imagesList = []) => {
    if (!isFirebaseConfigured || !db || !bannerId) return [];
    const firestore = ensureDb();
    try {
      // 1. Delete any existing subcollection docs for clean state
      const existingSnap = await getDocs(
        collection(firestore, "flash_banners", bannerId, "images")
      );
      const deletePromises = existingSnap.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletePromises);

      // 2. Write each image as an individual document (separate 1 MB limit each!)
      const addPromises = imagesList.map((imgUrl, idx) => {
        const imgDocRef = doc(firestore, "flash_banners", bannerId, "images", `img_${idx}`);
        return setDoc(imgDocRef, {
          url: imgUrl,
          index: idx,
          createdAt: serverTimestamp(),
        });
      });
      await Promise.all(addPromises);
      return imagesList;
    } catch (err) {
      console.error(`[Firestore] saveBannerImages error for ${bannerId}:`, err);
      throw err;
    }
  },

  // Real-time listener: immediately returns banners, then asynchronously enriches subcollection images
  listenFlashMessages: (callback, onError) => {
    if (!isFirebaseConfigured || !db) {
      if (onError) onError(new Error("Firebase not configured"));
      return () => {};
    }
    try {
      const q = query(collection(db, "flash_banners"), orderBy("createdAt", "desc"));
      return onSnapshot(
        q,
        async (snapshot) => {
          const items = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          // Immediately emit current data
          callback(items);

          // Asynchronously enrich banners having subcollection images
          const bannersWithSubcollection = items.filter((item) => (item.imageCount || 0) > 0);
          if (bannersWithSubcollection.length > 0) {
            try {
              const enrichedItems = await Promise.all(
                items.map(async (item) => {
                  if ((item.imageCount || 0) > 0) {
                    try {
                      const subImgs = await flashFirestoreService.getBannerImages(item.id);
                      if (subImgs && subImgs.length > 0) {
                        return {
                          ...item,
                          images: Array.from(new Set([...(item.images || []), ...subImgs])),
                        };
                      }
                    } catch (e) {
                      console.warn("Could not load subcollection for banner", item.id, e);
                    }
                  }
                  return item;
                })
              );
              callback(enrichedItems);
            } catch (enrichErr) {
              console.warn("Error enriching flash banners with subcollections:", enrichErr);
            }
          }
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
    const items = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    // Enrich with subcollection images
    const enriched = await Promise.all(
      items.map(async (item) => {
        if ((item.imageCount || 0) > 0) {
          try {
            const subImgs = await flashFirestoreService.getBannerImages(item.id);
            if (subImgs.length > 0) {
              return {
                ...item,
                images: Array.from(new Set([...(item.images || []), ...subImgs])),
              };
            }
          } catch (e) {
            console.warn("Error getting subcollection images:", e);
          }
        }
        return item;
      })
    );
    return enriched;
  },

  // Add flash message with subcollection support
  addFlashMessage: async (flashData, multiImages = []) => {
    const firestore = ensureDb();
    const docRef = await addDoc(collection(firestore, "flash_banners"), {
      ...flashData,
      imageCount: Array.isArray(multiImages) ? multiImages.length : 0,
      isActive: flashData.isActive !== false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (Array.isArray(multiImages) && multiImages.length > 0) {
      await flashFirestoreService.saveBannerImages(docRef.id, multiImages);
    }

    return { id: docRef.id, ...flashData, images: multiImages };
  },

  // Update flash message with subcollection support
  updateFlashMessage: async (id, flashData, multiImages = null) => {
    const firestore = ensureDb();
    const docRef = doc(firestore, "flash_banners", id);
    const updatePayload = {
      ...flashData,
      updatedAt: serverTimestamp(),
    };
    if (multiImages !== null && Array.isArray(multiImages)) {
      updatePayload.imageCount = multiImages.length;
    }

    await updateDoc(docRef, updatePayload);

    if (multiImages !== null && Array.isArray(multiImages)) {
      await flashFirestoreService.saveBannerImages(id, multiImages);
    }

    return { id, ...flashData, ...(multiImages ? { images: multiImages } : {}) };
  },

  // Delete flash message and its subcollection
  deleteFlashMessage: async (id) => {
    const firestore = ensureDb();
    // 1. Delete all images in subcollection first
    try {
      const existingSnap = await getDocs(
        collection(firestore, "flash_banners", id, "images")
      );
      const deletePromises = existingSnap.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    } catch (e) {
      console.warn("[Firestore] Error deleting subcollection images for banner:", id, e);
    }
    // 2. Delete main banner document
    await deleteDoc(doc(firestore, "flash_banners", id));
    return { id, success: true };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 🔴 4. LIVE STREAM FIRESTORE SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const liveStreamFirestoreService = {
  // Real-time listener for live stream settings
  listenLiveStream: (callback, onError) => {
    if (!isFirebaseConfigured || !db) {
      if (onError) onError(new Error("Firebase not configured"));
      return () => {};
    }
    try {
      const docRef = doc(db, "settings", "live_stream");
      return onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            callback({ id: docSnap.id, ...docSnap.data() });
          } else {
            callback(null);
          }
        },
        (error) => {
          console.warn("[Firestore] listenLiveStream error:", error);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      if (onError) onError(err);
      return () => {};
    }
  },

  // Fetch once
  getLiveStream: async () => {
    const firestore = ensureDb();
    const docRef = doc(firestore, "settings", "live_stream");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  },

  // Update live stream settings
  updateLiveStream: async (liveData) => {
    const firestore = ensureDb();
    const docRef = doc(firestore, "settings", "live_stream");
    const payload = {
      ...liveData,
      updatedAt: serverTimestamp(),
    };
    await setDoc(docRef, payload, { merge: true });
    return payload;
  },
};

