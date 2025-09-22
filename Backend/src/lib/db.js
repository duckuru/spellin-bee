import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("MONGODB Connected:", conn.connection.host);
  } catch (error) {
    console.log("Error Connection to MONGODB: ", error);
    process.exit(1); // 1 = fail, 0 = success
  }
};
