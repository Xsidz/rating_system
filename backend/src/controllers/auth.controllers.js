import bcrypt from "bcryptjs";
import { pool } from "../db/db.js";
import { generateToken } from "../lib/utils.js";

export const signup = async (req, res) => {
  const { fullName, email, password, address } = req.body;

  try {
    if (!fullName || !email || !password || !address) {
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
      [fullName, email, hashedPass, address]
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
    res.status(500).json({ message: error.message });
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
      fullName: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      created_at: user.created_at,
    });
  } catch (error) {
    console.log("Error in the Login controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
