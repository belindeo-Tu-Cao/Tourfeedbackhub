-- PostgreSQL Schema for TourFeedbackHub
-- Migrated from Firestore

-- ============================================
-- MASTER DATA TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS languages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT
);

CREATE TABLE IF NOT EXISTS nationalities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT
);

CREATE TABLE IF NOT EXISTS provinces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT
);

CREATE TABLE IF NOT EXISTS tour_types (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  "order" INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS guides (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT
);

-- Guide-Language junction
CREATE TABLE IF NOT EXISTS guide_languages (
  guide_id TEXT REFERENCES guides(id) ON DELETE CASCADE,
  language_id TEXT REFERENCES languages(id) ON DELETE CASCADE,
  PRIMARY KEY (guide_id, language_id)
);

-- Guide-Province junction
CREATE TABLE IF NOT EXISTS guide_provinces (
  guide_id TEXT REFERENCES guides(id) ON DELETE CASCADE,
  province_id TEXT REFERENCES provinces(id) ON DELETE CASCADE,
  PRIMARY KEY (guide_id, province_id)
);

-- Guide-Nationality junction
CREATE TABLE IF NOT EXISTS guide_nationalities (
  guide_id TEXT REFERENCES guides(id) ON DELETE CASCADE,
  nationality_id TEXT REFERENCES nationalities(id) ON DELETE CASCADE,
  PRIMARY KEY (guide_id, nationality_id)
);

-- ============================================
-- USERS
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'subscriber' CHECK (role IN ('admin','editor','author','contributor','subscriber')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','banned')),
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  social_links JSONB,
  permissions TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TOURS
-- ============================================

CREATE TABLE IF NOT EXISTS tours (
  id TEXT PRIMARY KEY,
  code TEXT,
  name TEXT NOT NULL,
  summary TEXT,
  itinerary TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  client_count INTEGER DEFAULT 0,
  client_country TEXT,
  client_city TEXT,
  guide_id TEXT REFERENCES guides(id),
  guide_name TEXT,
  status TEXT DEFAULT 'finished' CHECK (status IN ('finished','for_sale')),
  show_feedback_form BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tour photos (array of URLs)
CREATE TABLE IF NOT EXISTS tour_photos (
  id SERIAL PRIMARY KEY,
  tour_id TEXT REFERENCES tours(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  "order" INTEGER DEFAULT 0
);

-- Tour videos (array of URLs)
CREATE TABLE IF NOT EXISTS tour_videos (
  id SERIAL PRIMARY KEY,
  tour_id TEXT REFERENCES tours(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  "order" INTEGER DEFAULT 0
);

-- Tour-Provinces junction
CREATE TABLE IF NOT EXISTS tour_provinces (
  tour_id TEXT REFERENCES tours(id) ON DELETE CASCADE,
  province_name TEXT NOT NULL,
  PRIMARY KEY (tour_id, province_name)
);

-- Tour-TourTypes junction
CREATE TABLE IF NOT EXISTS tour_tour_types (
  tour_id TEXT REFERENCES tours(id) ON DELETE CASCADE,
  tour_type_id TEXT REFERENCES tour_types(id) ON DELETE CASCADE,
  PRIMARY KEY (tour_id, tour_type_id)
);

-- Tour-Nationalities junction (client nationalities)
CREATE TABLE IF NOT EXISTS tour_nationalities (
  tour_id TEXT REFERENCES tours(id) ON DELETE CASCADE,
  nationality_name TEXT NOT NULL,
  PRIMARY KEY (tour_id, nationality_name)
);

-- Tour guide languages
CREATE TABLE IF NOT EXISTS tour_guide_languages (
  tour_id TEXT REFERENCES tours(id) ON DELETE CASCADE,
  language_name TEXT NOT NULL,
  PRIMARY KEY (tour_id, language_name)
);

-- Tour comments subcollection
CREATE TABLE IF NOT EXISTS tour_comments (
  id TEXT PRIMARY KEY,
  tour_id TEXT REFERENCES tours(id) ON DELETE CASCADE,
  author_name TEXT,
  rating INTEGER,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CATEGORIES & TAGS
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id TEXT REFERENCES categories(id),
  "order" INTEGER DEFAULT 0,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- POSTS / PAGES
-- ============================================

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'post' CHECK (type IN ('post','page')),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','published','scheduled','private','trash')),
  author_id TEXT REFERENCES users(id),
  author_name TEXT,
  featured_image_id TEXT,
  featured_image JSONB,
  locale TEXT DEFAULT 'en',
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  allow_comments BOOLEAN DEFAULT true,
  seo JSONB,
  restored_from TEXT,
  restored_by TEXT,
  restored_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_locale_idx ON posts (slug, locale);

-- Post-Category junction
CREATE TABLE IF NOT EXISTS post_categories (
  post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- Post-Tag junction
CREATE TABLE IF NOT EXISTS post_tags (
  post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
  tag_id TEXT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Post versions (from subcollection posts/{postId}/versions)
CREATE TABLE IF NOT EXISTS post_versions (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  excerpt TEXT,
  author_id TEXT,
  status TEXT,
  change_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post revisions (from subcollection posts/{postId}/revisions)
CREATE TABLE IF NOT EXISTS post_revisions (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  excerpt TEXT,
  author_id TEXT,
  change_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
  post_type TEXT DEFAULT 'post',
  author_name TEXT,
  author_email TEXT,
  author_url TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','spam','trash')),
  parent_id TEXT REFERENCES comments(id),
  user_id TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FEEDBACK & REVIEWS
-- ============================================

CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  name TEXT,
  country TEXT,
  language TEXT,
  rating INTEGER,
  message TEXT,
  tour_id TEXT REFERENCES tours(id),
  photo_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  feedback_summary TEXT,
  detected_language TEXT,
  source TEXT,
  external_url TEXT,
  review_title TEXT,
  visible BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  source_url TEXT,
  source_review_id TEXT,
  guide_ref TEXT,
  tour_ref TEXT,
  author_display TEXT,
  title TEXT,
  tour_name TEXT,
  content TEXT,
  tags TEXT[],
  upload_id TEXT,
  approved_at TIMESTAMPTZ,
  review_id TEXT,
  rejected_at TIMESTAMPTZ,
  rejected_by TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  author_display TEXT,
  country TEXT,
  language TEXT,
  rating INTEGER,
  message TEXT,
  tour_id TEXT REFERENCES tours(id),
  tour_name TEXT,
  photo_urls TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  summary TEXT,
  review_type TEXT,
  approved_at TIMESTAMPTZ,
  feedback_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MEDIA
-- ============================================

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  title TEXT,
  alt_text TEXT,
  caption TEXT,
  description TEXT,
  mime_type TEXT,
  file_size INTEGER,
  media_type TEXT DEFAULT 'image',
  url TEXT NOT NULL,
  storage_path TEXT,
  uploaded_by TEXT REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SITE SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  site_name TEXT,
  logo_url_light TEXT,
  logo_url_dark TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_cta_label TEXT,
  hero_media_url TEXT,
  about_title TEXT,
  about_description TEXT,
  about_image_url TEXT,
  mission_statement TEXT,
  values TEXT[],
  contact JSONB,
  social JSONB,
  copyright TEXT,
  languages TEXT[],
  default_language TEXT DEFAULT 'en',
  primary_color TEXT,
  accent_color TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS theme_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  primary_font TEXT,
  secondary_font TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  background_color TEXT,
  text_color TEXT,
  link_color TEXT,
  header_style TEXT,
  footer_style TEXT,
  custom_css TEXT,
  custom_js TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTENT SLIDES
-- ============================================

CREATE TABLE IF NOT EXISTS site_content_slides (
  id TEXT PRIMARY KEY,
  locale TEXT DEFAULT 'en',
  title TEXT NOT NULL,
  subtitle TEXT,
  button_text TEXT,
  button_link TEXT,
  image_url TEXT,
  "order" INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','published')),
  overlay_opacity NUMERIC,
  alt TEXT,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NAVIGATION MENUS
-- ============================================

CREATE TABLE IF NOT EXISTS navigation_menus (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL CHECK (key IN ('header','footer')),
  locale TEXT,
  title TEXT,
  published BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS navigation_menu_items (
  id TEXT PRIMARY KEY,
  menu_id TEXT REFERENCES navigation_menus(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  href TEXT,
  type TEXT DEFAULT 'internal' CHECK (type IN ('internal','external','hash')),
  "order" INTEGER DEFAULT 0,
  parent_id TEXT,
  icon TEXT,
  target TEXT DEFAULT '_self',
  visible_for TEXT[],
  badge JSONB,
  area TEXT,
  "group" TEXT
);

-- ============================================
-- STORIES
-- ============================================

CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  cover_image_url TEXT,
  published_at TIMESTAMPTZ,
  read_time_minutes INTEGER,
  tags TEXT[],
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MAIL (for Cloud Functions email queue)
-- ============================================

CREATE TABLE IF NOT EXISTS mail (
  id TEXT PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT,
  html TEXT,
  text TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_tours_status ON tours (status);
CREATE INDEX IF NOT EXISTS idx_tours_guide_id ON tours (guide_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts (status);
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts (type);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts (published_at);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback (status);
CREATE INDEX IF NOT EXISTS idx_feedback_tour_id ON feedback (tour_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews (status);
CREATE INDEX IF NOT EXISTS idx_reviews_tour_id ON reviews (tour_id);
CREATE INDEX IF NOT EXISTS idx_reviews_review_type ON reviews (review_type);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments (status);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_at ON media (uploaded_at);
CREATE INDEX IF NOT EXISTS idx_post_versions_post_id ON post_versions (post_id);
CREATE INDEX IF NOT EXISTS idx_post_revisions_post_id ON post_revisions (post_id);
CREATE INDEX IF NOT EXISTS idx_navigation_menu_items_menu_id ON navigation_menu_items (menu_id);
