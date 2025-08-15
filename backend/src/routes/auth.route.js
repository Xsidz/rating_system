import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { login, logout, signup, updatePassword } from "../controllers/auth.controllers.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.put("/update-password",requireAuth(), updatePassword);
router.post("/logout", logout);

export default router;
