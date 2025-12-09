export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'admin' | 'super_admin';
export type OrganizationSize = 'small' | 'medium' | 'large' | 'enterprise';
export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';
export type FrameworkDifficulty = 'low' | 'medium' | 'high' | 'very_high';
export type FrameworkStatus = 'available' | 'coming_soon';
export type ReportStatus = 'draft' | 'in_progress' | 'under_review' | 'completed' | 'published';
export type VerificationStatus = 'pending' | 'validated' | 'rejected';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          profile_image_url: string | null;
          role: UserRole;
          organization_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          profile_image_url?: string | null;
          role?: UserRole;
          organization_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          profile_image_url?: string | null;
          role?: UserRole;
          organization_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          industry: string | null;
          size: OrganizationSize | null;
          address: string | null;
          description: string | null;
          website: string | null;
          logo: string | null;
          subscription_tier: SubscriptionTier;
          subscription_status: SubscriptionStatus;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_expires_at: string | null;
          max_users: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          industry?: string | null;
          size?: OrganizationSize | null;
          address?: string | null;
          description?: string | null;
          website?: string | null;
          logo?: string | null;
          subscription_tier?: SubscriptionTier;
          subscription_status?: SubscriptionStatus;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_expires_at?: string | null;
          max_users?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          industry?: string | null;
          size?: OrganizationSize | null;
          address?: string | null;
          description?: string | null;
          website?: string | null;
          logo?: string | null;
          subscription_tier?: SubscriptionTier;
          subscription_status?: SubscriptionStatus;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_expires_at?: string | null;
          max_users?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      framework_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          color: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      frameworks: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category_id: string | null;
          description: string | null;
          difficulty: FrameworkDifficulty;
          estimated_weeks: string | null;
          key_features: string[];
          coverage_description: string | null;
          status: FrameworkStatus;
          requires_subscription: SubscriptionTier;
          icon: string | null;
          color_accent: string | null;
          metadata: Json;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category_id?: string | null;
          description?: string | null;
          difficulty?: FrameworkDifficulty;
          estimated_weeks?: string | null;
          key_features?: string[];
          coverage_description?: string | null;
          status?: FrameworkStatus;
          requires_subscription?: SubscriptionTier;
          icon?: string | null;
          color_accent?: string | null;
          metadata?: Json;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          category_id?: string | null;
          description?: string | null;
          difficulty?: FrameworkDifficulty;
          estimated_weeks?: string | null;
          key_features?: string[];
          coverage_description?: string | null;
          status?: FrameworkStatus;
          requires_subscription?: SubscriptionTier;
          icon?: string | null;
          color_accent?: string | null;
          metadata?: Json;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      framework_bundles: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          target_audience: string | null;
          framework_ids: string[];
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          target_audience?: string | null;
          framework_ids?: string[];
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          target_audience?: string | null;
          framework_ids?: string[];
          sort_order?: number;
          created_at?: string;
        };
      };
      esg_reports: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          description: string | null;
          reporting_period: string | null;
          start_date: string | null;
          end_date: string | null;
          status: ReportStatus;
          framework: string;
          overall_score: number | null;
          environmental_score: number | null;
          social_score: number | null;
          governance_score: number | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          description?: string | null;
          reporting_period?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: ReportStatus;
          framework: string;
          overall_score?: number | null;
          environmental_score?: number | null;
          social_score?: number | null;
          governance_score?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          title?: string;
          description?: string | null;
          reporting_period?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: ReportStatus;
          framework?: string;
          overall_score?: number | null;
          environmental_score?: number | null;
          social_score?: number | null;
          governance_score?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      esg_facts: {
        Row: {
          id: string;
          organization_id: string;
          site_id: string | null;
          framework_source: string | null;
          metric_code: string | null;
          metric_name: string;
          value: number | null;
          text_value: string | null;
          unit: string | null;
          year: number | null;
          reporting_period: string | null;
          data_source: string | null;
          validation_status: VerificationStatus;
          metadata: Json;
          entered_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          site_id?: string | null;
          framework_source?: string | null;
          metric_code?: string | null;
          metric_name: string;
          value?: number | null;
          text_value?: string | null;
          unit?: string | null;
          year?: number | null;
          reporting_period?: string | null;
          data_source?: string | null;
          validation_status?: VerificationStatus;
          metadata?: Json;
          entered_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          site_id?: string | null;
          framework_source?: string | null;
          metric_code?: string | null;
          metric_name?: string;
          value?: number | null;
          text_value?: string | null;
          unit?: string | null;
          year?: number | null;
          reporting_period?: string | null;
          data_source?: string | null;
          validation_status?: VerificationStatus;
          metadata?: Json;
          entered_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          report_id: string;
          parent_comment_id: string | null;
          author_id: string;
          content: string;
          mentions: string[];
          is_resolved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          parent_comment_id?: string | null;
          author_id: string;
          content: string;
          mentions?: string[];
          is_resolved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          parent_comment_id?: string | null;
          author_id?: string;
          content?: string;
          mentions?: string[];
          is_resolved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_conversations: {
        Row: {
          id: string;
          report_id: string;
          user_id: string;
          messages: Json;
          context: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          user_id: string;
          messages?: Json;
          context?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          user_id?: string;
          messages?: Json;
          context?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      organization_size: OrganizationSize;
      subscription_tier: SubscriptionTier;
      subscription_status: SubscriptionStatus;
      framework_difficulty_level: FrameworkDifficulty;
      framework_availability_status: FrameworkStatus;
      report_status: ReportStatus;
      verification_status: VerificationStatus;
    };
  };
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface FrameworkWithCategory extends Database['public']['Tables']['frameworks']['Row'] {
  category: Database['public']['Tables']['framework_categories']['Row'] | null;
}

export interface ReportWithDetails extends Database['public']['Tables']['esg_reports']['Row'] {
  organization: Database['public']['Tables']['organizations']['Row'];
  created_by_user: Database['public']['Tables']['users']['Row'] | null;
}
