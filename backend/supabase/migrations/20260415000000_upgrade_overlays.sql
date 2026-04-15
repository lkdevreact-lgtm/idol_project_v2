-- Thêm cột media_url để lưu đường dẫn file upload (thay thế cho cột image cũ)
ALTER TABLE overlays ADD COLUMN IF NOT EXISTS media_url TEXT;

-- Cấu hình riêng cho PARTICLE (tách ra khỏi config chung cho rõ ràng)
ALTER TABLE overlays ADD COLUMN IF NOT EXISTS particle_config JSONB DEFAULT '{}';

-- Cấu hình riêng cho VIDEO
ALTER TABLE overlays ADD COLUMN IF NOT EXISTS video_config JSONB DEFAULT '{}';

-- Migrate dữ liệu cũ: copy cột image sang media_url nếu có
UPDATE overlays SET media_url = image WHERE image IS NOT NULL AND media_url IS NULL;

-- Copy config cũ sang particle_config cho các overlay type particles
UPDATE overlays SET particle_config = config WHERE type = 'particles' AND particle_config = '{}';
