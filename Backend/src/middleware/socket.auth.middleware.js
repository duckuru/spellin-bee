import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const socketAuthMiddleware = async(socket, next) =>{
  try {
    //extract token from http only
    const token = socket.handshake.headers.cookie
      ?.split("; ")
      .find((row) => row.startsWith("jwt"))
      ?.split("=")[1];

      if(!token){
        console.log("Socket connection rejected: No token provided");
        return next(new Error ("Unauthorized - No Token Provided"));
      }

      //verify the token
      const decode = jwt.verify(token, ENV.JWT_SECRET);
      if(!decode) {
        console.log("Socket connection rejected: Invalid token");
        return next(new Error("Unauthorized - Invalid token" ));
      }

      const user = await User.findById(decode.userId).select("-password");
      if(!user){
        console.log("Socket connection rejected: User not found");
        return next(new Error("User not found"));
      }

      // set user to the user and userId to userId of the database
      // attach user info to socket
      socket.user = user;
      socket.userId = user._id.toString()

      console.log(`Socket Authenticated for user:  ${user.username} (${user._id})`);

      next();

  } catch (error) {
    console.log("Error in socket authentication: ", error.message);
    next(new Error("Unauthorized- Authentication Failed"));
  }
}