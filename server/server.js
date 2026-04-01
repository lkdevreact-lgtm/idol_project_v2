import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { WebcastPushConnection } from "tiktok-live-connector";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root of project (one level up from server/)
const PROJECT_ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");
const VIDEO_DIR = path.join(PUBLIC_DIR, "video");
const AVATAR_DIR = path.join(PUBLIC_DIR, "avatar");

// Ensure directories exist
[VIDEO_DIR, AVATAR_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const app = express();
app.use(cors());

// Serve public/ as static files
app.use(express.static(PUBLIC_DIR));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());

let tiktokLiveConnection = null;

const connectToTikTok = (username, res) => {
  if (tiktokLiveConnection) {
    try {
      tiktokLiveConnection.disconnect();
    } catch (e) {
      console.log(e);
    }
  }

  console.log(`Attempting to connect to @${username}...`);
  tiktokLiveConnection = new WebcastPushConnection(username);

  tiktokLiveConnection
    .connect()
    .then((state) => {
      console.info(`Connected to roomId ${state.roomId}`);
      io.emit("tiktok_connected", username);
      if (res) res.json({ success: true, message: `Connected to ${username}` });
    })
    .catch((err) => {
      console.error("Failed to connect", err);
      if (res)
        res.status(500).json({ success: false, message: "Failed to connect" });
    });

  tiktokLiveConnection.on("gift", (data) => {
    if (data.giftType === 1 && !data.repeatEnd) {
      return;
    }

    console.log(
      `${data.uniqueId} sent ${data.giftName} (qty: ${data.repeatCount})!`,
    );

    // console.log("FULL DATA:", data);

    if (
      data.giftName.toLowerCase().includes("rose") ||
      data.giftName.toLowerCase().includes("hoa hồng") ||
      data.giftId === 5655
    ) {
      console.log("Rose received! Emitting to socket...");
      io.emit("tiktok_gift", {
        user: data.uniqueId,
        giftName: data.giftName,
        giftId: data.giftId,
        nickname: data.nickname,
        profilePicture: data.profilePictureUrl,
        amount: data.repeatCount || 1,
        type: "rose",
      });
    } else {
      io.emit("tiktok_gift_other", {
        user: data.uniqueId,
        giftName: data.giftName,
        nickname: data.nickname,
        amount: data.repeatCount || 1,
        profilePicture: data.profilePictureUrl,
      });
    }
  });

  tiktokLiveConnection.on("chat", (data) => {
    // console.log("FULL Chat:", data);
    io.emit("tiktok_chat", {
      user: data.uniqueId,
      nickname: data.nickname,
      comment: data.comment,
      profilePicture: data.profilePictureUrl,
    });
  });

  tiktokLiveConnection.on("disconnected", () => {
    console.log("Disconnected from TikTok");
    io.emit("tiktok_disconnected");
  });
};

app.post("/api/connect", (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res
      .status(400)
      .json({ success: false, message: "Username is required" });
  }
  connectToTikTok(username, res);
});

// ─── File Upload ───────────────────────────────────────────────
const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, VIDEO_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_\-\u00C0-\u024F\u1E00-\u1EFF]/g, "-")
      .slice(0, 80);
    const unique = `${Date.now()}-${base}${ext}`;
    cb(null, unique);
  },
});

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-avatar${ext}`;
    cb(null, unique);
  },
});

const VIDEO_EXTS = new Set([".mp4", ".webm", ".mov", ".avi", ".mkv", ".ogg"]);
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"]);

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype.startsWith("video/") || VIDEO_EXTS.has(ext)) cb(null, true);
    else cb(new Error("Only video files are allowed (.mp4, .webm, .mov, ...)"));
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype.startsWith("image/") || IMAGE_EXTS.has(ext)) cb(null, true);
    else cb(new Error("Only image files are allowed (.jpg, .png, .webp, ...)"));
  },
});

// POST /api/upload/video  → saves to public/video/ → returns { path: '/video/...' }
app.post("/api/upload/video", (req, res) => {
  uploadVideo.single("file")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    console.log("Video uploaded:", req.file.filename);
    res.json({ path: `/video/${req.file.filename}` });
  });
});

// POST /api/upload/avatar → saves to public/avatar/ → returns { path: '/avatar/...' }
app.post("/api/upload/avatar", (req, res) => {
  uploadAvatar.single("file")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    console.log("Avatar uploaded:", req.file.filename);
    res.json({ path: `/avatar/${req.file.filename}` });
  });
});

// DELETE /api/files?path=/video/xxx.mp4  → physically removes the file
app.delete("/api/files", (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).json({ error: "Missing path" });

  // Security: only allow deleting from public/video/ and public/avatar/
  const allowed = ["/video/", "/avatar/"];
  if (!allowed.some((prefix) => filePath.startsWith(prefix))) {
    return res.status(403).json({ error: "Forbidden path" });
  }

  const abs = path.join(PUBLIC_DIR, filePath);
  if (!fs.existsSync(abs)) return res.json({ ok: true, message: "File not found (already deleted)" });

  fs.unlink(abs, (err) => {
    if (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ error: "Failed to delete file" });
    }
    console.log("Deleted file:", abs);
    res.json({ ok: true });
  });
});

// Socket client connection
io.on("connection", (socket) => {
  console.log("Client connected via socket:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = 3004;
httpServer.listen(PORT, () => {
  console.log(`Backend Server listening at http://localhost:${PORT}`);
  console.log(`Waiting for frontend to connect TikTok Live via API...`);
});
