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

// create a new doctor
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

// fetch all doctors
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

// update a doctor
const updateDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    doctorName,
    cityId,
    areaId,
    qualificationId,
    specializationId,
    isActive,
  } = req.body;

  // find the doctor which is wanted to be updated
  const doctor = await Doctor.findById(id);

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  // for every field that was actually sent, validate it (if it's a foreign key) and update the doctor object in memory
  if (doctorName && doctorName.trim()) {
    doctor.doctorName = doctorName.trim();
  }

  if (cityId) {
    await validateRefExists(City, cityId, "City");
    doctor.cityId = cityId;
  }

  if (areaId) {
    await validateRefExists(Area, areaId, "Area");
    doctor.areaId = areaId;
  }

  if (qualificationId) {
    await validateRefExists(
      DoctorQualification,
      qualificationId,
      "Doctor Qualification"
    );
    doctor.qualificationId = qualificationId;
  }

  if (specializationId) {
    await validateRefExists(
      DoctorSpecialization,
      specializationId,
      "Doctor Specialization"
    );
    doctor.specializationId = specializationId;
  }

  if (isActive !== undefined) {
    doctor.isActive = isActive;
  }

  // check the duplicates
  const duplicate = await Doctor.findOne({
    _id: { $ne: id }, // exclude the doctor we're currently updating
    doctorName: doctor.doctorName,
    cityId: doctor.cityId,
    areaId: doctor.areaId,
    qualificationId: doctor.qualificationId,
    specializationId: doctor.specializationId,
  });

  if (duplicate) {
    throw new ApiError(409, "Another doctor with these exact details already exists");
  }

  // save the changes
  await doctor.save();

  return res
    .status(200)
    .json(new ApiResponse(200, doctor, "Doctor updated successfully"));
});

// delete a doctor
const deleteDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const doctor = await Doctor.findById(id);

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  doctor.isActive = false;
  await doctor.save();

  return res
    .status(200)
    .json(new ApiResponse(200, doctor, "Doctor deactivated successfully"));
});

export { createDoctor, getDoctors, updateDoctor, deleteDoctor };