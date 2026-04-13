import fs from "fs";
import path from "path";
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Thiếu SUPABASE_URL hoặc SUPABASE_KEY trong .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const loadJson = (filename) => {
  const filePath = path.join(__dirname, "..", "data", filename);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
};

const seedData = async () => {
  console.log("🌱 Bắt đầu seed dữ liệu từ JSON sang Supabase...");

  try {
    // 1. Seed IDOLS
    const idols = loadJson("idols.json");
    if (idols.length > 0) {
      console.log(`Đang seed ${idols.length} idols...`);
      // id ở JSON đang là ms (number quá lớn), Supabase id là BIGINT nên có thể bị lỗi,
      // tuy nhiên Supabase BIGINT chịu được Number.MAX_SAFE_INTEGER
      const { error } = await supabase.from("idols").insert(idols);
      if (error) console.error("Lỗi seed Idols", error.message);
      else console.log("✅ Seed Idols xong.");
    }

    // 2. Seed GIFTS
    const gifts = loadJson("gifts.json");
    if (gifts.length > 0) {
      console.log(`Đang seed ${gifts.length} gifts...`);

      const chunked = [];
      for (let i = 0; i < gifts.length; i += 100) {
        chunked.push(gifts.slice(i, i + 100));
      }

      for (const chunk of chunked) {
        const { error } = await supabase.from("gifts").insert(chunk);
        if (error) {
          console.error("Lỗi seed Gifts:", error.details || error.message);
        }
      }
      console.log("✅ Seed Gifts xong.");
    }

    // 3. Seed VIDEOS
    const videos = loadJson("videos.json");
    if (videos.length > 0) {
      console.log(`Đang seed ${videos.length} videos...`);
      const { error } = await supabase.from("videos").insert(videos);
      if (error) console.error("Lỗi seed Videos", error.message);
      else console.log("✅ Seed Videos xong.");
    }

    console.log("🎉 Hoàn tất seed dữ liệu! Bạn có thể bắt đầu sử dụng.");
  } catch (err) {
    console.error("Lỗi script:", err);
  }
};

seedData();
