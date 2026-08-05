import { Doctor } from "../models/doctor.model.js";
import { City } from "../models/city.model.js";
import { Area } from "../models/area.model.js";
import { DoctorQualification } from "../models/doctorQualification.model.js";
import { DoctorSpecialization } from "../models/doctorSpecialization.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateRefExists } from "../utils/validateRefExists.js";
import { generateDoctorId } from "../utils/counterUtils.js";

// ------------------------------------------------------------------
// @route   POST /doctor
// @desc    Take input from frontend (doctorName, qualificationId,
//          specializationId, areaId, cityId) -> validate IDs from DB
//          -> check if entity already exists -> insert if not
// ------------------------------------------------------------------
const createDoctor = asyncHandler(async (req, res) => {
  const { doctorName, qualificationId, specializationId, areaId, cityId } =
    req.body;

  // 1. basic input validation
  if (
    !doctorName ||
    !doctorName.trim() ||
    !qualificationId ||
    !specializationId ||
    !areaId ||
    !cityId
  ) {
    throw new ApiError(
      400,
      "doctorName, qualificationId, specializationId, areaId and cityId are all required"
    );
  }

  // 2. validate every foreign key ID actually exists (and is active) in DB
  await validateRefExists(City, cityId, "City");
  await validateRefExists(Area, areaId, "Area");
  await validateRefExists(
    DoctorQualification,
    qualificationId,
    "Doctor Qualification"
  );
  await validateRefExists(
    DoctorSpecialization,
    specializationId,
    "Doctor Specialization"
  );

  // 3. check if this exact doctor entry already exists in DB
  const existingDoctor = await Doctor.findOne({
    doctorName: doctorName.trim(),
    cityId,
    areaId,
    qualificationId,
    specializationId,
  });

  if (existingDoctor) {
    throw new ApiError(409, "Doctor already exists");
  }

  const doctorId = await generateDoctorId();

  // 4. else insert into DB
  const doctor = await Doctor.create({
    doctorId: doctorId,
    doctorName: doctorName.trim(),
    cityId,
    areaId,
    qualificationId,
    specializationId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, doctor, "Doctor added successfully"));
});

// ------------------------------------------------------------------
// @route   GET /doctors?cityId=&areaId=&specializationId=&qualificationId=
// @desc    Receive params from frontend -> validate IDs from DB
//          -> fetch matching records only -> if empty, return
//          "No such Doctor found" -> else return the list to client
// ------------------------------------------------------------------
const getDoctors = asyncHandler(async (req, res) => {
  const { cityId, areaId, qualificationId, specializationId } = req.query;

  const filter = {};

  // validate only the params that were actually sent, and build filter
  if (cityId) {
    await validateRefExists(City, cityId, "City");
    filter.cityId = cityId;
  }

  if (areaId) {
    await validateRefExists(Area, areaId, "Area");
    filter.areaId = areaId;
  }

  if (qualificationId) {
    await validateRefExists(
      DoctorQualification,
      qualificationId,
      "Doctor Qualification"
    );
    filter.qualificationId = qualificationId;
  }

  if (specializationId) {
    await validateRefExists(
      DoctorSpecialization,
      specializationId,
      "Doctor Specialization"
    );
    filter.specializationId = specializationId;
  }

  // only fetch active doctors matching the given filters
  filter.isActive = true;

  const doctors = await Doctor.find(filter)
    .populate("cityId", "cityName cityCode")
    .populate("areaId", "areaName areaCode")
    .populate("qualificationId", "name")
    .populate("specializationId", "name")
    .sort({ doctorName: 1 });

  // if empty object/array is returned, respond that no doctor was found
  if (!doctors.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No such Doctor found"));
  }

  // else return the list to client
  return res
    .status(200)
    .json(new ApiResponse(200, doctors, "Doctors fetched successfully"));
});

export { createDoctor, getDoctors };