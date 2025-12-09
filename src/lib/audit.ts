import { supabase } from './supabase';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'export'
  | 'share'
  | 'approve'
  | 'reject'
  | 'login'
  | 'logout'
  | 'permission_change';

export type EntityType =
  | 'report'
  | 'user'
  | 'organization'
  | 'data_entry'
  | 'invoice'
  | 'payment'
  | 'document'
  | 'framework'
  | 'news'
  | 'settings';

interface AuditLogEntry {
  action: AuditAction;
  entity_type: EntityType;
  entity_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('Attempted to log audit event without authenticated user');
      return;
    }

    const auditData = {
      user_id: user.id,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id || null,
      details: entry.details || {},
      ip_address: entry.ip_address || null,
      user_agent: entry.user_agent || navigator.userAgent,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('activity_logs')
      .insert(auditData);

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  } catch (error) {
    console.error('Error in audit logging:', error);
  }
}

export function createAuditLogger(entityType: EntityType) {
  return {
    logCreate: (entityId: string, details?: Record<string, any>) =>
      logAuditEvent({
        action: 'create',
        entity_type: entityType,
        entity_id: entityId,
        details,
      }),

    logUpdate: (entityId: string, details?: Record<string, any>) =>
      logAuditEvent({
        action: 'update',
        entity_type: entityType,
        entity_id: entityId,
        details,
      }),

    logDelete: (entityId: string, details?: Record<string, any>) =>
      logAuditEvent({
        action: 'delete',
        entity_type: entityType,
        entity_id: entityId,
        details,
      }),

    logView: (entityId: string, details?: Record<string, any>) =>
      logAuditEvent({
        action: 'view',
        entity_type: entityType,
        entity_id: entityId,
        details,
      }),

    logExport: (entityId: string, details?: Record<string, any>) =>
      logAuditEvent({
        action: 'export',
        entity_type: entityType,
        entity_id: entityId,
        details,
      }),

    logShare: (entityId: string, details?: Record<string, any>) =>
      logAuditEvent({
        action: 'share',
        entity_type: entityType,
        entity_id: entityId,
        details,
      }),
  };
}

export async function getAuditTrail(
  entityType: EntityType,
  entityId: string,
  limit = 50
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:users(email, first_name, last_name)
      `)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Failed to fetch audit trail:', error);
    return [];
  }
}

export async function getComplianceReport(
  startDate: string,
  endDate: string
): Promise<{
  totalActions: number;
  actionsByType: Record<string, number>;
  userActivity: Record<string, number>;
  entityActivity: Record<string, number>;
}> {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('action, entity_type, user_id')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;

    const logs = data || [];

    const actionsByType: Record<string, number> = {};
    const userActivity: Record<string, number> = {};
    const entityActivity: Record<string, number> = {};

    logs.forEach((log) => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
      userActivity[log.user_id] = (userActivity[log.user_id] || 0) + 1;
      entityActivity[log.entity_type] = (entityActivity[log.entity_type] || 0) + 1;
    });

    return {
      totalActions: logs.length,
      actionsByType,
      userActivity,
      entityActivity,
    };
  } catch (error) {
    console.error('Failed to generate compliance report:', error);
    return {
      totalActions: 0,
      actionsByType: {},
      userActivity: {},
      entityActivity: {},
    };
  }
}

export function withAuditLog<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  action: AuditAction,
  entityType: EntityType,
  getEntityId?: (...args: Parameters<T>) => string
): T {
  return (async (...args: Parameters<T>) => {
    const result = await fn(...args);

    const entityId = getEntityId ? getEntityId(...args) : undefined;

    await logAuditEvent({
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: { args },
    });

    return result;
  }) as T;
}
