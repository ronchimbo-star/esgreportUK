/*
  # Optimize RLS Policies Performance

  1. Performance Optimization
    - Wrap all `auth.uid()` and `auth.jwt()` calls in subqueries to prevent re-evaluation per row
    - This significantly improves query performance at scale
    - Pattern: Replace `auth.uid()` with `(select auth.uid())`

  2. Affected Tables
    - organizations (2 policies)
    - esg_reports (4 policies)
    - framework_templates (1 policy)
    - sites (2 policies)
    - esg_facts (2 policies)
    - support_tickets (3 policies)
    - news_posts (1 policy)
    - case_studies (1 policy)
    - contact_inquiries (1 policy)
    - data_collection_templates (1 policy)
    - data_imports (2 policies)
    - generated_reports (2 policies)
    - report_sections (2 policies)
    - consultant_requests (1 policy)
    - site_settings (1 policy)
    - audit_logs (2 policies)
    - certifications (2 policies)
    - comments (4 policies)
    - ai_conversations (3 policies)
    - report_shares (4 policies)
    - documents (3 policies)
    - team_invitations (3 policies)
    - report_templates (4 policies)
    - report_exports (2 policies)
    - notifications (3 policies)
    - activity_logs (2 policies)
    - user_preferences (3 policies)
    - data_entries (4 policies)
    - users (3 policies)
    - media_files (4 policies)
    - user_sessions (3 policies)
    - invoices (3 policies)
    - payments (1 policy)
    - custom_charges (2 policies)
    - subscription_history (1 policy)
    - payment_methods (2 policies)

  3. Security
    - All policies maintain the same security logic
    - Only the performance characteristics are improved
*/

-- Organizations
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
CREATE POLICY "Users can view their own organization"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

DROP POLICY IF EXISTS "Admins can update their organization" ON public.organizations;
CREATE POLICY "Admins can update their organization"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM public.users 
      WHERE id = (select auth.uid()) 
      AND role IN ('admin', 'super_admin')
    )
  );

-- ESG Reports
DROP POLICY IF EXISTS "Users can view reports in their organization" ON public.esg_reports;
CREATE POLICY "Users can view reports in their organization"
  ON public.esg_reports FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can create reports for their organization" ON public.esg_reports;
CREATE POLICY "Users can create reports for their organization"
  ON public.esg_reports FOR INSERT
  TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can update reports in their organization" ON public.esg_reports;
CREATE POLICY "Users can update reports in their organization"
  ON public.esg_reports FOR UPDATE
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can delete reports in their organization" ON public.esg_reports;
CREATE POLICY "Users can delete reports in their organization"
  ON public.esg_reports FOR DELETE
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

-- Framework Templates
DROP POLICY IF EXISTS "Super admins can manage framework templates" ON public.framework_templates;
CREATE POLICY "Super admins can manage framework templates"
  ON public.framework_templates FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role = 'super_admin'));

-- Sites
DROP POLICY IF EXISTS "Users can view sites in their organization" ON public.sites;
CREATE POLICY "Users can view sites in their organization"
  ON public.sites FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can manage sites in their organization" ON public.sites;
CREATE POLICY "Users can manage sites in their organization"
  ON public.sites FOR ALL
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

-- ESG Facts
DROP POLICY IF EXISTS "Users can view facts in their organization" ON public.esg_facts;
CREATE POLICY "Users can view facts in their organization"
  ON public.esg_facts FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can manage facts in their organization" ON public.esg_facts;
CREATE POLICY "Users can manage facts in their organization"
  ON public.esg_facts FOR ALL
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

-- Support Tickets
DROP POLICY IF EXISTS "Users can create support tickets" ON public.support_tickets;
CREATE POLICY "Users can create support tickets"
  ON public.support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
CREATE POLICY "Users can view their own tickets"
  ON public.support_tickets FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can manage tickets" ON public.support_tickets;
CREATE POLICY "Admins can manage tickets"
  ON public.support_tickets FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role IN ('admin', 'super_admin')));

