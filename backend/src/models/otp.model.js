import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        email: {
            type: String
        },
        otp: {
            type: String,
            required: true
        },

        expiresAt: {
            type:  Date,
            required: true,
            index: {
                expires: 0
            }
        },
    },

    {
        timestamps: true
    }
);

export const OTP = mongoose.model("OTP", otpSchema);