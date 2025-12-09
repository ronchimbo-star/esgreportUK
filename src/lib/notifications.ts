import { supabase } from './supabase';

export type EmailTemplate =
  | 'welcome'
  | 'invoice'
  | 'report_ready'
  | 'team_invite'
  | 'password_reset'
  | 'custom';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  template: EmailTemplate;
  data?: Record<string, any>;
  html?: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: options,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return false;
    }

    return data?.success || false;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  dashboardUrl: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'Welcome to ESG Report Platform!',
    template: 'welcome',
    data: {
      firstName,
      dashboardUrl,
    },
  });
}

export async function sendInvoiceEmail(
  email: string,
  customerName: string,
  invoiceNumber: string,
  amount: number,
  currency: string,
  dueDate: string,
  invoiceUrl: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `New Invoice - ${invoiceNumber}`,
    template: 'invoice',
    data: {
      customerName,
      invoiceNumber,
      amount,
      currency,
      dueDate,
      invoiceUrl,
    },
  });
}

export async function sendReportReadyEmail(
  email: string,
  userName: string,
  reportTitle: string,
  framework: string,
  period: string,
  score: number | null,
  reportUrl: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Your Report "${reportTitle}" is Ready`,
    template: 'report_ready',
    data: {
      userName,
      reportTitle,
      framework,
      period,
      score,
      reportUrl,
    },
  });
}

export async function sendTeamInviteEmail(
  email: string,
  inviterName: string,
  organizationName: string,
  role: string,
  inviteUrl: string,
  message?: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `You've been invited to join ${organizationName}`,
    template: 'team_invite',
    data: {
      inviterName,
      organizationName,
      role,
      inviteUrl,
      message,
    },
  });
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'Reset Your Password',
    template: 'password_reset',
    data: {
      resetUrl,
    },
  });
}

export async function sendCustomEmail(
  to: string | string[],
  subject: string,
  html: string,
  text: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject,
    template: 'custom',
    html,
    text,
  });
}

export interface CreateNotificationOptions {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export async function createNotification(
  options: CreateNotificationOptions
): Promise<boolean> {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: options.userId,
      title: options.title,
      message: options.message,
      type: options.type,
      action_url: options.actionUrl,
      related_entity_id: options.relatedEntityId,
      related_entity_type: options.relatedEntityType,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to create notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

export async function markAllNotificationsAsRead(
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}

export async function deleteNotification(
  notificationId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Failed to delete notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}

export async function getUserNotifications(
  userId: string,
  limit = 50
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}
