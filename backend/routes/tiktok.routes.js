import { Router } from "express";
import { connectToTikTok } from "../services/tiktok.service.js";

/**
 * @param {import("socket.io").Server} io
 */
export const createTiktokRouter = (io) => {
  const router = Router();

  // POST /api/connect
  router.post("/connect", (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, error: "Username needed" });
    }
    
    // Bắt đầu kết nối, bỏ knownGifts đi nhé
    connectToTikTok(username, io, res);
  });

  return router;
};
