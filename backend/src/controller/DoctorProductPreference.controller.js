import {ProductPreference} from "../models/doctorProductPreference.model.js";
import {Doctor} from "../models/doctor.model.js";
import {Product} from "../models/product.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const getDoctorPreference = asyncHandler(async (req, res) => {
    // read doc id
    const { doctorId } = req.params;

    //find the doc
    // Doctor.findOne({_id: doctorId})
    const doctor = await Doctor.findById(doctorId);

    if(!doctor){
        throw new ApiError(404, "Doctor with this id not found");
    }

    //finding preferences
    const preferences = await ProductPreference.find({doctorId: doctor._id})
    .populate("productId")
    .sort({priority: 1}); //means sorting in ascending order

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                doctor,
                preferences
            },
            "Doctor product preferences fetched successfully"
        )
    );
});


const addDoctorPreference = asyncHandler(async (req, res) => {
    const { doctorId, productId, preferenceOrder } = req.body;

    if (!doctorId || !productId || !preferenceOrder){
        throw new ApiError(400, "All fields are required");
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const existingPreference = await ProductPreference.findOne({doctorId,productId});

    //Checking duplicate preference
    if (existingPreference) {
        throw new ApiError(409, "Preference already exists.");
    }

    //creating the preference
    const preference = await ProductPreference.create({
    doctorId,
    productId,
    preferenceOrder
    });

    return res
    .status(201)
    .json({success:true, message:"Doctor preference added successfully", data: preference});

});

const updateDoctorPreference = asyncHandler(async (req, res) => {

    const { preferenceId } = req.params;

    const { doctorId, productId, preferenceOrder } = req.body;

    if (!doctorId || !productId || !preferenceOrder) {
        throw new ApiError(400, "All fields are required");
    }

    const preference = await ProductPreference.findById(preferenceId);

    if (!preference) {
        throw new ApiError(404, "Preference not found");
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const existingPreference = await ProductPreference.findOne({
        doctorId,
        productId,
        _id: { $ne: preferenceId }        
    });

    if (existingPreference) {
        throw new ApiError(409, "Preference already exists");
    }

    const orderExists = await ProductPreference.findOne({
        doctorId,
        preferenceOrder,
        _id: { $ne: preferenceId }
    });


    if (orderExists) {
        throw new ApiError(409,"Preference order already exists for this doctor");
    }

    //updating
    const updatedPreference = await ProductPreference.findByIdAndUpdate(
    preferenceId,
    {
        doctorId,
        productId,
        preferenceOrder,
    },
    {
        new: true,
        runValidators: true,
    }
    );

    return res
    .status(200)
    .json(
    new ApiResponse(
        200,
        updatedPreference,
        "Preference updated successfully."
        )
    );

});


const deleteDoctorPreference = asyncHandler(async (req, res) => {

    const { preferenceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(preferenceId)) {
        throw new ApiError(400, "Invalid preference ID");
    }

    const preference = await ProductPreference.findById(preferenceId);

    if (!preference) {
        throw new ApiError(404, "Preference not found");
    }

    await ProductPreference.findByIdAndUpdate(
        preferenceId,
        {
            isActive: false
        },
        {
            new: true
        }
    );

    return res
    .status(200)
    .json(
    new ApiResponse(
        200,
        null,
        "Preference deleted successfully."
    ));
});


export {
    getDoctorPreference,
    addDoctorPreference,
    updateDoctorPreference,
    deleteDoctorPreference
}
