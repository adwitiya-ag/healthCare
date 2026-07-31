import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";

// This is an Express middleware that:

// Checks if a user is authenticated using a JWT token
// Verifies the token
// Fetches the user from the database
// Attaches the user to req.user
// Allows request to continue if valid

export const verifyJWT = asyncHandler(async(req, res,next) => { //req, res, next are Express objects
   try {
    
    //step1 : Get token from cookie or authorization header
    // Authorization Header: Bearer afsiuaffhiuf343 (token)
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
 
    //token stores the JWT (JSON Web Token) sent by the client.

    if(!token){
        throw new ApiError(401, "Unauthorized request");
    }
 
     //Step 3: Verify token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
 
    const user = await User.findById(decodedToken?._id)
    .select("-password -refreshToken");
 
    if(!user){
        throw new ApiError(401, "Invalid Access Token")
    }

    if (!user.isActive) {
            throw new ApiError(
                403,
                "Your account has been deactivated. Please contact the administrator."
            )
    }
 

    //Step 6: Attach user to request object so any next middleware or route can easily access the logged-in user
    req.user = user;
    //Step 7: Continue request
    next();
 
   } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");    
   }

});


