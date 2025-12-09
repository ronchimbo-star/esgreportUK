/*
  # Add Missing Foreign Key Indexes

  1. Performance Improvements
    - Add indexes on all foreign key columns that don't have covering indexes
    - Improves JOIN performance and query optimization
    - Prevents full table scans on foreign key lookups

  2. Indexes Added
    - certifications: created_by
    - comments: parent_comment_id
    - consultant_requests: assigned_to, organization_id
    - contact_inquiries: assigned_to
    - custom_charges: approved_by, billed_by, invoice_id
    - data_collection_templates: created_by
    - data_entries: created_by
    - data_imports: imported_by
    - documents: uploaded_by
    - esg_facts: entered_by
    - esg_reports: created_by
    - generated_reports: generated_by, report_id
    - invoices: created_by
    - media_files: organization_id
    - news_posts: author_id, featured_image_id
    - report_exports: exported_by
    - report_sections: created_by
    - report_shares: shared_by
    - report_templates: created_by
    - site_settings: updated_by
    - sites: created_by
    - subscription_history: changed_by
    - support_tickets: assigned_to
    - team_invitations: invited_by
    - users: banned_by

  3. Notes
    - Uses IF NOT EXISTS to safely add indexes without errors
    - All indexes use standard naming convention: idx_table_column
*/

CREATE INDEX IF NOT EXISTS idx_certifications_created_by ON certifications(created_by);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_consultant_requests_assigned_to ON consultant_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_consultant_requests_organization_id ON consultant_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_assigned_to ON contact_inquiries(assigned_to);
CREATE INDEX IF NOT EXISTS idx_custom_charges_approved_by ON custom_charges(approved_by);
CREATE INDEX IF NOT EXISTS idx_custom_charges_billed_by ON custom_charges(billed_by);
CREATE INDEX IF NOT EXISTS idx_custom_charges_invoice_id ON custom_charges(invoice_id);
CREATE INDEX IF NOT EXISTS idx_data_collection_templates_created_by ON data_collection_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_data_entries_created_by ON data_entries(created_by);
CREATE INDEX IF NOT EXISTS idx_data_imports_imported_by ON data_imports(imported_by);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_esg_facts_entered_by ON esg_facts(entered_by);
CREATE INDEX IF NOT EXISTS idx_esg_reports_created_by ON esg_reports(created_by);
CREATE INDEX IF NOT EXISTS idx_generated_reports_generated_by ON generated_reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_generated_reports_report_id ON generated_reports(report_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON invoices(created_by);
CREATE INDEX IF NOT EXISTS idx_media_files_organization_id ON media_files(organization_id);
CREATE INDEX IF NOT EXISTS idx_news_posts_author_id ON news_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_news_posts_featured_image_id ON news_posts(featured_image_id);
CREATE INDEX IF NOT EXISTS idx_report_exports_exported_by ON report_exports(exported_by);
CREATE INDEX IF NOT EXISTS idx_report_sections_created_by ON report_sections(created_by);
CREATE INDEX IF NOT EXISTS idx_report_shares_shared_by ON report_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_report_templates_created_by ON report_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_site_settings_updated_by ON site_settings(updated_by);
CREATE INDEX IF NOT EXISTS idx_sites_created_by ON sites(created_by);
CREATE INDEX IF NOT EXISTS idx_subscription_history_changed_by ON subscription_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_team_invitations_invited_by ON team_invitations(invited_by);
CREATE INDEX IF NOT EXISTS idx_users_banned_by ON users(banned_by);
