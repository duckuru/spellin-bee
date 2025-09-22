import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI);
    console.log("MONGODB Connected:", conn.connection.host);
  } catch (error) {
    console.log("Error Connection to MONGODB: ", error);
    process.exit(1); // 1 = fail, 0 = success
  }
};
