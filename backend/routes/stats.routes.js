import express from "express";
import { getLeaderboard } from "../services/stats.service.js";

const router = express.Router();

/**
 * GET /api/stats/leaderboard?type=gifts|gifters&period=day|week|month|year
 */
router.get("/leaderboard", async (req, res) => {
  try {
    const data = await getLeaderboard();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
