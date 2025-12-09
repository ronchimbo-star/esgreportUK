/*
  # Add Report Sharing and Templates

  1. New Tables
    - `report_shares`
      - `id` (uuid, primary key)
      - `report_id` (uuid, references esg_reports)
      - `token` (uuid, unique)
      - `shared_by` (uuid, references users)
      - `access_type` (text) - 'view', 'comment'
      - `password` (text, nullable)
      - `expires_at` (timestamptz, nullable)
      - `view_count` (int)
      - `is_active` (bool)
      - `created_at` (timestamptz)
    
    - `report_templates`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text, nullable)
      - `framework` (text)
      - `structure` (jsonb) - sections, layout config
      - `is_default` (bool)
      - `is_public` (bool)
      - `created_by` (uuid, references users, nullable)
      - `organization_id` (uuid, references organizations, nullable)
      - `created_at` (timestamptz)
    
    - `report_exports`
      - `id` (uuid, primary key)
      - `report_id` (uuid, references esg_reports)
      - `export_format` (text) - 'pdf', 'html', 'docx'
      - `status` (text) - 'pending', 'processing', 'completed', 'failed'
      - `file_url` (text, nullable)
      - `file_size` (bigint, nullable)
      - `exported_by` (uuid, references users)
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz, nullable)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Report Shares
CREATE TABLE IF NOT EXISTS report_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES esg_reports(id) ON DELETE CASCADE NOT NULL,
  token uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  shared_by uuid REFERENCES users(id) ON DELETE SET NULL,
  access_type text NOT NULL DEFAULT 'view' CHECK (access_type IN ('view', 'comment')),
  password text,
  expires_at timestamptz,
  view_count int DEFAULT 0 NOT NULL,
  is_active bool DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE report_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shares for their organization reports"
  ON report_shares FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM esg_reports
      JOIN users ON users.organization_id = esg_reports.organization_id
      WHERE esg_reports.id = report_shares.report_id
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Users can create shares for their organization reports"
  ON report_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM esg_reports
      JOIN users ON users.organization_id = esg_reports.organization_id
      WHERE esg_reports.id = report_shares.report_id
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Users can update shares they created"
  ON report_shares FOR UPDATE
  TO authenticated
  USING (shared_by = auth.uid())
  WITH CHECK (shared_by = auth.uid());

CREATE POLICY "Users can delete shares they created"
  ON report_shares FOR DELETE
  TO authenticated
  USING (shared_by = auth.uid());

-- Report Templates
CREATE TABLE IF NOT EXISTS report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  framework text NOT NULL,
  structure jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_default bool DEFAULT false NOT NULL,
  is_public bool DEFAULT true NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public templates and their org templates"
  ON report_templates FOR SELECT
  TO authenticated
  USING (
    is_public = true OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = report_templates.organization_id
    )
  );

CREATE POLICY "Users can create templates in their organization"
  ON report_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = report_templates.organization_id
    )
  );

CREATE POLICY "Users can update templates they created"
  ON report_templates FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete templates they created"
  ON report_templates FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Report Exports
CREATE TABLE IF NOT EXISTS report_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES esg_reports(id) ON DELETE CASCADE NOT NULL,
  export_format text NOT NULL CHECK (export_format IN ('pdf', 'html', 'docx', 'csv')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  file_url text,
  file_size bigint,
  error_message text,
  exported_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz
);

ALTER TABLE report_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view exports for their organization reports"
  ON report_exports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM esg_reports
      JOIN users ON users.organization_id = esg_reports.organization_id
      WHERE esg_reports.id = report_exports.report_id
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Users can create exports for their organization reports"
  ON report_exports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM esg_reports
      JOIN users ON users.organization_id = esg_reports.organization_id
      WHERE esg_reports.id = report_exports.report_id
      AND users.id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_report_shares_report_id ON report_shares(report_id);
CREATE INDEX IF NOT EXISTS idx_report_shares_token ON report_shares(token);
CREATE INDEX IF NOT EXISTS idx_report_templates_framework ON report_templates(framework);
CREATE INDEX IF NOT EXISTS idx_report_templates_organization_id ON report_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_report_exports_report_id ON report_exports(report_id);

-- Insert default templates
INSERT INTO report_templates (name, description, framework, structure, is_default, is_public) VALUES
(
  'GRI Standard Report',
  'Comprehensive GRI Standards reporting template',
  'GRI',
  '[
    {"section": "Executive Summary", "order": 1, "required": true},
    {"section": "Organization Profile", "order": 2, "required": true},
    {"section": "Strategy & Governance", "order": 3, "required": true},
    {"section": "Material Topics", "order": 4, "required": true},
    {"section": "Economic Performance", "order": 5, "required": false},
    {"section": "Environmental Performance", "order": 6, "required": true},
    {"section": "Social Performance", "order": 7, "required": true},
    {"section": "GRI Content Index", "order": 8, "required": true}
  ]'::jsonb,
  true,
  true
),
(
  'TCFD Climate Report',
  'Task Force on Climate-related Financial Disclosures template',
  'TCFD',
  '[
    {"section": "Executive Summary", "order": 1, "required": true},
    {"section": "Governance", "order": 2, "required": true},
    {"section": "Strategy", "order": 3, "required": true},
    {"section": "Risk Management", "order": 4, "required": true},
    {"section": "Metrics and Targets", "order": 5, "required": true},
    {"section": "Scenario Analysis", "order": 6, "required": true}
  ]'::jsonb,
  true,
  true
),
(
  'SASB Industry Report',
  'Sustainability Accounting Standards Board template',
  'SASB',
  '[
    {"section": "Company Overview", "order": 1, "required": true},
    {"section": "Materiality Assessment", "order": 2, "required": true},
    {"section": "SASB Metrics", "order": 3, "required": true},
    {"section": "Industry Context", "order": 4, "required": false},
    {"section": "Forward-Looking Statements", "order": 5, "required": false}
  ]'::jsonb,
  true,
  true
);
