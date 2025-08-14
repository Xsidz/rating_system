import express from "express"
import { requireAuth } from "../middlewares/auth.middleware.js";
import { signup } from "../controllers/auth.controllers.js";
const router = express.Router();

router.post("/signup",signup)




export default router;