import { Router } from "express";
import { createRole, deleteRole, listRoles, updateRole } from "../controllers/roles.controller.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(asyncHandler(requireAuth));

router.get("/", requireRoles("admin", "supervisor"), asyncHandler(listRoles));
router.post("/", requireRoles("admin"), asyncHandler(createRole));
router.put("/:id", requireRoles("admin"), asyncHandler(updateRole));
router.delete("/:id", requireRoles("admin"), asyncHandler(deleteRole));

export default router;
