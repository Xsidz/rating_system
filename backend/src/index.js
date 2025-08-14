import dotenv from "dotenv"
dotenv.config()
import express from "express"
import { initDB } from "./db/init-db.js";
import authRoutes from "./routes/auth.route.js"
import cookieParser from "cookie-parser"


const app = express()
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
const PORT = process.env.PORT || 3001;

app.listen(PORT, (req,res)=>{
    console.log("Server is running")
})

initDB();

app.use("/api/auth", authRoutes)

