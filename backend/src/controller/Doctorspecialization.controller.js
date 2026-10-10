import { DoctorSpecialization } from "../models/doctorSpecialization.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// create a new doctor specialization
const createDoctorSpecialization = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
        throw new ApiError(400, "Specialization name is required");
    }

    const normalizedName = name.trim().toUpperCase();

    const existing = await DoctorSpecialization.findOne({ name: normalizedName });
    if (existing) {
        throw new ApiError(409, "This specialization already exists");
    }

    const specialization = await DoctorSpecialization.create({
        name: normalizedName,
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                specialization,
                "Specialization created successfully"
            )
        );
});

// fetch all doctor specializations
const getDoctorSpecializations = asyncHandler(async (req, res) => {
    const { isActive } = req.query;

    const filter = {};
    if (isActive !== undefined) {
        filter.isActive = isActive === "true";
    }

    const specializations = await DoctorSpecialization.find(filter).sort({
        name: 1,
    });

    if (!specializations.length) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], "No specializations found"));
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                specializations,
                "Specializations fetched successfully"
            )
        );
});

// update a Specialization information
const updateDoctorSpecialization = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, isActive } = req.body;

    // find the specialization which is wanted to be updated
    const specialization = await DoctorSpecialization.findById(id);

    if (!specialization) {
        throw new ApiError(404, "Specialization is not found");
    }

    if (!specialization.isActive) {
        throw new ApiError(
            400,
            "Inactive specialization cannot be updated"
        );
    }

    // for every field that was actually sent, validate it (if it's a foreign key) and update the doctor object in memory
    if (name && name.trim()) {
        specialization.name = name.trim();
    }

    if (isActive !== undefined) {
        specialization.isActive = isActive;
    }

    //  check the duplicates 
    const duplicate = await DoctorSpecialization.findOne({
        _id: { $ne: id }, // exclude the specialization we're currently updating
        name: specialization.name,
    });

    if (duplicate) {
        throw new ApiError(409, "Another doctor with these exact details already exists");
    }

    // save the changes
    await specialization.save();

    return res
        .status(200)
        .json(new ApiResponse(200, specialization, "Specialization updated successfully"));
});


// delete a Specialization information

const deleteDoctorSpecialization = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const specialization = await DoctorSpecialization.findById(id);

    if (!specialization) {
        throw new ApiError(404, "Specialization is not found");
    }

    specialization.isActive = false;
    await specialization.save();

    return res.status(200).json(new ApiResponse(200, specialization, "Specialization deactivated successfully"));
});

// for toggle back means -> inactive to active and active to inactive
const toggleDoctorSpecialization = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const specialization = await DoctorSpecialization.findById(id);

    if (!specialization) {
        throw new ApiError(404, "Specialization is not found");
    }

    if (!specialization.isActive) {
        throw new ApiError(
            400,
            "Inactive specialization cannot be updated"
        );
    }

    specialization.isActive = !specialization.isActive;

    await specialization.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                specialization,
                specialization.isActive
                    ? "Specialization activated successfully"
                    : "Specialization deactivated successfully"
            )
        );
});


export { createDoctorSpecialization, getDoctorSpecializations, updateDoctorSpecialization, deleteDoctorSpecialization, toggleDoctorSpecialization };