import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyUser = asyncHandler(async (req, res, next) => {

    
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    // Check if the user's email/account is verified
    if (!req.user.isVerified) {
        throw new ApiError(
            403,
            "Please verify your account before accessing this resource."
        );
    }

    next();
});