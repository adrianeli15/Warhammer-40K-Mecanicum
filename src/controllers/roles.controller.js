import { supabase } from "../config/supabase.js";
import { fail, ok } from "../utils/http.js";
import { requireFields } from "../utils/user.js";
import { writeAuditLog } from "../services/audit.service.js";

export async function listRoles(_req, res) {
  const { data, error } = await supabase
    .from("roles")
    .select("id, name, description, created_at")
    .order("name", { ascending: true });

  if (error) {
    return fail(res, "No se pudieron listar los roles", 500, error.message);
  }

  return ok(res, data);
}

export async function createRole(req, res) {
  const missing = requireFields(req.body, ["name"]);
  if (missing.length) {
    return fail(res, "Debes enviar name", 400);
  }

  const { data, error } = await supabase
    .from("roles")
    .insert({
      name: String(req.body.name).trim().toLowerCase(),
      description: req.body.description ? String(req.body.description).trim() : null,
    })
    .select("id, name, description, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return fail(res, "El rol ya existe", 409);
    }
    return fail(res, "No se pudo crear el rol", 500, error.message);
  }

  await writeAuditLog({
    userId: req.user.id,
    action: "CREATE",
    entity: "roles",
    entityId: data.id,
    details: { name: data.name },
  });

  return ok(res, data, 201);
}

export async function updateRole(req, res) {
  const payload = {};
  if (req.body.name !== undefined) payload.name = String(req.body.name).trim().toLowerCase();
  if (req.body.description !== undefined) payload.description = String(req.body.description).trim();

  if (Object.keys(payload).length === 0) {
    return fail(res, "No hay campos para actualizar", 400);
  }

  const { data, error } = await supabase
    .from("roles")
    .update(payload)
    .eq("id", req.params.id)
    .select("id, name, description, created_at")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return fail(res, "El rol ya existe", 409);
    }
    return fail(res, "No se pudo actualizar el rol", 500, error.message);
  }

  if (!data) {
    return fail(res, "Rol no encontrado", 404);
  }

  await writeAuditLog({
    userId: req.user.id,
    action: "UPDATE",
    entity: "roles",
    entityId: data.id,
    details: payload,
  });

  return ok(res, data);
}

export async function deleteRole(req, res) {
  const { data, error } = await supabase
    .from("roles")
    .delete()
    .eq("id", req.params.id)
    .select("id, name")
    .maybeSingle();

  if (error) {
    if (error.code === "23503") {
      return fail(res, "No se puede eliminar un rol con usuarios asignados", 409);
    }
    return fail(res, "No se pudo eliminar el rol", 500, error.message);
  }

  if (!data) {
    return fail(res, "Rol no encontrado", 404);
  }

  await writeAuditLog({
    userId: req.user.id,
    action: "DELETE",
    entity: "roles",
    entityId: data.id,
    details: { name: data.name },
  });

  return ok(res, { id: data.id, message: "Rol eliminado" });
}
