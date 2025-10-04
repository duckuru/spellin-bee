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

const PORT = ENV.PORT;

// app.use(express.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({origin:ENV.CLIENT_URL, credentials: true}))
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api", resultRoutes);


const frontendPath = path.resolve("Frontend/dist"); // relative to project root

if (ENV.NODE_ENV === "production") {
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}




server.listen(PORT, async () => {
  console.log("Server running on port:", PORT);
  try {
    await connectDB();
  } catch (err) {
    console.error("Failed to connect DB:", err);
    process.exit(1); // stops server if DB fails
  }
});
