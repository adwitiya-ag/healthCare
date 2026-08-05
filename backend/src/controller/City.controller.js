import { City } from "../models/city.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateCityCode } from "../utils/counterUtils.js";

// @route   POST /city
// @desc    Create a new city
const createCity = asyncHandler(async (req, res) => {
  const { cityName } = req.body;

  if (!cityName || !cityName.trim()) {
    throw new ApiError(400, "City name is required");
  }

  const existing = await City.findOne({
    cityName: cityName.trim().toUpperCase(),
  });

  if (existing) {
    throw new ApiError(409, "City already exists");
  }

  const cityCode = await generateCityCode();

  const city = await City.create({
    cityName: cityName.trim().toUpperCase(),
    cityCode,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, city, "City created successfully"));
});

// @route   GET /cities
// @desc    Get all cities (optionally filter by name / active status)
const getCities = asyncHandler(async (req, res) => {
  const { cityName, isActive } = req.query;

  const filter = {};

  if (cityName) {
    filter.cityName = { $regex: cityName, $options: "i" };
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const cities = await City.find(filter).sort({ cityName: 1 });

  if (!cities.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No cities found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cities, "Cities fetched successfully"));
});

// @route   GET /city/:id
// @desc    Get a single city by ID
const getCityById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const city = await City.findById(id);

  if (!city) {
    throw new ApiError(404, "City not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, city, "City fetched successfully"));
});

// @route   PATCH /city/:id
// @desc    Update a city (name and/or active status)
const updateCity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { cityName, isActive } = req.body;

  const city = await City.findById(id);
  if (!city) {
    throw new ApiError(404, "City not found");
  }

  if (cityName && cityName.trim()) {
    const duplicate = await City.findOne({
      cityName: cityName.trim(),
      _id: { $ne: id },
    });
    if (duplicate) {
      throw new ApiError(409, "Another city with this name already exists");
    }
    city.cityName = cityName.trim();
  }

  if (isActive !== undefined) {
    city.isActive = isActive;
  }

  await city.save();

  return res
    .status(200)
    .json(new ApiResponse(200, city, "City updated successfully"));
});

// @route   DELETE /city/:id
// @desc    Soft-delete a city (sets isActive = false)
const deleteCity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const city = await City.findById(id);
  if (!city) {
    throw new ApiError(404, "City not found");
  }

  city.isActive = false;
  await city.save();

  return res
    .status(200)
    .json(new ApiResponse(200, city, "City deactivated successfully"));
});

export { createCity, getCities, getCityById, updateCity, deleteCity };