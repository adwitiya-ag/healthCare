import { Area } from "../models/area.model.js";
import { City } from "../models/city.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateRefExists } from "../utils/validateRefExists.js";
import { generateAreaCode } from "../utils/counterUtils.js";

// @route   POST /area
// @desc    Create a new area under a given city
const createArea = asyncHandler(async (req, res) => {
  const { areaName, cityId } = req.body;

  if (!areaName || !areaName.trim() || !cityId) {
    throw new ApiError(400, "areaName and cityId are required");
  }

  // validate that the city actually exists (and is active)
  await validateRefExists(City, cityId, "City");

  // check duplicate area within the same city
  const existing = await Area.findOne({
    areaName: areaName.trim(),
    cityId,
  });

  if (existing) {
    throw new ApiError(409, "Area already exists in this city");
  }

  const areaCode = await generateAreaCode();

  const area = await Area.create({
    areaName: areaName.trim(),
    cityId,
    areaCode,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, area, "Area created successfully"));
});

// @route   GET /areas?cityId=&isActive=
// @desc    Get areas, optionally filtered by city (for dropdown population)
const getAreas = asyncHandler(async (req, res) => {
  const { cityId, isActive } = req.query;

  const filter = {};

  if (cityId) {
    await validateRefExists(City, cityId, "City");
    filter.cityId = cityId;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const areas = await Area.find(filter)
    .populate("cityId", "cityName cityCode")
    .sort({ areaName: 1 });

  if (!areas.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No areas found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, areas, "Areas fetched successfully"));
});

// @route   GET /area/:id
// @desc    Get a single area by ID
const getAreaById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const area = await Area.findById(id).populate("cityId", "cityName cityCode");

  if (!area) {
    throw new ApiError(404, "Area not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, area, "Area fetched successfully"));
});

// @route   PATCH /area/:id
// @desc    Update an area's name, city, or active status
const updateArea = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { areaName, cityId, isActive } = req.body;

  const area = await Area.findById(id);
  if (!area) {
    throw new ApiError(404, "Area not found");
  }

  if (cityId) {
    await validateRefExists(City, cityId, "City");
    area.cityId = cityId;
  }

  if (areaName && areaName.trim()) {
    const duplicate = await Area.findOne({
      areaName: areaName.trim(),
      cityId: cityId || area.cityId,
      _id: { $ne: id },
    });
    if (duplicate) {
      throw new ApiError(409, "Another area with this name already exists in this city");
    }
    area.areaName = areaName.trim();
  }

  if (isActive !== undefined) {
    area.isActive = isActive;
  }

  await area.save();

  return res
    .status(200)
    .json(new ApiResponse(200, area, "Area updated successfully"));
});

// @route   DELETE /area/:id
// @desc    Soft-delete an area (sets isActive = false)
const deleteArea = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const area = await Area.findById(id);
  if (!area) {
    throw new ApiError(404, "Area not found");
  }

  area.isActive = false;
  await area.save();

  return res
    .status(200)
    .json(new ApiResponse(200, area, "Area deactivated successfully"));
});

export { createArea, getAreas, getAreaById, updateArea, deleteArea };