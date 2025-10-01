import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.route.js";
import resultRoutes from "./routes/result.route.js"
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

// const app = express();
const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;

// app.use(express.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({origin:ENV.CLIENT_URL, credentials: true}))
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api", resultRoutes);


//make ready for deployment
if (ENV.NODE_ENV == "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}


server.listen(PORT, () => 
  console.log("Server running on port: " + PORT),
  connectDB()
);