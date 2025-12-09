/*
  # ESGReport Platform - Core Database Schema
  
  Creates the foundational tables for the ESG reporting platform.
  
  ## Tables Created
  
  ### 1. organizations
  - Stores company/organization information
  - Manages subscription tiers and billing
  - Links to Stripe for payment processing
  - Fields: id, name, slug, industry, size, subscription info, Stripe IDs
  
  ### 2. users  
  - Platform user accounts with role-based access
  - Links to organizations
  - Roles: user, admin, super_admin
  - Fields: id, email, name, role, organization_id, profile image
  
  ### 3. esg_reports
  - Core ESG reports with multi-framework support
  - Tracks report status and scores
  - Links to organizations and frameworks
  - Fields: id, title, framework, status, scores (E/S/G), dates
  
  ### 4. framework_templates
  - ESG framework definitions (GRI, SASB, TCFD, CSRD, etc.)
  - Stores requirements and data field structures
  - Fields: id, name, code, version, requirements, data_fields
  
  ### 5. sites
  - Multi-site management for organizations
  - Physical locations with geospatial data
  - Fields: id, name, address, coordinates, site_type, certifications
  
  ### 6. esg_facts
  - Individual ESG data points and metrics
  - Links to sites, frameworks, and metrics
  - Supports validation and data quality tracking
  - Fields: id, metric info, value, unit, year, validation_status
  
  ### 7. canonical_metrics
  - Standardized metric definitions
  - Cross-framework metric mappings
  - Fields: id, canonical_name, description, units, calculation_method
  
  ### 8. news_posts
  - Blog and news content management
  - Fields: id, title, slug, content, published_at, author
  
  ### 9. case_studies
  - Customer success stories
  - Fields: id, title, slug, company, industry, results, metrics
  
  ### 10. contact_inquiries
  - Contact form submissions
  - Fields: id, name, email, company, message, status
  
  ## Security
  - All tables have RLS enabled
  - Policies restrict access based on authentication and organization membership
  - Super admins have full access across all organizations
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(255) NOT NULL,
  slug varchar(255) UNIQUE NOT NULL,
  industry varchar(100),
  size varchar(50),
  address text,
  description text,
  website varchar(500),
  logo varchar(500),
  subscription_tier varchar(50) DEFAULT 'starter' CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
  subscription_status varchar(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing')),
  stripe_customer_id varchar(255),
  stripe_subscription_id varchar(255),
  subscription_expires_at timestamptz,
  max_users integer DEFAULT 50,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email varchar(255) UNIQUE NOT NULL,
  first_name varchar(100),
  last_name varchar(100),
  profile_image_url varchar(500),
  role varchar(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ESG Reports table
CREATE TABLE IF NOT EXISTS esg_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  title varchar(255) NOT NULL,
  description text,
  reporting_period varchar(50),
  start_date date,
  end_date date,
  status varchar(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'under_review', 'completed', 'published')),
  framework varchar(50) NOT NULL,
  overall_score decimal(5,2),
  environmental_score decimal(5,2),
  social_score decimal(5,2),
  governance_score decimal(5,2),
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Framework Templates table
CREATE TABLE IF NOT EXISTS framework_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(255) NOT NULL,
  code varchar(50) UNIQUE NOT NULL,
  version varchar(20),
  description text,
  framework varchar(50) NOT NULL,
  requirements jsonb DEFAULT '[]'::jsonb,
  data_fields jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sites table (multi-site management)
CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name varchar(255) NOT NULL,
  address text,
  city varchar(100),
  country varchar(2),
  site_type varchar(50) CHECK (site_type IN ('headquarters', 'office', 'factory', 'warehouse', 'retail', 'other')),
  coordinates jsonb,
  floor_area decimal,
  operating_hours jsonb,
  certifications jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Canonical Metrics table
CREATE TABLE IF NOT EXISTS canonical_metrics (
  id varchar(100) PRIMARY KEY,
  canonical_name varchar(255) UNIQUE NOT NULL,
  display_name varchar(255) NOT NULL,
  description text,
  data_type varchar(50),
  units varchar(100),
  scope_definition text,
  calculation_method text,
  validation_rules jsonb DEFAULT '{}'::jsonb,
  category varchar(50),
  subcategory varchar(100),
  tags text[],
  version varchar(20),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ESG Facts table (data points)
CREATE TABLE IF NOT EXISTS esg_facts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  site_id uuid REFERENCES sites(id) ON DELETE SET NULL,
  framework_source varchar(50),
  metric_code varchar(100),
  metric_name varchar(255) NOT NULL,
  value decimal,
  text_value text,
  unit varchar(50),
  year integer,
  reporting_period varchar(50),
  data_source varchar(50) CHECK (data_source IN ('manual', 'imported', 'api', 'calculated')),
  validation_status varchar(50) DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'rejected')),
  metadata jsonb DEFAULT '{}'::jsonb,
  entered_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- News Posts table
CREATE TABLE IF NOT EXISTS news_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar(255) NOT NULL,
  slug varchar(255) UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  featured_image varchar(500),
  author_id uuid REFERENCES users(id),
  author_name varchar(255),
  category varchar(100),
  tags text[],
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Case Studies table
CREATE TABLE IF NOT EXISTS case_studies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar(255) NOT NULL,
  slug varchar(255) UNIQUE NOT NULL,
  company varchar(255) NOT NULL,
  industry varchar(100),
  excerpt text,
  content text NOT NULL,
  challenge text,
  solution text,
  results text,
  metrics jsonb DEFAULT '[]'::jsonb,
  featured_image varchar(500),
  logo varchar(500),
  testimonial text,
  testimonial_author varchar(255),
  testimonial_role varchar(255),
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contact Inquiries table
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  company varchar(255),
  phone varchar(50),
  subject varchar(255),
  message text NOT NULL,
  status varchar(50) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  assigned_to uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_esg_reports_org ON esg_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_esg_reports_status ON esg_reports(status);
CREATE INDEX IF NOT EXISTS idx_esg_facts_org ON esg_facts(organization_id);
CREATE INDEX IF NOT EXISTS idx_esg_facts_site ON esg_facts(site_id);
CREATE INDEX IF NOT EXISTS idx_sites_org ON sites(organization_id);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_posts(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_case_studies_published ON case_studies(is_published, published_at);

-- Enable Row Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE canonical_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Admins can update their organization"
  ON organizations FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for users
CREATE POLICY "Users can view users in their organization"
  ON users FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage users in their organization"
  ON users FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for esg_reports
CREATE POLICY "Users can view reports in their organization"
  ON esg_reports FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Users can create reports for their organization"
  ON esg_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update reports in their organization"
  ON esg_reports FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete reports in their organization"
  ON esg_reports FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for framework_templates (public read, admin write)
CREATE POLICY "Anyone can view active framework templates"
  ON framework_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Super admins can manage framework templates"
  ON framework_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- RLS Policies for sites
CREATE POLICY "Users can view sites in their organization"
  ON sites FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Users can manage sites in their organization"
  ON sites FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for canonical_metrics (public read)
CREATE POLICY "Anyone can view active canonical metrics"
  ON canonical_metrics FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for esg_facts
CREATE POLICY "Users can view facts in their organization"
  ON esg_facts FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Users can manage facts in their organization"
  ON esg_facts FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for news_posts (public read for published)
CREATE POLICY "Anyone can view published news posts"
  ON news_posts FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Super admins can manage news posts"
  ON news_posts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- RLS Policies for case_studies (public read for published)
CREATE POLICY "Anyone can view published case studies"
  ON case_studies FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Super admins can manage case studies"
  ON case_studies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- RLS Policies for contact_inquiries
CREATE POLICY "Anyone can create contact inquiries"
  ON contact_inquiries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view and manage contact inquiries"
  ON contact_inquiries FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
