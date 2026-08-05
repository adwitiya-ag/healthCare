import { Router } from "express";

import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    initiateVerification,
    verifyOTP
} from "../controller/auth.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyUser } from "../middleware/verifyUser.middleware.js";

const router = Router();

router.route("/send-otp").post(initiateVerification);
router.route("/verify-otp").post(verifyOTP);
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

//secured routes
router.route("/logout")
.post(
    verifyJWT,
    logoutUser
);


router.route("/change-password")
.post(
    verifyJWT,
    verifyUser,
    changeCurrentPassword
);

router.route("/current-user")
.get(
    verifyJWT,
    verifyUser,
    getCurrentUser
);

router.route("/update-account")
.patch(
    verifyJWT,
    verifyUser,
    updateAccountDetails
);

export default router;