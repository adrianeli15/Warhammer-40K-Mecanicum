import { supabase } from "../config/supabase.js";
import { fail, ok } from "../utils/http.js";
import { requireFields, sanitizeUser } from "../utils/user.js";
import { comparePassword, hashPassword } from "../services/password.service.js";
import { signToken } from "../services/token.service.js";
import { writeAuditLog } from "../services/audit.service.js";

const USER_SELECT = "id, email, full_name, role_id, is_active, created_at, updated_at, roles (id, name, description)";

export async function register(req, res) {
  const missing = requireFields(req.body, ["email", "password", "full_name", "role_id"]);
  if (missing.length) {
    return fail(res, `Faltan campos: ${missing.join(", ")}`, 400);
  }

  const email = String(req.body.email).trim().toLowerCase();
  const password = String(req.body.password);
  const fullName = String(req.body.full_name).trim();

  if (password.length < 8) {
    return fail(res, "La contraseña debe tener al menos 8 caracteres", 400);
  }

  const passwordHash = await hashPassword(password);

  const { data, error } = await supabase
    .from("users")
    .insert({
      email,
      password_hash: passwordHash,
      full_name: fullName,
      role_id: req.body.role_id,
      is_active: true,
    })
    .select(USER_SELECT)
    .single();

  if (error) {
    if (error.code === "23505") {
      return fail(res, "El correo ya esta registrado", 409);
    }
    return fail(res, "No se pudo registrar el usuario", 500, error.message);
  }

  await writeAuditLog({
    userId: req.user?.id,
    action: "CREATE",
    entity: "users",
    entityId: data.id,
    details: { email: data.email },
  });

  return ok(res, sanitizeUser(data), 201);
}

export async function login(req, res) {
  const missing = requireFields(req.body, ["email", "password"]);
  if (missing.length) {
    return fail(res, `Faltan campos: ${missing.join(", ")}`, 400);
  }

  const email = String(req.body.email).trim().toLowerCase();
  const password = String(req.body.password);

  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, full_name, role_id, is_active, password_hash, roles (id, name)")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return fail(res, "Error al consultar el usuario", 500, error.message);
  }

  if (!user) {
    return fail(res, "Credenciales invalidas", 401);
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    return fail(res, "Credenciales invalidas", 401);
  }

  if (!user.is_active) {
    return fail(res, "La cuenta esta desactivada", 403);
  }

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.roles?.name || null,
  });

  await writeAuditLog({
    userId: user.id,
    action: "LOGIN",
    entity: "auth",
    entityId: user.id,
  });

  return ok(res, {
    token,
    user: sanitizeUser(user),
  });
}

export async function me(req, res) {
  const { data, error } = await supabase
    .from("users")
    .select(USER_SELECT)
    .eq("id", req.user.id)
    .single();

  if (error || !data) {
    return fail(res, "Usuario no encontrado", 404);
  }

  return ok(res, sanitizeUser(data));
}
