import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT_URL || 3000;

app.use("/api/auth", authRoutes);

app.listen(PORT, () => console.log("Server running on port: " + PORT));