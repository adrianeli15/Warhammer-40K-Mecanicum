import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller.js";
import { bootstrapInfo } from "../controllers/setup.controller.js";
import { allowFirstUserOrAdmin, requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/bootstrap", asyncHandler(bootstrapInfo));
router.post("/register", asyncHandler(allowFirstUserOrAdmin), asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", asyncHandler(requireAuth), asyncHandler(me));

export default router;
