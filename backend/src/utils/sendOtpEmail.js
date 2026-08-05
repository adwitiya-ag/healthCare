import {Resend} from "resend";
import { ApiError } from "./ApiError.js";
import dotenv from "dotenv" ;

dotenv.config({ //configuring dotenv
    path: './.env'
})

console.log(process.env.RESEND_API_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOTPEmail(email, otp) {
    try{
    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Email Verification OTP",
        html: `
            <h2>Your OTP is</h2>
            <h1>${otp}</h1>
            <p>This OTP expires in 10 minutes.</p>
        `
        });
    }
    catch(error){
        throw new ApiError(500,"Error sending OTP Email");
    }
}

export default sendOTPEmail;