import { DoctorQualification } from "../models/doctorQualification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// create a new doctor qualification
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

// fetch all doctor qualifications
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


// update a qualification information
const updateDoctorQualification = asyncHandler(async (req, res) =>{
  const { id } = req.params;
  const { name, isActive} = req.body;
  
  // find the doctor which is wanted to be updated
  const qualification = await DoctorQualification.findById(id);

  if(!qualification){
    throw new ApiError(404, "Qualification is not found");
  }

  if (!qualification.isActive) {
  throw new ApiError(
    400,
    "Inactive qualification cannot be updated"
  );
  }

  // for every field that was actually sent, validate it (if it's a foreign key) and update the doctor object in memory
  if(name && name.trim()){
     qualification.name = name.trim();
  }
 
  if (isActive !== undefined) {
    qualification.isActive = isActive;
  }

  //  check the duplicates
  const duplicate = await DoctorQualification.findOne({
    _id: { $ne: id }, // exclude the qualification we're currently updating
    name: qualification.name,
  });
 
  if (duplicate) {
    throw new ApiError(409, "Another doctor with these exact details already exists");
  }
 
  // save the changes
  await qualification.save();
 
  return res
    .status(200)
    .json(new ApiResponse(200, qualification, "Qualification updated successfully"));
} );


// delete a qualification information

const deleteDoctorQualification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const qualification = await DoctorQualification.findById(id);

  if(!qualification){
    throw new ApiError(404, "Qualification is not found");
  }

  qualification.isActive = false;
  await qualification.save();

  return res.status(200).json(new ApiResponse(200, qualification, "Qualification deactivated successfully"));
});

// for toggle back means -> inactive to active and active to inactive
const toggleDoctorQualification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const qualification = await DoctorQualification.findById(id);

  if (!qualification) {
    throw new ApiError(404, "Qualification is not found");
  }

  // for switching active to inactive and vice versa
  qualification.isActive = !qualification.isActive;

  await qualification.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        qualification,
        qualification.isActive
          ? "Qualification activated successfully"
          : "Qualification deactivated successfully"
      )
    );
});


export { createDoctorQualification, getDoctorQualifications, updateDoctorQualification, deleteDoctorQualification,toggleDoctorQualification };