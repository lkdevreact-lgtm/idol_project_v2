import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ [supabase] Thiếu SUPABASE_URL hoặc SUPABASE_KEY trong file .env");
}

export const supabase = createClient(supabaseUrl || "", supabaseKey || "");
