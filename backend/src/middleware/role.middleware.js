import { ApiError } from "../utils/ApiError.js";

export const authorizeRoles = (...roles) => {

    return (req, res, next) => {

        // Make sure verifyJWT runs before this middleware
        if (!req.user) {
            throw new ApiError(401, "Unauthorized request");
        }

        // Check if user's role is allowed
        if (!roles.includes(req.user.role)) {
            throw new ApiError(
                403,
                "You are not authorized to access this resource."
            );
        }

        next();
    };

};