import crypto from "crypto";
import { OTP } from "../models/otp.model.js";

export const generateAndSaveOTP = async (userId) => {
    const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    await OTP.create({ user: userId, otp, expiresAt });
    return otp;
};