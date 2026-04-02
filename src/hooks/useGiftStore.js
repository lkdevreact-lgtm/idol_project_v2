import { create } from "zustand";

export const useGiftStore = create((set, get) => ({
  gifts: [],
  loading: false,

  fetchGifts: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/gifts");
      const data = await res.json();
      if (Array.isArray(data)) {
        set({ gifts: data });
      }
    } catch (err) {
      console.error("Failed to fetch gifts:", err);
    } finally {
      set({ loading: false });
    }
  },

  addGift: async (giftData) => {
    try {
      const res = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(giftData),
      });
      if (res.ok) {
        const newGift = await res.json();
        set((state) => ({ gifts: [...state.gifts, newGift] }));
        return { success: true };
      } else {
        const error = await res.json();
        return { success: false, error: error.error || "Failed to add gift" };
      }
    } catch (err) {
      console.error("Error adding gift:", err);
      return { success: false, error: "Network error" };
    }
  },

  updateGift: async (id, payload) => {
    try {
      const res = await fetch(`/api/gifts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        set((state) => ({
          gifts: state.gifts.map((g) =>
            String(g.giftId) === String(id) ? { ...g, ...payload } : g
          ),
        }));
        return { success: true };
      }
    } catch (err) {
      console.error("Error updating gift:", err);
    }
    return { success: false };
  },

  toggleActive: async (id) => {
    const gift = get().gifts.find((g) => String(g.giftId) === String(id));
    if (!gift) return { success: false };
    return get().updateGift(id, { active: !gift.active });
  },

  deleteGift: async (id) => {
    try {
      const res = await fetch(`/api/gifts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        set((state) => ({
          gifts: state.gifts.filter((g) => String(g.giftId) !== String(id)),
        }));
        return { success: true };
      }
    } catch (err) {
      console.error("Error deleting gift:", err);
    }
    return { success: false };
  },
}));
