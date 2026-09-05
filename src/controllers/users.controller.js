import { supabase } from "../config/supabase.js";
import { fail, ok } from "../utils/http.js";
import { isValidEmail, requireFields, sanitizeUser } from "../utils/user.js";
import { hashPassword } from "../services/password.service.js";
import { writeAuditLog } from "../services/audit.service.js";

const USER_SELECT = "id, email, full_name, role_id, is_active, created_at, updated_at, roles (id, name, description)";

export async function listUsers(req, res) {
  const { data, error } = await supabase
    .from("users")
    .select(USER_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    return fail(res, "No se pudieron listar los usuarios", 500, error.message);
  }

  return ok(res, data.map(sanitizeUser));
}

export async function getUser(req, res) {
  const { data, error } = await supabase
    .from("users")
    .select(USER_SELECT)
    .eq("id", req.params.id)
    .maybeSingle();

  if (error) {
    return fail(res, "Error al consultar el usuario", 500, error.message);
  }

  if (!data) {
    return fail(res, "Usuario no encontrado", 404);
  }

  return ok(res, sanitizeUser(data));
}

export async function createUser(req, res) {
  const missing = requireFields(req.body, ["email", "password", "full_name", "role_id"]);
  if (missing.length) {
    return fail(res, `Faltan campos: ${missing.join(", ")}`, 400);
  }

  const email = String(req.body.email).trim().toLowerCase();
  if (!isValidEmail(email)) {
    return fail(res, "El correo no es valido", 400);
  }

  const password = String(req.body.password);
  if (password.length < 8) {
    return fail(res, "La contraseña debe tener al menos 8 caracteres", 400);
  }

  const passwordHash = await hashPassword(password);

  const { data, error } = await supabase
    .from("users")
    .insert({
      email,
      password_hash: passwordHash,
      full_name: String(req.body.full_name).trim(),
      role_id: req.body.role_id,
      is_active: req.body.is_active !== false,
    })
    .select(USER_SELECT)
    .single();

  if (error) {
    if (error.code === "23505") {
      return fail(res, "El correo ya esta registrado", 409);
    }
    return fail(res, "No se pudo crear el usuario", 500, error.message);
  }

  await writeAuditLog({
    userId: req.user.id,
    action: "CREATE",
    entity: "users",
    entityId: data.id,
    details: { email: data.email },
  });

  return ok(res, sanitizeUser(data), 201);
}

export async function updateUser(req, res) {
  const payload = {};
  if (req.body.full_name !== undefined) payload.full_name = String(req.body.full_name).trim();
  if (req.body.email !== undefined) {
    const email = String(req.body.email).trim().toLowerCase();
    if (!isValidEmail(email)) {
      return fail(res, "El correo no es valido", 400);
    }
    payload.email = email;
  }
  if (req.body.role_id !== undefined) payload.role_id = req.body.role_id;
  if (req.body.is_active !== undefined) payload.is_active = Boolean(req.body.is_active);

  if (Object.keys(payload).length === 0) {
    return fail(res, "No hay campos para actualizar", 400);
  }

  const { data, error } = await supabase
    .from("users")
    .update(payload)
    .eq("id", req.params.id)
    .select(USER_SELECT)
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return fail(res, "El correo ya esta registrado", 409);
    }
    return fail(res, "No se pudo actualizar el usuario", 500, error.message);
  }

  if (!data) {
    return fail(res, "Usuario no encontrado", 404);
  }

  await writeAuditLog({
    userId: req.user.id,
    action: "UPDATE",
    entity: "users",
    entityId: data.id,
    details: payload,
  });

  return ok(res, sanitizeUser(data));
}

export async function changePassword(req, res) {
  const missing = requireFields(req.body, ["password"]);
  if (missing.length) {
    return fail(res, "Debes enviar password", 400);
  }

  const password = String(req.body.password);
  if (password.length < 8) {
    return fail(res, "La contraseña debe tener al menos 8 caracteres", 400);
  }

  const passwordHash = await hashPassword(password);

  const { data, error } = await supabase
    .from("users")
    .update({ password_hash: passwordHash })
    .eq("id", req.params.id)
    .select("id, email")
    .maybeSingle();

  if (error) {
    return fail(res, "No se pudo cambiar la contraseña", 500, error.message);
  }

  if (!data) {
    return fail(res, "Usuario no encontrado", 404);
  }

  await writeAuditLog({
    userId: req.user.id,
    action: "PASSWORD_CHANGE",
    entity: "users",
    entityId: data.id,
  });

  return ok(res, { id: data.id, message: "Contraseña actualizada" });
}

export async function deleteUser(req, res) {
  if (req.user.id === req.params.id) {
    return fail(res, "No puedes eliminar tu propia cuenta", 400);
  }

  const { data, error } = await supabase
    .from("users")
    .delete()
    .eq("id", req.params.id)
    .select("id, email")
    .maybeSingle();

  if (error) {
    return fail(res, "No se pudo eliminar el usuario", 500, error.message);
  }

  if (!data) {
    return fail(res, "Usuario no encontrado", 404);
  }

  await writeAuditLog({
    userId: req.user.id,
    action: "DELETE",
    entity: "users",
    entityId: data.id,
    details: { email: data.email },
  });

  return ok(res, { id: data.id, message: "Usuario eliminado" });
}
