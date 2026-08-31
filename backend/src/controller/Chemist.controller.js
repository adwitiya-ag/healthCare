import { Chemist } from "../models/chemist.model.js";
import { City } from "../models/city.model.js";
import { Area } from "../models/area.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateRefExists } from "../utils/validateRefExists.js";
import { generateChemistId } from "../utils/counterUtils.js";

// create a new chemist
const createChemist = asyncHandler(async (req, res) => {
  const { chemistName, chemistType, areaId, cityId } = req.body;

  // basic input validation
  if (!chemistName || !chemistName.trim() || !chemistType || !areaId || !cityId) {
    throw new ApiError(
      400,
      "chemistName, chemistType, areaId and cityId are all required"
    );
  }

  // chemistType must be one of the allowed enum values
  const allowedTypes = ["RETAIL", "WHOLESALE", "HOSPITAL", "ONLINE"];
  if (!allowedTypes.includes(chemistType)) {
    throw new ApiError(
      400,
      `chemistType must be one of: ${allowedTypes.join(", ")}`
    );
  }

  // validate foreign key IDs actually exist (and are active) in DB
  await validateRefExists(City, cityId, "City");
  await validateRefExists(Area, areaId, "Area");

  // check if this exact chemist entry already exists in DB
  const existingChemist = await Chemist.findOne({
    chemistName: chemistName.trim(),
    cityId,
    areaId,
    chemistType,
  });

  if (existingChemist) {
    throw new ApiError(409, "Chemist already exists");
  }

  const chemistId = await generateChemistId();

  // else insert into DB
  const chemist = await Chemist.create({
    chemistId: chemistId,
    chemistName: chemistName.trim(),
    cityId,
    areaId,
    chemistType,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, chemist, "Chemist added successfully"));
});

// fetch all chemists
const getChemists = asyncHandler(async (req, res) => {
  const { cityId, areaId, chemistType } = req.query;

  const filter = {};

  if (cityId) {
    await validateRefExists(City, cityId, "City");
    filter.cityId = cityId;
  }

  if (areaId) {
    await validateRefExists(Area, areaId, "Area");
    filter.areaId = areaId;
  }

  if (chemistType) {
    const allowedTypes = ["RETAIL", "WHOLESALE", "HOSPITAL", "ONLINE"];
    if (!allowedTypes.includes(chemistType)) {
      throw new ApiError(
        400,
        `chemistType must be one of: ${allowedTypes.join(", ")}`
      );
    }
    filter.chemistType = chemistType;
  }

  // only fetch active chemists matching the given filters
  filter.isActive = true;

  const chemists = await Chemist.find(filter)
    .populate("cityId", "cityName cityCode")
    .populate("areaId", "areaName areaCode")
    .sort({ chemistName: 1 });

  // if empty array is returned, respond that no chemist was found
  if (!chemists.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No such Chemist found"));
  }

  // else return the list to client
  return res
    .status(200)
    .json(new ApiResponse(200, chemists, "Chemists fetched successfully"));
});

// update a Chemist
const updateChemist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    chemistName,
    cityId,
    areaId,
    chemistType,
    isActive,
  } = req.body;

  // find the chemist which is wanted to be updated
  const chemist = await Chemist.findById(id);

  if (!chemist) {
    throw new ApiError(404, "Chemist not found");
  }

  // for every field that was actually sent, validate it (if it's a foreign key) and update the chemist object in memory
  if (chemistName && chemistName.trim()) {
    chemist.chemistName = chemistName.trim();
  }

  if (cityId) {
    await validateRefExists(City, cityId, "City");
    chemist.cityId = cityId;
  }

  if (areaId) {
    await validateRefExists(Area, areaId, "Area");
    chemist.areaId = areaId;
  }
  
 if(chemistType){
    chemist.chemistType = chemistType;
 }

  if (isActive !== undefined) {
    chemist.isActive = isActive;
  }

  // check the duplicates
  const duplicate = await Chemist.findOne({
    _id: { $ne: id }, // exclude the chemist we're currently updating
    chemistName: chemist.chemistName,
    cityId: chemist.cityId,
    areaId: chemist.areaId,
    chemistType: chemist.chemistType,
  });

  if (duplicate) {
    throw new ApiError(409, "Another chemist with these exact details already exists");
  }

  // Step 4: save the changes
  await chemist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, chemist, "Chemist updated successfully"));
});

// delete a chemist
const deleteChemist = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const chemist = await Chemist.findById(id);

  if (!chemist) {
    throw new ApiError(404, "Chemist not found");
  }

  chemist.isActive = false;
  await chemist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, chemist, "Chemist deactivated successfully"));
});

export { createChemist, getChemists, updateChemist, deleteChemist };