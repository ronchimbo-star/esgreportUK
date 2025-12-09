/*
  # ESGReport Platform - Additional Tables
  
  Creates additional tables for advanced features.
  
  ## Tables Created
  
  ### 1. data_collection_templates
  - Templates for data collection forms
  - Framework-specific data requirements
  
  ### 2. data_imports
  - Tracking of data import operations
  - Import history and status
  
  ### 3. generated_reports
  - AI-generated report content
  - Report sections and metadata
  
  ### 4. report_sections
  - Individual sections of ESG reports
  - Content, status, and version tracking
  
  ### 5. framework_metric_mappings
  - Cross-framework metric mappings
  - Transformation rules between frameworks
  
  ### 6. consultant_requests
  - Professional services requests
  - Consultation tracking
  
  ### 7. site_settings
  - Platform configuration
  - White-label and customization settings
  
  ### 8. support_tickets
  - Customer support tracking
  - Ticket management system
  
  ### 9. audit_logs
  - System audit trail
  - User activity tracking
  
  ### 10. certifications
  - Building and organizational certifications
  - BREEAM, LEED, WELL, etc.
*/

-- Data Collection Templates
CREATE TABLE IF NOT EXISTS data_collection_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(255) NOT NULL,
  framework varchar(50) NOT NULL,
  category varchar(100),
  description text,
  fields jsonb DEFAULT '[]'::jsonb,
  validation_rules jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Data Imports
CREATE TABLE IF NOT EXISTS data_imports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  file_name varchar(255),
  file_size integer,
  import_type varchar(50) CHECK (import_type IN ('csv', 'excel', 'api', 'manual')),
  status varchar(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  records_total integer DEFAULT 0,
  records_processed integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  error_log jsonb DEFAULT '[]'::jsonb,
  imported_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Generated Reports (AI)
CREATE TABLE IF NOT EXISTS generated_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id uuid REFERENCES esg_reports(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  framework varchar(50) NOT NULL,
  title varchar(255) NOT NULL,
  content text,
  sections jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  ai_model varchar(100),
  generation_status varchar(50) DEFAULT 'pending' CHECK (generation_status IN ('pending', 'generating', 'completed', 'failed')),
  generated_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Report Sections
CREATE TABLE IF NOT EXISTS report_sections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id uuid REFERENCES esg_reports(id) ON DELETE CASCADE NOT NULL,
  section_number integer,
  title varchar(255) NOT NULL,
  content text,
  status varchar(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'reviewed')),
  word_count integer,
  version integer DEFAULT 1,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Framework Metric Mappings
CREATE TABLE IF NOT EXISTS framework_metric_mappings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_framework varchar(50) NOT NULL,
  target_framework varchar(50) NOT NULL,
  source_metric_code varchar(100) NOT NULL,
  target_metric_code varchar(100) NOT NULL,
  transformation_rule text,
  confidence_score decimal(3,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Consultant Requests
CREATE TABLE IF NOT EXISTS consultant_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  company varchar(255),
  phone varchar(50),
  service_type varchar(100),
  budget_range varchar(50),
  timeline varchar(100),
  description text NOT NULL,
  status varchar(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'completed', 'declined')),
  assigned_to uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Site Settings (Platform Configuration)
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key varchar(100) UNIQUE NOT NULL,
  value text,
  type varchar(50) DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
  category varchar(100),
  description text,
  is_public boolean DEFAULT false,
  updated_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  subject varchar(255) NOT NULL,
  description text NOT NULL,
  priority varchar(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status varchar(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  category varchar(100),
  assigned_to uuid REFERENCES users(id),
  resolution text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  action varchar(100) NOT NULL,
  resource_type varchar(100),
  resource_id uuid,
  changes jsonb DEFAULT '{}'::jsonb,
  ip_address varchar(45),
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Certifications
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  site_id uuid REFERENCES sites(id) ON DELETE SET NULL,
  certification_type varchar(100) NOT NULL,
  certification_name varchar(255) NOT NULL,
  issuing_body varchar(255),
  level_rating varchar(50),
  issue_date date,
  expiry_date date,
  certificate_number varchar(255),
  status varchar(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'in_progress', 'suspended')),
  document_url varchar(500),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_data_imports_org ON data_imports(organization_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_org ON generated_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_report_sections_report ON report_sections(report_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_org ON support_tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_certifications_org ON certifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_certifications_site ON certifications(site_id);

-- Enable Row Level Security
ALTER TABLE data_collection_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_metric_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for data_collection_templates
CREATE POLICY "Users can view active templates"
  ON data_collection_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage templates"
  ON data_collection_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for data_imports
CREATE POLICY "Users can view imports in their organization"
  ON data_imports FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create imports for their organization"
  ON data_imports FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for generated_reports
CREATE POLICY "Users can view generated reports in their organization"
  ON generated_reports FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create generated reports for their organization"
  ON generated_reports FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for report_sections
CREATE POLICY "Users can view report sections in their organization"
  ON report_sections FOR SELECT
  TO authenticated
  USING (
    report_id IN (
      SELECT id FROM esg_reports 
      WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage report sections in their organization"
  ON report_sections FOR ALL
  TO authenticated
  USING (
    report_id IN (
      SELECT id FROM esg_reports 
      WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- RLS Policies for framework_metric_mappings
CREATE POLICY "Anyone can view active metric mappings"
  ON framework_metric_mappings FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for consultant_requests
CREATE POLICY "Anyone can create consultant requests"
  ON consultant_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view and manage consultant requests"
  ON consultant_requests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for site_settings
CREATE POLICY "Anyone can view public site settings"
  ON site_settings FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Super admins can manage all site settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- RLS Policies for support_tickets
CREATE POLICY "Users can view their own tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can create support tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage tickets"
  ON support_tickets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for audit_logs
CREATE POLICY "Super admins can view all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Admins can view audit logs for their organization"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for certifications
CREATE POLICY "Users can view certifications in their organization"
  ON certifications FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage certifications in their organization"
  ON certifications FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );
