import { supabase } from "../config/supabase.js";
import { fail, ok } from "../utils/http.js";

export async function listAuditLogs(req, res) {
  const limit = Math.min(Number(req.query.limit) || 50, 200);

  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, user_id, action, entity, entity_id, details, created_at, users (id, email, full_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return fail(res, "No se pudieron listar los logs", 500, error.message);
  }

  return ok(res, data);
}
