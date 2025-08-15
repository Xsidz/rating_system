import bcrypt from "bcryptjs";
import { pool } from "../db/db.js";
import { generateToken } from "../lib/utils.js";

export const signup = async (req, res) => {
  const { name, email, password, address } = req.body;

  try {
    if (!name || !email || !password || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const [existingUser] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ message: "User already exists, please log in" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, 'user')",
      [name, email, hashedPass, address]
    );

    const [rows] = await pool.query(
      "SELECT id, name, email, address, role FROM users WHERE id = ?",
      [result.insertId]
    );

    const newUser = rows[0];

    generateToken(newUser.id, res);

    return res.status(200).json(newUser);
  } catch (error) {
    console.error("Error in the SignUp controller:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [row] = await pool.query(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);
    const user = row[0];
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    generateToken(user.id, res);
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      created_at: user.created_at,
    });
  } catch (error) {
    console.log("Error in the Login controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
    });

    return res.status(200).json({ message: "LoggedOut Successfully" });
  } catch (error) {
    console.log("Error in the log out controller : ", error.message);
    return res.status(500).json({ message: " Internal Server Error" });
  }
};

export const updatePassword = async (req, res) => {
  console.log("updatePassword route hit for user:", req.user?.id);
  const { currentPassword, newPassword } = req.body;
  try {
    const [row] = await pool.query(
      `SELECT password_hash FROM users where id = ?`,
      [req.user.id]
    );
    console.log("DB query done");

    if (row.length == 0) {
      return res.status(404).json({ message: "User not found!!" });
    }

    const user = row[0];
    const doPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );
    console.log("Password match result:", doPasswordMatch);

    if (!doPasswordMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const newHashed = await bcrypt.hash(newPassword, salt);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      newHashed,
      req.user.id,
    ]);
    console.log("Password updated in DB");

    res.clearCookie("jwt");
    console.log("Cookie cleared");

    return res
      .status(200)
      .json({ message: "Password updated successfully. Please log in again." });
  } catch (error) {
    console.log("Error in the Update Password :", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

