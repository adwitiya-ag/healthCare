//import {Resend} from "resend";
//import nodemailer from "nodemailer";

import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";
import dotenv from "dotenv" ;

dotenv.config({ //configuring dotenv
    path: './.env',
    quiet: true
})

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


const sendOTPEmail = async (email, otp) => {
    try{
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Email Verification OTP",
        text: `Your OTP is ${otp}. This OTP is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
}
catch(error){
    console.error("Email Error:", error);
    throw new ApiError(500,"Error sending OTP Email");
}
};

export default sendOTPEmail;


// const resend = new Resend(process.env.RESEND_API_KEY);

// async function sendOTPEmail(email, otp) {
//     try{
//     await resend.emails.send({
//         from: "onboarding@resend.dev",
//         to: email,
//         subject: "Email Verification OTP",
//         html: `
//             <h2>Your OTP is</h2>
//             <h1>${otp}</h1>
//             <p>This OTP expires in 10 minutes.</p>
//         `
//         });
//     }
//     catch(error){
//         throw new ApiError(500,"Error sending OTP Email");
//     }
// }

// export default sendOTPEmail;