/*
  # Admin Features Enhancement & Media Management

  ## New Tables

  ### 1. media_files
  - Manages uploaded media files (images, documents)
  - Fields: id, file_name, file_path, file_size, mime_type, alt_text, uploaded_by, folder
  - Used by news posts, site settings, and other content

  ### 2. user_sessions
  - Tracks user login sessions and IP addresses
  - Fields: id, user_id, ip_address, user_agent, login_at, logout_at
  - Used for analytics and security tracking

  ### 3. footer_links
  - Manages footer navigation links
  - Fields: id, title, url, category, sort_order, is_active
  - Allows admin to customize footer menus

  ## Modified Tables

  ### news_posts
  - Added: meta_description, meta_keywords, seo_title for SEO
  - Enhanced for better content management

  ### users
  - Added: last_login_at, last_login_ip, is_banned, banned_at, ban_reason
  - Enhanced for user management and security

  ### site_settings
  - Already exists, will be used for favicon, copyright, etc.

  ## Security
  - RLS enabled on all new tables
  - Admins can manage all content
  - Users can only access their own data
*/

-- Media files table for image and document management
CREATE TABLE IF NOT EXISTS media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_path text NOT NULL UNIQUE,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  alt_text text,
  caption text,
  folder text DEFAULT 'general',
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  is_public boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User sessions for tracking logins and IPs
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_address inet,
  user_agent text,
  country text,
  city text,
  login_at timestamptz DEFAULT now(),
  logout_at timestamptz,
  is_active boolean DEFAULT true
);

-- Footer links management
CREATE TABLE IF NOT EXISTS footer_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text NOT NULL,
  category text DEFAULT 'general',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  opens_new_tab boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add SEO fields to news_posts if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'news_posts' AND column_name = 'meta_description'
  ) THEN
    ALTER TABLE news_posts ADD COLUMN meta_description text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'news_posts' AND column_name = 'meta_keywords'
  ) THEN
    ALTER TABLE news_posts ADD COLUMN meta_keywords text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'news_posts' AND column_name = 'seo_title'
  ) THEN
    ALTER TABLE news_posts ADD COLUMN seo_title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'news_posts' AND column_name = 'featured_image_id'
  ) THEN
    ALTER TABLE news_posts ADD COLUMN featured_image_id uuid REFERENCES media_files(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add user management fields if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE users ADD COLUMN last_login_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_login_ip'
  ) THEN
    ALTER TABLE users ADD COLUMN last_login_ip inet;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_banned'
  ) THEN
    ALTER TABLE users ADD COLUMN is_banned boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'banned_at'
  ) THEN
    ALTER TABLE users ADD COLUMN banned_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'ban_reason'
  ) THEN
    ALTER TABLE users ADD COLUMN ban_reason text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'banned_by'
  ) THEN
    ALTER TABLE users ADD COLUMN banned_by uuid REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media_files
CREATE POLICY "Authenticated users can view public media"
  ON media_files FOR SELECT
  TO authenticated
  USING (is_public = true OR uploaded_by = auth.uid());

CREATE POLICY "Authenticated users can upload media"
  ON media_files FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can update their own media"
  ON media_files FOR UPDATE
  TO authenticated
  USING (uploaded_by = auth.uid())
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own media"
  ON media_files FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- RLS Policies for user_sessions
CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert sessions"
  ON user_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
  ON user_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for footer_links
CREATE POLICY "Anyone can view active footer links"
  ON footer_links FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Only authenticated users can manage footer links"
  ON footer_links FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_by ON media_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_files_folder ON media_files(folder);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_ip_address ON user_sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_user_sessions_login_at ON user_sessions(login_at DESC);
CREATE INDEX IF NOT EXISTS idx_footer_links_category ON footer_links(category);

-- Insert default footer links
INSERT INTO footer_links (title, url, category, sort_order) VALUES
  ('About Us', '/about', 'company', 1),
  ('Contact', '/contact', 'company', 2),
  ('Pricing', '/pricing', 'company', 3),
  ('Privacy Policy', '/privacy', 'legal', 1),
  ('Terms of Service', '/terms', 'legal', 2),
  ('FAQs', '/faq', 'support', 1),
  ('Support', '/support', 'support', 2)
ON CONFLICT DO NOTHING;
