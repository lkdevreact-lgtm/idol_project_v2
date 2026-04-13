-- Bảng gifts: Danh sách quà TikTok
CREATE TABLE IF NOT EXISTS gifts (
    id BIGSERIAL PRIMARY KEY,
    "giftId" BIGINT UNIQUE NOT NULL,
    "giftName" TEXT NOT NULL,
    image TEXT,
    diamonds INTEGER,
    "maxRepeatCount" INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    "idolId" BIGINT,
    "overlayMedia" TEXT,
    "overlayDuration" INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng idols: Danh sách idol
CREATE TABLE IF NOT EXISTS idols (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    active BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng videos: Video của idol gắn với gift
CREATE TABLE IF NOT EXISTS videos (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    video TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    "idolId" BIGINT,
    gift TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng gift_logs: Lịch sử tặng quà realtime
CREATE TABLE IF NOT EXISTS gift_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "giftId" BIGINT,
    "giftName" TEXT,
    "userId" TEXT,
    nickname TEXT,
    "profilePicture" TEXT,
    amount INTEGER DEFAULT 1,
    diamonds INTEGER DEFAULT 0,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
