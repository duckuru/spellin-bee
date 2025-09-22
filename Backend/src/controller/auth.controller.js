import User from "../models/User.js";
import UserData from "../models/Userdata.js";
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { formatUserResponse } from "../utils/userResponse.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { username, email, password } = req.body;

  // 🔹 Start a MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️⃣ Input validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // 2️⃣ Check for duplicates
    const userEmail = await User.findOne({ email }).session(session);
    if (userEmail)
      return res.status(400).json({ message: "Email already exists" });

    const userUsername = await User.findOne({ username }).session(session);
    if (userUsername)
      return res.status(400).json({ message: "Username already exists" });

    // 3️⃣ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4️⃣ Create User + UserData inside the same transaction
    const newUserArr = await User.create(
      [{ username, email, password: hashedPassword }],
      { session }
    );
    const userDoc = newUserArr[0];

    const newUserDataArr = await UserData.create([{ userId: userDoc._id }], {
      session,
    });
    const newUserData = newUserDataArr[0];

    
    // 5️⃣ If both succeed, commit transaction
    if (userDoc && newUserData) {
      await session.commitTransaction();
      session.endSession();
      
      // Generate JWT and set cookie
      generateToken(userDoc._id, res);
      const response = await formatUserResponse(userDoc);


      return res.status(200).json(response);
      // return res.status(200).json({
      //   _id: userDoc._id,
      //   username: userDoc.username,
      //   email: userDoc.email,
      //   profilePic: userDoc.profilePic,
      //   userData: {
      //     rank: newUserData.rank,
      //     mmr: newUserData.mmr,
      //     level: newUserData.level,
      //   },
      // });
    } else {
      throw new Error("User creation failed");
    }
  } catch (error) {
    // ❌ Rollback if anything fails
    await session.abortTransaction();
    session.endSession();

    console.error("Error in signup controller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const {email, password} = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  try{
    const user = await User.findOne({email})
    if(!user) return res.status(400).json({message: "Invalid Credentials"});

    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid Credentials" });

    generateToken(user._id, res)

    const response = await formatUserResponse(user);

    return res.status(200).json(response);

    // return res.status(200).json({
    //   _id: user._id,
    //   username: user.username,
    //   email: user.email,
    //   profilePic: user.profilePic,
    //   userData: {
    //     rank: userData?.rank,
    //     mmr: userData?.mmr,
    //     level: userData?.level,
    //   },
    // });

  }catch(error){
    console.log("Error in login controller:", error);
    res.status(500).json({message: "Internal server error"});
  }
}

export const logout = (_, res) => {
  res.cookie("jwt", "", {maxAge: 0});
  res.status(200).json({ message: "Logout Successfully" });
}

export const updateProfile = async () => {
  try {
    const {profilePic} = req.body;

    if(!profilePic) return res.status(400).json({message: "Profile Picutre is Require"});

    const userId = req.user._id;

    const uploadResponse = await cloudinary.uploader.upload(profilePic)

    const updatedUserProfile = await User.findByIdAndUpdate(userId, {profilePic:uploadResponse.secure_url}, {new: true});

    res.status(200).json(updatedUserProfile);

  } catch (error) {
    console.log("Error in update profile:", error)
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const checkAuth = async (req, res) => {
  try {
    // const userData = await UserData.findOne({ userId: req.user._id });

    const response = await formatUserResponse(req.user);
    res.status(200).json({
      response
    });
  } catch (error) {
    console.error("Error in /check:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}