-- ==================== PhotoHub Pro v2.0 - Complete Database Schema ====================
-- Features: Cloud Storage, Password Reset, Admin Dashboard, Search, Pricing,
--           Slideshow, Timeline, People Tagging, Instagram Stories,
--           Anniversary Reminders, Free Anniversary Photoshoots

-- ==================== BASE TABLES ====================

CREATE TABLE photographers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  business_name VARCHAR(255),
  
  -- Password reset
  reset_token VARCHAR(255),
  reset_token_expiry TIMESTAMP,
  
  -- Subscription
  subscription_tier VARCHAR(50) DEFAULT 'free', -- free, starter, pro
  subscription_status VARCHAR(50) DEFAULT 'active',
  stripe_customer_id VARCHAR(255),
  
  -- Admin
  is_admin BOOLEAN DEFAULT FALSE,
  
  -- Branding
  custom_logo_url VARCHAR(500),
  custom_color VARCHAR(20),
  custom_domain VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_email (email),
  INDEX idx_admin (is_admin)
);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  photographer_id INT NOT NULL,
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  event_type VARCHAR(100), -- wedding, pre-wedding, engagement, etc
  event_date DATE,
  location VARCHAR(255),
  description TEXT,
  total_amount DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(50) DEFAULT 'active',
  share_token VARCHAR(255) UNIQUE,
  share_expires_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (photographer_id) REFERENCES photographers(id),
  INDEX idx_photographer (photographer_id),
  INDEX idx_share_token (share_token)
);

CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  photographer_id INT NOT NULL,
  project_id INT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  image_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  display_order INT,
  file_size_mb DECIMAL(10, 2),
  
  -- Timeline fields (FEATURE #2)
  event_time_label VARCHAR(100), -- "Getting Ready", "Ceremony", "Reception"
  event_time_order INT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (photographer_id) REFERENCES photographers(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  INDEX idx_photographer (photographer_id),
  INDEX idx_project (project_id),
  INDEX idx_title (title),
  INDEX idx_event_time (event_time_order)
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  photographer_id INT NOT NULL,
  project_id INT,
  amount DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'INR',
  payment_date TIMESTAMP,
  status VARCHAR(50), -- pending, paid, failed
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  stripe_payment_id VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (photographer_id) REFERENCES photographers(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  INDEX idx_photographer (photographer_id)
);

CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  photographer_id INT NOT NULL,
  photo_id INT NOT NULL,
  client_id VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (photographer_id) REFERENCES photographers(id),
  FOREIGN KEY (photo_id) REFERENCES photos(id),
  INDEX idx_photo (photo_id)
);

-- ==================== FEATURE #1: SLIDESHOW TABLES ====================

CREATE TABLE slideshows (
  id SERIAL PRIMARY KEY,
  project_id INT NOT NULL,
  name VARCHAR(255),
  music_style VARCHAR(50), -- romantic, upbeat, emotional, classic
  duration_per_photo INT DEFAULT 5000, -- milliseconds
  transition_style VARCHAR(50) DEFAULT 'fade',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (project_id) REFERENCES projects(id),
  INDEX idx_project (project_id)
);

CREATE TABLE slideshow_photos (
  id SERIAL PRIMARY KEY,
  slideshow_id INT NOT NULL,
  photo_id INT NOT NULL,
  order_number INT,
  
  FOREIGN KEY (slideshow_id) REFERENCES slideshows(id),
  FOREIGN KEY (photo_id) REFERENCES photos(id),
  INDEX idx_slideshow (slideshow_id),
  INDEX idx_order (order_number)
);

-- ==================== FEATURE #3: PEOPLE TAGGING TABLES ====================

CREATE TABLE photo_tags (
  id SERIAL PRIMARY KEY,
  photo_id INT NOT NULL,
  person_name VARCHAR(255),
  face_index INT, -- which face in the photo (0, 1, 2, etc)
  face_coordinates JSONB, -- store face bounding box
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (photo_id) REFERENCES photos(id),
  INDEX idx_photo (photo_id),
  INDEX idx_person_name (person_name)
);

-- ==================== FEATURE #4: INSTAGRAM STORY TABLES ====================

CREATE TABLE instagram_stories (
  id SERIAL PRIMARY KEY,
  project_id INT NOT NULL,
  photo_id INT NOT NULL,
  template_type VARCHAR(50), -- simple, quote, announcement
  text_overlay VARCHAR(500),
  hashtags VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (photo_id) REFERENCES photos(id),
  INDEX idx_project (project_id),
  INDEX idx_created (created_at)
);

-- ==================== FEATURES #5 & #6: ANNIVERSARY TABLES ====================

CREATE TABLE anniversary_reminders (
  id SERIAL PRIMARY KEY,
  project_id INT,
  photographer_id INT,
  event_date DATE,
  reminder_sent_count INT DEFAULT 0,
  last_reminder_date DATE,
  
  -- Free photoshoot claim
  photoshoot_claimed BOOLEAN DEFAULT FALSE,
  photoshoot_date DATE,
  photoshoot_location VARCHAR(255),
  photoshoot_notes TEXT,
  photoshoot_completed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (photographer_id) REFERENCES photographers(id),
  INDEX idx_event_date (event_date),
  INDEX idx_claimed (photoshoot_claimed)
);

-- ==================== ADDITIONAL TABLES ====================

CREATE TABLE client_albums (
  id SERIAL PRIMARY KEY,
  project_id INT NOT NULL,
  name VARCHAR(255),
  description TEXT,
  album_order INT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (project_id) REFERENCES projects(id),
  INDEX idx_project (project_id)
);

CREATE TABLE album_photos (
  id SERIAL PRIMARY KEY,
  album_id INT NOT NULL,
  photo_id INT NOT NULL,
  order_in_album INT,
  
  FOREIGN KEY (album_id) REFERENCES client_albums(id),
  FOREIGN KEY (photo_id) REFERENCES photos(id)
);

-- ==================== INDEXES FOR PERFORMANCE ====================

CREATE INDEX idx_photos_photographer_project ON photos(photographer_id, project_id);
CREATE INDEX idx_slideshows_project ON slideshows(project_id);
CREATE INDEX idx_slideshow_photos_slideshow ON slideshow_photos(slideshow_id);
CREATE INDEX idx_photo_tags_person ON photo_tags(person_name);
CREATE INDEX idx_instagram_stories_project ON instagram_stories(project_id);
CREATE INDEX idx_anniversary_event_date ON anniversary_reminders(event_date);
CREATE INDEX idx_projects_photographer ON projects(photographer_id);

-- ==================== VIEWS FOR COMMON QUERIES ====================

CREATE VIEW photographer_stats AS
SELECT 
  p.id,
  p.name,
  p.email,
  p.subscription_tier,
  COUNT(DISTINCT pr.id) as total_projects,
  COUNT(DISTINCT ph.id) as total_photos,
  SUM(CASE WHEN pay.status = 'paid' THEN pay.amount ELSE 0 END) as total_revenue
FROM photographers p
LEFT JOIN projects pr ON p.id = pr.photographer_id
LEFT JOIN photos ph ON p.id = ph.photographer_id
LEFT JOIN payments pay ON p.id = pay.photographer_id
GROUP BY p.id, p.name, p.email, p.subscription_tier;

-- ==================== INITIALIZATION ====================

-- Insert default subscription tiers pricing
-- Can be managed via admin panel
COMMENT ON TABLE photographers IS 'Core photographers table with subscription and admin management';
COMMENT ON TABLE projects IS 'Client projects - each wedding/event is a project';
COMMENT ON TABLE photos IS 'Individual photos with timeline and tagging support';
COMMENT ON TABLE slideshows IS 'Feature #1: Beautiful slideshows with music';
COMMENT ON TABLE photo_tags IS 'Feature #3: Smart people tagging with AI';
COMMENT ON TABLE instagram_stories IS 'Feature #4: Instagram story generation';
COMMENT ON TABLE anniversary_reminders IS 'Features #5 & #6: Anniversary email and free photoshoot';

-- ==================== END OF SCHEMA ====================