-- News Posts
DROP POLICY IF EXISTS "Super admins can manage news posts" ON public.news_posts;
CREATE POLICY "Super admins can manage news posts"
  ON public.news_posts FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role = 'super_admin'));

-- Case Studies
DROP POLICY IF EXISTS "Super admins can manage case studies" ON public.case_studies;
CREATE POLICY "Super admins can manage case studies"
  ON public.case_studies FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role = 'super_admin'));

-- Contact Inquiries
DROP POLICY IF EXISTS "Admins can view and manage contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Admins can view and manage contact inquiries"
  ON public.contact_inquiries FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role IN ('admin', 'super_admin')));

-- Data Collection Templates
DROP POLICY IF EXISTS "Admins can manage templates" ON public.data_collection_templates;
CREATE POLICY "Admins can manage templates"
  ON public.data_collection_templates FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role IN ('admin', 'super_admin')));

-- Data Imports
DROP POLICY IF EXISTS "Users can view imports in their organization" ON public.data_imports;
CREATE POLICY "Users can view imports in their organization"
  ON public.data_imports FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can create imports for their organization" ON public.data_imports;
CREATE POLICY "Users can create imports for their organization"
  ON public.data_imports FOR INSERT
  TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

-- Generated Reports
DROP POLICY IF EXISTS "Users can view generated reports in their organization" ON public.generated_reports;
CREATE POLICY "Users can view generated reports in their organization"
  ON public.generated_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.esg_reports er
      WHERE er.id = generated_reports.report_id
      AND er.organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can create generated reports for their organization" ON public.generated_reports;
CREATE POLICY "Users can create generated reports for their organization"
  ON public.generated_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.esg_reports er
      WHERE er.id = generated_reports.report_id
      AND er.organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid()))
    )
  );

-- Report Sections
DROP POLICY IF EXISTS "Users can view report sections in their organization" ON public.report_sections;
CREATE POLICY "Users can view report sections in their organization"
  ON public.report_sections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.esg_reports er
      WHERE er.id = report_sections.report_id
      AND er.organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can manage report sections in their organization" ON public.report_sections;
CREATE POLICY "Users can manage report sections in their organization"
  ON public.report_sections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.esg_reports er
      WHERE er.id = report_sections.report_id
      AND er.organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid()))
    )
  );

-- Consultant Requests
DROP POLICY IF EXISTS "Admins can view and manage consultant requests" ON public.consultant_requests;
CREATE POLICY "Admins can view and manage consultant requests"
  ON public.consultant_requests FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role IN ('admin', 'super_admin')));

-- Site Settings
DROP POLICY IF EXISTS "Super admins can manage all site settings" ON public.site_settings;
CREATE POLICY "Super admins can manage all site settings"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role = 'super_admin'));

-- Audit Logs
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Super admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role = 'super_admin'));

DROP POLICY IF EXISTS "Admins can view audit logs for their organization" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs for their organization"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.users 
      WHERE id = (select auth.uid()) 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Certifications
DROP POLICY IF EXISTS "Users can view certifications in their organization" ON public.certifications;
CREATE POLICY "Users can view certifications in their organization"
  ON public.certifications FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can manage certifications in their organization" ON public.certifications;
CREATE POLICY "Users can manage certifications in their organization"
  ON public.certifications FOR ALL
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

-- Comments
DROP POLICY IF EXISTS "Users can view comments on their organization's reports" ON public.comments;
CREATE POLICY "Users can view comments on their organization's reports"
  ON public.comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.esg_reports er
      WHERE er.id = comments.report_id
      AND er.organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can create comments on their organization's reports" ON public.comments;
