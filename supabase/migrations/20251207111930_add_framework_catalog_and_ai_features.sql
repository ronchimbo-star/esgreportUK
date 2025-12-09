/*
  # Framework Catalog & AI Features
  
  ## Overview
  This migration adds the framework catalog system and AI conversation features
  to complement the existing ESG reporting infrastructure.
  
  ## New Tables
  
  ### 1. framework_categories
  Categories for organizing frameworks (Mandatory, Voluntary, Financial, etc.)
  - `id` (uuid, PK)
  - `name`, `slug`, `description`
  - `icon`, `color`, `sort_order`
  
  ### 2. frameworks
  Complete framework catalog with all ESG reporting standards
  - `id` (uuid, PK)
  - `name`, `slug`, `category_id`
  - `difficulty`, `estimated_weeks`, `status`
  - `key_features`, `coverage_description`
  - `requires_subscription`, `metadata`
  
  ### 3. framework_bundles
  Pre-configured framework packages
  - `id` (uuid, PK)
  - `name`, `slug`, `description`
  - `framework_ids` (array of framework IDs)
  
  ### 4. comments
  Collaboration comments on reports and data
  - `id` (uuid, PK)
  - `report_id`, `author_id`
  - `content`, `mentions`, `is_resolved`
  
  ### 5. ai_conversations
  AI chat history per report
  - `id` (uuid, PK)
  - `report_id`, `user_id`
  - `messages` (jsonb array)
  - `context` (jsonb)
  
  ## Security
  - Enable RLS on all new tables
  - Framework catalog is publicly readable
  - Comments and AI conversations restricted to organization members
*/

-- Create enums for frameworks
DO $$ BEGIN
  CREATE TYPE framework_difficulty_level AS ENUM ('low', 'medium', 'high', 'very_high');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE framework_availability_status AS ENUM ('available', 'coming_soon');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_level AS ENUM ('starter', 'professional', 'enterprise');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- FRAMEWORK CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS framework_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  color text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE framework_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view framework categories"
  ON framework_categories FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- FRAMEWORKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category_id uuid REFERENCES framework_categories(id) ON DELETE SET NULL,
  description text,
  difficulty framework_difficulty_level DEFAULT 'medium',
  estimated_weeks text,
  key_features text[] DEFAULT '{}',
  coverage_description text,
  status framework_availability_status DEFAULT 'available',
  requires_subscription subscription_level DEFAULT 'starter',
  icon text,
  color_accent text,
  metadata jsonb DEFAULT '{}',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE frameworks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_frameworks_category_id ON frameworks(category_id);
CREATE INDEX IF NOT EXISTS idx_frameworks_status ON frameworks(status);
CREATE INDEX IF NOT EXISTS idx_frameworks_slug ON frameworks(slug);

CREATE POLICY "Anyone authenticated can view frameworks"
  ON frameworks FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- FRAMEWORK BUNDLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS framework_bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  target_audience text,
  framework_ids uuid[] DEFAULT '{}',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE framework_bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view framework bundles"
  ON framework_bundles FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- COMMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES esg_reports(id) ON DELETE CASCADE,
  parent_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  mentions uuid[] DEFAULT '{}',
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_comments_report_id ON comments(report_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);

CREATE POLICY "Users can view comments on their organization's reports"
  ON comments FOR SELECT
  TO authenticated
  USING (
    report_id IN (
      SELECT id FROM esg_reports WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create comments on their organization's reports"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    report_id IN (
      SELECT id FROM esg_reports WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
    AND author_id = auth.uid()
  );

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- ============================================================================
-- AI CONVERSATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES esg_reports(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  messages jsonb DEFAULT '[]',
  context jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_ai_conversations_report_id ON ai_conversations(report_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);

CREATE POLICY "Users can view their own AI conversations"
  ON ai_conversations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create AI conversations for their organization's reports"
  ON ai_conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    report_id IN (
      SELECT id FROM esg_reports WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own AI conversations"
  ON ai_conversations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- TRIGGER FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_frameworks_timestamp BEFORE UPDATE ON frameworks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_comments_timestamp BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_ai_conversations_timestamp BEFORE UPDATE ON ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_timestamp();