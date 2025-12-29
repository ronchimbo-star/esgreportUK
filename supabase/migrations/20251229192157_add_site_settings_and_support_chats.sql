/*
  # Add Site Settings and Support Chats
  
  1. Purpose
    - Add default contact phone number to site_settings
    - Create support_chats table for live chat functionality
    
  2. New Tables
    - `support_chats`
      - `id` (uuid, primary key)
      - `visitor_name` (text)
      - `visitor_email` (text)
      - `messages` (jsonb array)
      - `status` (enum: new, in_progress, resolved, archived)
      - `assigned_to` (uuid, foreign key to users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  3. Site Settings
    - Insert default contact phone number
    
  4. Security
    - Enable RLS on support_chats table
    - Add policies for admins to manage chats
*/

-- Insert default contact phone number into site_settings
INSERT INTO site_settings (key, value, type, category, description, is_public)
VALUES (
  'contact_phone',
  '01892 336 315',
  'string',
  'contact',
  'Main contact phone number displayed sitewide',
  true
)
ON CONFLICT (key) DO NOTHING;

-- Create support_chats table for live chat
CREATE TABLE IF NOT EXISTS support_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name text,
  visitor_email text,
  messages jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_support_chats_status ON support_chats(status);
CREATE INDEX IF NOT EXISTS idx_support_chats_assigned_to ON support_chats(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_chats_created_at ON support_chats(created_at DESC);

-- Enable RLS
ALTER TABLE support_chats ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view and manage all support chats
CREATE POLICY "Admins can manage support chats"
  ON support_chats FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Policy: Anyone can insert new support chats (for anonymous visitors)
CREATE POLICY "Anyone can create support chat"
  ON support_chats FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_support_chats_updated_at ON support_chats;
CREATE TRIGGER update_support_chats_updated_at
  BEFORE UPDATE ON support_chats
  FOR EACH ROW
  EXECUTE FUNCTION update_support_chat_updated_at();

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Site settings and support chats tables created successfully';
  RAISE NOTICE 'Default contact phone number: 01892 336 315';
  RAISE NOTICE 'Support chats table ready for live chat functionality';
END $$;
