import { create } from "zustand";
import { persist } from "zustand/middleware";
import { arrModels } from "../utils/data";

// Seed initial data from arrModels
const seedVideos = arrModels.map((m, idx) => ({
  id: m.id,
  name: m.name,
  description: m.description,
  avatar: m.image,
  video: m.video,
  gift: "Rose",         // gift name that triggers this video
  order: idx + 1,       // display order
  active: true,         // active/inactive
}));

export const useVideoStore = create(
  persist(
    (set, get) => ({
      // ---------- video list ----------
      videos: seedVideos,

      addVideo: (videoData) =>
        set((state) => {
          const maxOrder = state.videos.reduce((m, v) => Math.max(m, v.order), 0);
          return {
            videos: [
              ...state.videos,
              {
                ...videoData,
                id: Date.now(),
                order: maxOrder + 1,
                active: true,
              },
            ],
          };
        }),

      updateVideo: (id, patch) =>
        set((state) => ({
          videos: state.videos.map((v) => (v.id === id ? { ...v, ...patch } : v)),
        })),

      deleteVideo: (id) =>
        set((state) => {
          const target = state.videos.find((v) => v.id === id);

          // Only delete files that were actually uploaded (have timestamp prefix pattern)
          // Seed data files like /video/binhan-1.mp4 are left intact
          const isUploaded = (p) =>
            typeof p === "string" &&
            (p.startsWith("/video/") || p.startsWith("/avatar/")) &&
            /\/\d{10,}-/.test(p); // timestamp prefix e.g. /video/1712345678901-name.mp4

          if (target) {
            if (isUploaded(target.video)) {
              fetch(`/api/files?path=${encodeURIComponent(target.video)}`, {
                method: "DELETE",
              }).catch((e) => console.warn("Could not delete video file:", e));
            }
            if (isUploaded(target.avatar)) {
              fetch(`/api/files?path=${encodeURIComponent(target.avatar)}`, {
                method: "DELETE",
              }).catch((e) => console.warn("Could not delete avatar file:", e));
            }
          }

          return {
            videos: state.videos.filter((v) => v.id !== id),
            selectedVideo:
              state.selectedVideo === target?.video
                ? null
                : state.selectedVideo,
          };
        }),

      toggleActive: (id) =>
        set((state) => ({
          videos: state.videos.map((v) =>
            v.id === id ? { ...v, active: !v.active } : v
          ),
        })),

      reorderVideo: (id, newOrder) =>
        set((state) => ({
          videos: state.videos.map((v) =>
            v.id === id ? { ...v, order: newOrder } : v
          ),
        })),

      // ---------- active videos (sorted) ----------
      getActiveVideos: () => {
        const { videos } = get();
        return [...videos]
          .filter((v) => v.active)
          .sort((a, b) => a.order - b.order);
      },

      // ---------- currently selected video ----------
      selectedVideo: null,
      setSelectedVideo: (path) => set({ selectedVideo: path }),
      setSelected: (video, sound) => set({ selectedVideo: video, selectedSound: sound }),
      selectedSound: null,
    }),
    {
      name: "idol-video-store",
    }
  )
);
