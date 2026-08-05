import { DoctorSpecialization } from "../models/doctorSpecialization.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @route   POST /doctor-specialization
// @desc    Create a new doctor specialization (e.g. Ortho, ENT)
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

// @route   GET /doctor-specializations?isActive=
// @desc    Get all doctor specializations (for dropdown population)
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

export { createDoctorSpecialization, getDoctorSpecializations };