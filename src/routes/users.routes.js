import { Router } from "express";
import {
  changePassword,
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
} from "../controllers/users.controller.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(asyncHandler(requireAuth));

router.get("/", requireRoles("admin", "supervisor"), asyncHandler(listUsers));
router.get("/:id", requireRoles("admin", "supervisor"), asyncHandler(getUser));
router.post("/", requireRoles("admin"), asyncHandler(createUser));
router.put("/:id", requireRoles("admin"), asyncHandler(updateUser));
router.patch("/:id/password", requireRoles("admin"), asyncHandler(changePassword));
router.delete("/:id", requireRoles("admin"), asyncHandler(deleteUser));

export default router;
