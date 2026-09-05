import { supabase } from "../config/supabase.js";
import { fail } from "../utils/http.js";
import { verifyToken } from "../services/token.service.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return fail(res, "Token de autenticacion requerido", 401);
  }

  try {
    const decoded = verifyToken(token);

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, full_name, role_id, is_active, roles (id, name)")
      .eq("id", decoded.sub)
      .maybeSingle();

    if (error || !user) {
      return fail(res, "Token invalido", 401);
    }

    if (!user.is_active) {
      return fail(res, "La cuenta esta desactivada", 403);
    }

    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role_id: user.role_id,
      role: user.roles?.name || null,
    };

    return next();
  } catch {
    return fail(res, "Token invalido o expirado", 401);
  }
}

export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
      return fail(res, "No tienes permisos para esta accion", 403);
    }
    return next();
  };
}

export async function allowFirstUserOrAdmin(req, res, next) {
  const { count, error } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true });

  if (error) {
    return fail(res, "No se pudo verificar usuarios existentes", 500, error.message);
  }

  if (count === 0) {
    return next();
  }

  return requireAuth(req, res, () => requireRoles("admin")(req, res, next));
}
