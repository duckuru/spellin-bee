import UserData from "../models/Userdata.js";
import mongoose from "mongoose";

export const updateAdsOnPurchase = async (req,res) =>{
  const {userId} = req.body;
  if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    try {
      // Make sure userId is an ObjectId if stored as ObjectId in MongoDB
      const filter = { userId: new mongoose.Types.ObjectId(userId) };

      const updatedUserData = await UserData.findOneAndUpdate(
        filter,
        { hasAds: false },
        { new: true } // return the updated document
      );

      if (!updatedUserData) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log("Updated UserData:", updatedUserData);

      res.status(200).json({
        message: "Ads disabled successfully!",
        userData: updatedUserData,
      });
    } catch (error) {
      console.error("Error in Ads:", error);
      res.status(500).json({ message: "Internal server error" });
    }
}