-- Hotel Tukuche Peak — canonical production schema (Neon PostgreSQL)
-- Idempotent: safe to run multiple times. Uses CREATE TABLE IF NOT EXISTS plus
-- ADD COLUMN IF NOT EXISTS so it also evolves an existing database in place.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================ USERS / AUTH ============================
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  email_norm     TEXT NOT NULL UNIQUE,
  phone          TEXT,
  whatsapp       TEXT,
  password_hash  TEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  role           TEXT NOT NULL DEFAULT 'GUEST',
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  loyalty_tier   TEXT NOT NULL DEFAULT 'Bronze',
  preferences    JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_tier TEXT NOT NULL DEFAULT 'Bronze';
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notes TEXT;

-- One-time codes for email verification & password reset
CREATE TABLE IF NOT EXISTS auth_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_norm  TEXT NOT NULL,
  code        TEXT NOT NULL,
  purpose     TEXT NOT NULL,            -- 'verify' | 'reset'
  expires_at  TIMESTAMPTZ NOT NULL,
  consumed    BOOLEAN NOT NULL DEFAULT FALSE,
  attempts    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_auth_codes_email ON auth_codes(email_norm, purpose);

-- ============================ ROOMS ============================
CREATE TABLE IF NOT EXISTS rooms (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  description      TEXT NOT NULL DEFAULT '',
  long_description TEXT,
  price            NUMERIC(10,2) NOT NULL DEFAULT 0,
  capacity         INTEGER NOT NULL DEFAULT 2,
  total_units      INTEGER NOT NULL DEFAULT 1,
  size_sqm         INTEGER,
  beds             TEXT,
  amenities        JSONB NOT NULL DEFAULT '[]'::jsonb,
  images           JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured         BOOLEAN NOT NULL DEFAULT FALSE,
  status           TEXT NOT NULL DEFAULT 'active',   -- active | blocked | hidden
  sort             INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS long_description TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS beds TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS sort INTEGER NOT NULL DEFAULT 0;

-- ============================ BOOKINGS ============================
CREATE TABLE IF NOT EXISTS bookings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference        TEXT NOT NULL UNIQUE,
  user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  room_id          UUID REFERENCES rooms(id) ON DELETE SET NULL,
  guest_name       TEXT NOT NULL,
  guest_email      TEXT NOT NULL,
  guest_phone      TEXT,
  check_in         DATE NOT NULL,
  check_out        DATE NOT NULL,
  guests           INTEGER NOT NULL DEFAULT 1,
  nights           INTEGER NOT NULL DEFAULT 1,
  room_rate        NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal         NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax              NUMERIC(10,2) NOT NULL DEFAULT 0,
  total            NUMERIC(10,2) NOT NULL DEFAULT 0,
  special_requests TEXT,
  status           TEXT NOT NULL DEFAULT 'pending',  -- pending | confirmed | checked_in | checked_out | cancelled
  payment_status   TEXT NOT NULL DEFAULT 'unpaid',   -- unpaid | paid | refunded
  source           TEXT NOT NULL DEFAULT 'online',   -- online | walk_in | phone | ai
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- ============================ RESTAURANT ============================
CREATE TABLE IF NOT EXISTS menu_categories (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  TEXT NOT NULL,
  sort  INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS sort INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS menu_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  image       TEXT,
  dietary     JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured    BOOLEAN NOT NULL DEFAULT FALSE,
  available   BOOLEAN NOT NULL DEFAULT TRUE,
  sort        INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS sort INTEGER NOT NULL DEFAULT 0;

-- ============================ OFFERS ============================
CREATE TABLE IF NOT EXISTS offers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  category     TEXT NOT NULL DEFAULT 'seasonal',
  discount_pct INTEGER NOT NULL DEFAULT 0,
  code         TEXT,
  image        TEXT,
  start_date   DATE,
  end_date     DATE,
  usage_limit  INTEGER,
  used_count   INTEGER NOT NULL DEFAULT 0,
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS discount_pct INTEGER NOT NULL DEFAULT 0;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS code TEXT;

-- ============================ CONTENT (CMS) ============================
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image TEXT,
  duration TEXT,
  difficulty TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS sort INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS attractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image TEXT,
  distance TEXT,
  sort INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE attractions ADD COLUMN IF NOT EXISTS sort INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  caption TEXT,
  category TEXT,
  sort INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS caption TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS sort INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS sort INTEGER NOT NULL DEFAULT 0;

-- Key/value CMS store (hero copy, about, hotel settings, contact info)
CREATE TABLE IF NOT EXISTS cms_content (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- ============================ REVIEWS ============================
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  room_id    UUID REFERENCES rooms(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title      TEXT NOT NULL DEFAULT '',
  body       TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected | hidden
  reply      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES rooms(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- ============================ WISHLIST ============================
CREATE TABLE IF NOT EXISTS wishlist (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind    TEXT NOT NULL DEFAULT 'room', -- room | menu | experience
  item_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, item_id)
);

-- ============================ LOYALTY ============================
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points    INTEGER NOT NULL,
  reason    TEXT NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE loyalty_transactions ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL;

-- ============================ WAITLIST ============================
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT NOT NULL, email TEXT, phone TEXT,
  room_preference TEXT, requested_from DATE, requested_to DATE,
  guests INTEGER NOT NULL DEFAULT 1, notes TEXT,
  status TEXT NOT NULL DEFAULT 'open', -- open | contacted | converted | closed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================ CONTACT / NOTIFICATIONS ============================
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, subject TEXT, message TEXT NOT NULL,
  handled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- null = admin/global
  audience TEXT NOT NULL DEFAULT 'guest', -- guest | admin
  title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
