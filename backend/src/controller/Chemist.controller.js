import { Chemist } from "../models/chemist.model.js";
import { City } from "../models/city.model.js";
import { Area } from "../models/area.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateRefExists } from "../utils/validateRefExists.js";
import { generateChemistId } from "../utils/counterUtils.js";

// ------------------------------------------------------------------
// @route   POST /chemist
// @desc    Take input from frontend (chemistName, chemistType,
//          areaId, cityId) -> validate IDs from DB -> check if
//          entity already exists -> insert if not
// ------------------------------------------------------------------
const createChemist = asyncHandler(async (req, res) => {
  const { chemistName, chemistType, areaId, cityId } = req.body;

  // 1. basic input validation
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

  // 2. validate foreign key IDs actually exist (and are active) in DB
  await validateRefExists(City, cityId, "City");
  await validateRefExists(Area, areaId, "Area");

  // 3. check if this exact chemist entry already exists in DB
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

  // 4. else insert into DB
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

// ------------------------------------------------------------------
// @route   GET /chemists?cityId=&areaId=&chemistType=
// @desc    Receive params from frontend -> validate IDs from DB
//          -> fetch matching records only -> if empty, return
//          "No such Chemist found" -> else return the list to client
// ------------------------------------------------------------------
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

export { createChemist, getChemists };