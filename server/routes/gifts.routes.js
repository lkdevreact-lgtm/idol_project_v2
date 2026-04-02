import { Router } from "express";
import { saveGifts } from "../services/gifts.service.js";

/**
 * @param {object[]} knownGifts 
 */
export const createGiftsRouter = (knownGifts) => {
  const router = Router();

  // GET /api/gifts
  router.get("/", (_req, res) => {
    res.json(knownGifts);
  });

  // POST /api/gifts - Add new gift manually
  router.post("/", (req, res) => {
    const { giftId, giftName } = req.body;
    if (!giftId || !giftName) {
      return res.status(400).json({ error: "giftId and giftName are required" });
    }
    const alreadyExists = knownGifts.find(g => String(g.giftId) === String(giftId));
    if (alreadyExists) {
      return res.status(400).json({ error: "Gift ID already exists" });
    }
    const newGift = { giftId: Number(giftId), giftName };
    knownGifts.push(newGift);
    saveGifts(knownGifts);
    res.status(201).json(newGift);
  });

  // PATCH /api/gifts/:id - Update gift fields (name, active, etc.)
  router.patch("/:id", (req, res) => {
    const { id } = req.params;
    const patch = req.body;
    const gift = knownGifts.find(g => String(g.giftId) === String(id));
    if (gift) {
      Object.assign(gift, patch);
      saveGifts(knownGifts);
      res.json(gift);
    } else {
      res.status(404).json({ error: "Gift not found" });
    }
  });

  // DELETE /api/gifts/:id - Remove gift
  router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const index = knownGifts.findIndex(g => String(g.giftId) === String(id));
    if (index !== -1) {
      const deleted = knownGifts.splice(index, 1);
      saveGifts(knownGifts);
      res.json(deleted[0]);
    } else {
      res.status(404).json({ error: "Gift not found" });
    }
  });

  return router;
};
