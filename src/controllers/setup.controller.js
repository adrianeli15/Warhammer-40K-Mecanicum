import { supabase } from "../config/supabase.js";
import { fail, ok } from "../utils/http.js";

export async function bootstrapInfo(_req, res) {
  const { count, error: countError } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true });

  if (countError) {
    return fail(res, "No se pudo consultar el estado inicial", 500, countError.message);
  }

  if (count > 0) {
    return fail(res, "El sistema ya tiene usuarios. Usa /api/auth/login", 403);
  }

  const { data: roles, error } = await supabase
    .from("roles")
    .select("id, name, description")
    .order("name", { ascending: true });

  if (error) {
    return fail(res, "No se pudieron listar los roles", 500, error.message);
  }

  return ok(res, {
    needs_bootstrap: true,
    roles,
  });
}
