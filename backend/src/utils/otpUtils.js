import crypto from "crypto";
import { OTP } from "../models/otp.model.js";

export const generateAndSaveOTP = async (userId) => {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); //expires at 5 min

    await OTP.deleteMany({ user: userId });

    await OTP.create({
        user: userId,
        otp,
        expiresAt
    });

    return otp;
};

