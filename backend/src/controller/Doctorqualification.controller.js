import { DoctorQualification } from "../models/doctorQualification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @route   POST /doctor-qualification
// @desc    Create a new doctor qualification (e.g. MBBS, MD)
const createDoctorQualification = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, "Qualification name is required");
  }

  const normalizedName = name.trim().toUpperCase();

  const existing = await DoctorQualification.findOne({ name: normalizedName });
  if (existing) {
    throw new ApiError(409, "This qualification already exists");
  }

  const qualification = await DoctorQualification.create({
    name: normalizedName,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, qualification, "Qualification created successfully")
    );
});

// @route   GET /doctor-qualifications?isActive=
// @desc    Get all doctor qualifications (for dropdown population)
const getDoctorQualifications = asyncHandler(async (req, res) => {
  const { isActive } = req.query;

  const filter = {};
  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const qualifications = await DoctorQualification.find(filter).sort({
    name: 1,
  });

  if (!qualifications.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No qualifications found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        qualifications,
        "Qualifications fetched successfully"
      )
    );
});

export { createDoctorQualification, getDoctorQualifications };