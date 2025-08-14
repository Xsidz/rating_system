import jwt, { decode } from "jsonwebtoken";
import { pool } from "../db/db.js";

export const requireAuth = (role) => {
  return (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "Not logged in!" });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (role && decoded != role) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const user = pool.query(`SELECT * FROM users WHERE id = ?`, [decoded.id]);

      req.user = user;
      next();
    } catch (error) {
      console.log("Error in requireAuth Middleware : ", error.message);
      return res.status(401).json({ message: "Invalid Token!" });
    }
  };
};
