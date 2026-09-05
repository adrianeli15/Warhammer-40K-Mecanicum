import { Router } from "express";
import { listAuditLogs } from "../controllers/audit.controller.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(asyncHandler(requireAuth), requireRoles("admin"));
router.get("/", asyncHandler(listAuditLogs));

export default router;
