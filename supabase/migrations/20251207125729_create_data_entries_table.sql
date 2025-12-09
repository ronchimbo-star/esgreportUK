/*
  # Create Data Entries Table

  1. Purpose
    - Store individual data points for ESG reports
    - Track metrics, values, and quality scores
    - Enable bulk import and data management
    
  2. New Table
    - `data_entries`
      - `id` (uuid, primary key)
      - `report_id` (uuid, foreign key to esg_reports)
      - `organization_id` (uuid, foreign key to organizations)
      - `metric_name` (text)
      - `value` (numeric)
      - `unit` (text)
      - `category` (text - Environmental, Social, Governance, Economic)
      - `quality_score` (numeric, 0-100)
      - `notes` (text, optional)
      - `data_source` (text, optional)
      - `verification_status` (text)
      - `created_by` (uuid, foreign key to users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  3. Security
    - Enable RLS
    - Users can only access data from their organization
*/

CREATE TABLE IF NOT EXISTS data_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES esg_reports(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  value numeric NOT NULL,
  unit text NOT NULL,
  category text DEFAULT 'General' CHECK (category IN ('Environmental', 'Social', 'Governance', 'Economic', 'General')),
  quality_score numeric CHECK (quality_score >= 0 AND quality_score <= 100),
  notes text,
  data_source text,
  verification_status text DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'audited')),
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE data_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view data from their organization
CREATE POLICY "Users can view own organization data"
  ON data_entries FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Users can insert data for their organization
CREATE POLICY "Users can insert data for own organization"
  ON data_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Users can update data for their organization
CREATE POLICY "Users can update own organization data"
  ON data_entries FOR UPDATE
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

-- Policy: Users can delete data for their organization
CREATE POLICY "Users can delete own organization data"
  ON data_entries FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_data_entries_report_id ON data_entries(report_id);
CREATE INDEX IF NOT EXISTS idx_data_entries_organization_id ON data_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_data_entries_category ON data_entries(category);
CREATE INDEX IF NOT EXISTS idx_data_entries_created_at ON data_entries(created_at DESC);
