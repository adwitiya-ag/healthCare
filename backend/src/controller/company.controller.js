import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { Company } from "../models/company.model.js";
import mongoose from "mongoose";


const addCompany = asyncHandler(async (req, res) => {

    const { companyName, email, phoneNumber } = req.body;

    if (!companyName || !email || !phoneNumber) {
        throw new ApiError(400,"Company name, email and phone number are required");
    }

    // Check if company already exists
    const existingCompany = await Company.findOne({
        $or: [
            { companyName },
            { email }
        ]
    });

    if (existingCompany) {
        throw new ApiError(409,"Company with this name or email already exists");
    }

    const company = await Company.create({
        companyName,
        email,
        phoneNumber,
    });

    return res
        .status(201)
        .json(new ApiResponse(201,company,"Company added successfully"));

});


const getAllCompany = asyncHandler(async (req, res) => {

    const companies = await Company.find().sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200,companies,"Companies fetched successfully"));

});


const getCompanyById = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400,"Invalid company ID");
    }

    const company = await Company.findById(id);

    if (!company) {
        throw new ApiError(404,"Company not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200,company,"Company fetched successfully"));

});


const updateCompany = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const {companyName,email,phoneNumber,isActive} = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400,"Invalid company ID");
    }

    if (!companyName || !email || !phoneNumber) {
        throw new ApiError(400,"Company name, email and phone number are required");
    }

    const company = await Company.findByIdAndUpdate(
        id,
        {
            $set: {
                companyName,
                email,
                phoneNumber,
                isActive
            }
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!company) {
        throw new ApiError(404,"Company not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200,company,"Company updated successfully"));

});


const deleteCompany = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400,"Invalid company ID");
    }

    // Soft delete
    const company = await Company.findByIdAndUpdate(
        id,
        {
            $set: {
                isActive: false
            }
        },
        {
            new: true
        }
    );

    if (!company) {
        throw new ApiError(404,"Company not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200,company,"Company deleted successfully"));
});


export {
    getAllCompany,
    getCompanyById,
    addCompany,
    updateCompany,
    deleteCompany
};



