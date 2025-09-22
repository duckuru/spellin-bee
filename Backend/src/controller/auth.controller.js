import User from "../models/User.js";
import UserData from "../models/Userdata.js";
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const {username, email, password} = req.body
  
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
     return res.status(400).json({ message: "Password must be at least 6 characters" });
    } 

    //email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
      return res.status(400).json({ message: "Invalid Email format" });
    }

    const userEmail = await User.findOne({email});
    if(userEmail) return res.status(400).json({ message: "Email already exist" });
    const userUsername = await User.findOne({username});
    if (userUsername) return res.status(400).json({ message: "Username already exist" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    const newUserData = new UserData({
      userId: newUser._id, // link to User
      // rank, mmr, level will use defaults
    });

    await newUserData.save();

    if(newUser){
      generateToken(newUser._id, res)

      res.status(201).json({
        _id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        profilePic: newUser.profilePic,
        userData: {
          rank: newUserData.rank,
          mmr: newUserData.mmr,
          level: newUserData.level,
        },
      });

    }else{
      return res.status(400).json({ message: "Invalid User data" });
    }

  } catch (error) {
    console.log("Error in signup controller:", error);
    res.status(500).json({message: "Internal Server error"});
  }
};