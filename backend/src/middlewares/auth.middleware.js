import jwt from "jsonwebtoken";
import { pool } from "../db/db.js";

export const requireAuth = (role) => {
  return async (req, res, next) => {
    console.log("requireAuth running...");
    const token = req.cookies.jwt;
    if (!token) {
      console.log("No token found");
      return res.status(401).json({ message: "Not logged in!" });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (role && decoded.role != role) {
        console.log("Role mismatch");
        return res.status(403).json({ message: "Forbidden" });
      }
      console.log(decoded)

      const [rows] = await pool.query(
        `SELECT id, name, email, address, role FROM users WHERE id = ?`,
        [decoded.userId]
      );
      if (rows.length === 0) {
        console.log("User not found in DB");
        return res.status(404).json({ message: "User not found" });
      }
      req.user = rows[0];
      console.log("Auth success for user:", req.user.id);
      next();
    } catch (error) {
      console.log("Error in requireAuth Middleware : ", error.message);
      return res.status(401).json({ message: "Invalid Token!" });
    }
  };
};
