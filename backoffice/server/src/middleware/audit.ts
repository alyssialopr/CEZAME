import { supabaseAdmin } from '../config/supabase.js';

export interface AuditLogPayload {
  adminId?: string;
  adminEmail?: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: Record<string, any>;
}

export async function logAudit(payload: AuditLogPayload) {
  try {
    await supabaseAdmin.from('audit_logs').insert({
      admin_id: payload.adminId,
      admin_email: payload.adminEmail,
      action: payload.action,
      target_type: payload.targetType,
      target_id: payload.targetId,
      details: payload.details || {},
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}
