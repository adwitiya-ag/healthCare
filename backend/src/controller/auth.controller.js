import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {Counter} from "../models/counter.model.js";
import {OTP} from "../models/otp.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { generateEmployeeId, generateRegNo } from "../utils/counterUtils.js";
import {generateAndSaveOTP} from "../utils/otpUtils.js";
import sendOTPEmail from "../utils/sendOtpEmail.js";



const generateAccessAndRefreshTokens = async(userId) => {
    try{
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
        
    }
    catch(error){
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}


const initiateVerification = asyncHandler(async (req,res) => {
    
        const {email} = req.body;

        if(!email){
            return new ApiError(400, "Email required");
        }

        const user = await User.findOne({email});

        if(!user){
            return res.status(404).json({success: false, message: "User does not exits"});
        }

        const otp = await generateAndSaveOTP(user._id);

        await sendOTPEmail(email, otp);

        return res
        .status(200)
        .json(
            new ApiResponse(
            200,
            {},
            "OTP sent successfully"
            )
    );        

});



const verifyOTP = asyncHandler(async (req, res) => {

    const { email, otp } = req.body;

    if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    //Verify OTP Against the User
    const savedOTP = await OTP.findOne({
        user: user._id
    });

    if (!savedOTP) {
        throw new ApiError(404, "OTP not found or expired");
    }

    //Verify OTP Against the User
    if (savedOTP.otp !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }

    //Check if OTP is Not Expired
    if (savedOTP.expiresAt < new Date()) {
        throw new ApiError(400, "OTP has expired");
    }

    //Change isVerified Flag to true
    user.isVerified = true;

    await user.save({
        validateBeforeSave: false
    });

    //Delete the OTP After Successful Verification
    await OTP.deleteOne({
        _id: savedOTP._id
    });

    return res.status(200).json(
        new ApiResponse(
        200,
        {},
        "Email verified successfully"
        )
    );

});


const registerUser = asyncHandler(async(req, res) => {
    //step1 : Get the data from req.body
    const {firstName, lastName, email, phoneNo, password, role, manager} = req.body;
    //Step 2: Validate required fields
    if(
        [firstName, lastName, email, phoneNo, password, role].some( (field) => field?.trim() === "" )
    )
    {
        throw new ApiError(400, "All fields are required");
    }
    //Step 3: Check if email or phone already exists
    const existedUser = await User.findOne({  email })
    
    if(existedUser){
        throw new ApiError(409, "User with email already exists");
    }

    //Step 4: Validate manager (only for MR)
    let managerId = null;
    if(role === "MR"){
        if(!manager){
            throw new ApiError(400, "Manager is required for MR");
        }

        if(!mongoose.Types.ObjectId.isValid(manager)){
            throw new ApiError(400, "Invalid manager ID");
        }

        const managerUser = await User.findById(manager);

        if(!managerUser){
            throw new ApiError(404, "Manager not found");
        }

        if(managerUser.role !== "MANAGER"){
            throw new ApiError(400, "Assigned user is not a manager");
        }

        if(!managerUser.isActive){
            throw new ApiError(400, "Assigned manager is inactive");
        }
    }

    //Step 5: Generate Employee ID
    const employeeId = await generateEmployeeId();

    //step6 : Generate Registration Number
    const regNo = await generateRegNo();

    //step7: create user
    const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        phoneNo,
        role,
        manager: managerId,
        employeeId,
        regNo
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }


    //step8: create and send otp 


    //step9: return success
    return res.status(201).json(new ApiResponse(200, createdUser, "User registered Successfully"));
})

const loginUser = asyncHandler(async (req, res) => {
    const{email, password, employeeId} = req.body;
    console.log(email);

    if(!email && !password && !employeeId ){
        throw new ApiError(400, "name or email is required");
    }

    const user = await User.findOne({ email });

    if(!user){
        throw new ApiError(404, "User does not exists");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorised request");
    }

    try{
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id);

        if(!user){
            throw new ApiError(401, "Invalid refresh token");
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    }
    catch(error){
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required");
    }

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));

})


const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})


const updateAccountDetails = asyncHandler(async(req, res) => {

    const{firstName, lastName, email} = req.body;

    
    if(!firstName || !lastName || !email){
        throw new ApiError(400, "All fields are required");
    }
    
    // If email already exists in DB, throw Error else allow
    const existingUser = await User.findOne({email});
    
    if(existingUser){
        throw new ApiError(400, "Different account already exists with this email");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                firstName,
                lastName,
                email: email
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"))
});


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    initiateVerification,
    verifyOTP
} 