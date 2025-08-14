import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  address VARCHAR(400),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','USER','OWNER') NOT NULL DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (CHAR_LENGTH(name) BETWEEN 20 AND 60),
  CHECK (CHAR_LENGTH(address) <= 400)
);

`;

export const initDB = async () => {
  try {
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log("✅ Database checked/created");
    await connection.end();

  
    const dbWithSchema = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });
    await dbWithSchema.query(schema);
    console.log("✅ Tables checked/created");
    await dbWithSchema.end();

  } catch (error) {
    console.error("❌ Error creating tables:", error);
  }
};