CREATE POLICY "Users can create comments on their organization's reports"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = (select auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.esg_reports er
      WHERE er.id = comments.report_id
      AND er.organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (author_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (author_id = (select auth.uid()));

-- AI Conversations
DROP POLICY IF EXISTS "Users can view their own AI conversations" ON public.ai_conversations;
CREATE POLICY "Users can view their own AI conversations"
  ON public.ai_conversations FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create AI conversations for their organization's repo" ON public.ai_conversations;
CREATE POLICY "Users can create AI conversations for their organization's repo"
  ON public.ai_conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (select auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.esg_reports er
      WHERE er.id = ai_conversations.report_id
      AND er.organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can update their own AI conversations" ON public.ai_conversations;
CREATE POLICY "Users can update their own AI conversations"
  ON public.ai_conversations FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Report Shares
DROP POLICY IF EXISTS "Users can view shares for their organization reports" ON public.report_shares;
CREATE POLICY "Users can view shares for their organization reports"
  ON public.report_shares FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.esg_reports er
      WHERE er.id = report_shares.report_id
      AND er.organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can create shares for their organization reports" ON public.report_shares;
CREATE POLICY "Users can create shares for their organization reports"
  ON public.report_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    shared_by = (select auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.esg_reports er
      WHERE er.id = report_shares.report_id
      AND er.organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can update shares they created" ON public.report_shares;
CREATE POLICY "Users can update shares they created"
  ON public.report_shares FOR UPDATE
  TO authenticated
  USING (shared_by = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete shares they created" ON public.report_shares;
CREATE POLICY "Users can delete shares they created"
  ON public.report_shares FOR DELETE
  TO authenticated
  USING (shared_by = (select auth.uid()));

-- Documents
DROP POLICY IF EXISTS "Users can view documents in their organization" ON public.documents;
CREATE POLICY "Users can view documents in their organization"
  ON public.documents FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can create documents in their organization" ON public.documents;
CREATE POLICY "Users can create documents in their organization"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = (select auth.uid()) AND
    organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid()))
  );

DROP POLICY IF EXISTS "Users can delete documents they uploaded" ON public.documents;
CREATE POLICY "Users can delete documents they uploaded"
  ON public.documents FOR DELETE
  TO authenticated
  USING (uploaded_by = (select auth.uid()));

-- Team Invitations
DROP POLICY IF EXISTS "Users can view invitations in their organization" ON public.team_invitations;
CREATE POLICY "Users can view invitations in their organization"
  ON public.team_invitations FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can create invitations in their organization" ON public.team_invitations;
CREATE POLICY "Users can create invitations in their organization"
  ON public.team_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    invited_by = (select auth.uid()) AND
    organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid()))
  );

DROP POLICY IF EXISTS "Users can update invitations in their organization" ON public.team_invitations;
CREATE POLICY "Users can update invitations in their organization"
  ON public.team_invitations FOR UPDATE
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

-- Report Templates
DROP POLICY IF EXISTS "Users can view public templates and their org templates" ON public.report_templates;
CREATE POLICY "Users can view public templates and their org templates"
  ON public.report_templates FOR SELECT
  TO authenticated
  USING (
    is_public = true OR
    organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid()))
  );

DROP POLICY IF EXISTS "Users can create templates in their organization" ON public.report_templates;
CREATE POLICY "Users can create templates in their organization"
  ON public.report_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = (select auth.uid()) AND
    organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid()))
  );

DROP POLICY IF EXISTS "Users can update templates they created" ON public.report_templates;
CREATE POLICY "Users can update templates they created"
  ON public.report_templates FOR UPDATE
  TO authenticated
  USING (created_by = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete templates they created" ON public.report_templates;
CREATE POLICY "Users can delete templates they created"
  ON public.report_templates FOR DELETE
  TO authenticated
  USING (created_by = (select auth.uid()));

-- Report Exports
DROP POLICY IF EXISTS "Users can view exports for their organization reports" ON public.report_exports;
CREATE POLICY "Users can view exports for their organization reports"
  ON public.report_exports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.esg_reports er
      WHERE er.id = report_exports.report_id
      AND er.organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can create exports for their organization reports" ON public.report_exports;
CREATE POLICY "Users can create exports for their organization reports"
  ON public.report_exports FOR INSERT
  TO authenticated
  WITH CHECK (
    exported_by = (select auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.esg_reports er
      WHERE er.id = report_exports.report_id
      AND er.organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid()))
    )
  );

-- Notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Activity Logs
DROP POLICY IF EXISTS "Users can view own organization activity logs" ON public.activity_logs;
CREATE POLICY "Users can view own organization activity logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_logs;
CREATE POLICY "System can insert activity logs"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- User Preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Data Entries
DROP POLICY IF EXISTS "Users can view own organization data" ON public.data_entries;
CREATE POLICY "Users can view own organization data"
  ON public.data_entries FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can insert data for own organization" ON public.data_entries;
CREATE POLICY "Users can insert data for own organization"
  ON public.data_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = (select auth.uid()) AND
    organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid()))
  );

DROP POLICY IF EXISTS "Users can update own organization data" ON public.data_entries;
CREATE POLICY "Users can update own organization data"
  ON public.data_entries FOR UPDATE
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can delete own organization data" ON public.data_entries;
CREATE POLICY "Users can delete own organization data"
  ON public.data_entries FOR DELETE
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

-- Users
DROP POLICY IF EXISTS "Users can insert their own record" ON public.users;
CREATE POLICY "Users can insert their own record"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own record" ON public.users;
CREATE POLICY "Users can view own record"
  ON public.users FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own record" ON public.users;
CREATE POLICY "Users can update own record"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()));

-- Media Files
DROP POLICY IF EXISTS "Authenticated users can view public media" ON public.media_files;
CREATE POLICY "Authenticated users can view public media"
  ON public.media_files FOR SELECT
  TO authenticated
  USING (is_public = true OR uploaded_by = (select auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can upload media" ON public.media_files;
CREATE POLICY "Authenticated users can upload media"
  ON public.media_files FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own media" ON public.media_files;
CREATE POLICY "Users can update their own media"
  ON public.media_files FOR UPDATE
  TO authenticated
  USING (uploaded_by = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own media" ON public.media_files;
CREATE POLICY "Users can delete their own media"
  ON public.media_files FOR DELETE
  TO authenticated
  USING (uploaded_by = (select auth.uid()));

-- User Sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
CREATE POLICY "Users can view own sessions"
  ON public.user_sessions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "System can insert sessions" ON public.user_sessions;
CREATE POLICY "System can insert sessions"
  ON public.user_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own sessions" ON public.user_sessions;
CREATE POLICY "Users can update own sessions"
  ON public.user_sessions FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Invoices
DROP POLICY IF EXISTS "Organizations can view their own invoices" ON public.invoices;
CREATE POLICY "Organizations can view their own invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

DROP POLICY IF EXISTS "Admins can insert invoices" ON public.invoices;
CREATE POLICY "Admins can insert invoices"
  ON public.invoices FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role IN ('admin', 'super_admin')));

DROP POLICY IF EXISTS "Admins can update invoices" ON public.invoices;
CREATE POLICY "Admins can update invoices"
  ON public.invoices FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role IN ('admin', 'super_admin')));

-- Payments
DROP POLICY IF EXISTS "Organizations can view their own payments" ON public.payments;
CREATE POLICY "Organizations can view their own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

-- Custom Charges
DROP POLICY IF EXISTS "Organizations can view their own custom charges" ON public.custom_charges;
CREATE POLICY "Organizations can view their own custom charges"
  ON public.custom_charges FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

DROP POLICY IF EXISTS "Admins can manage custom charges" ON public.custom_charges;
CREATE POLICY "Admins can manage custom charges"
  ON public.custom_charges FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role IN ('admin', 'super_admin')));

-- Subscription History
DROP POLICY IF EXISTS "Organizations can view their own subscription history" ON public.subscription_history;
CREATE POLICY "Organizations can view their own subscription history"
  ON public.subscription_history FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

-- Payment Methods
DROP POLICY IF EXISTS "Organizations can view their own payment methods" ON public.payment_methods;
CREATE POLICY "Organizations can view their own payment methods"
  ON public.payment_methods FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));

DROP POLICY IF EXISTS "Organizations can manage their own payment methods" ON public.payment_methods;
CREATE POLICY "Organizations can manage their own payment methods"
  ON public.payment_methods FOR ALL
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = (select auth.uid())));
