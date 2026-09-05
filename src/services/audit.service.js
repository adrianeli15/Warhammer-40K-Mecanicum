import { supabase } from "../config/supabase.js";

export async function writeAuditLog({ userId, action, entity, entityId, details }) {
  const { error } = await supabase.from("audit_logs").insert({
    user_id: userId || null,
    action,
    entity,
    entity_id: entityId ? String(entityId) : null,
    details: details || null,
  });

  if (error) {
    console.error("No se pudo guardar audit_log:", error.message);
  }
}
