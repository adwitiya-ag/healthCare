import { SampleDistribution } from "../models/sampleDistribution.model.js";
import { Doctor } from "../models/doctor.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateRefExists } from "../utils/validateRefExists.js";

// Create a new sample distribution record
const createSampleDistribution = asyncHandler(async (req, res) => {
  // get the data sent from the frontend
  const { doctorId, productId, quantity } = req.body;

  // basic check — doctorId and productId must be given
  if (!doctorId || !productId) {
    throw new ApiError(400, "doctorId and productId are required");
  }

  // look up the doctor using their FRIENDLY code (e.g. "DOC0001")
  // instead of the long MongoDB _id — this is the extra lookup step
  const doctor = await Doctor.findOne({ doctorId: doctorId, isActive: true });

  if (!doctor) {
    throw new ApiError(400, "Invalid or inactive Doctor ID");
  }

  // make sure the product exists too (this one still uses
  // the normal MongoDB _id, since Product doesn't have a friendly code)
  await validateRefExists(Product, productId, "Product");

  // create the new entry
  // "doctor._id" is used here (the real MongoDB ObjectId)
  // when saving — NOT the friendly code — because that's what the
  // schema's "ref" system needs to work with .populate() later
  const sampleDistribution = await SampleDistribution.create({
    doctorId: doctor._id,
    productId,
    userId: req.user._id,
    quantity: quantity || 1,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        sampleDistribution,
        "Sample distribution recorded successfully"
      )
    );
});

// get all sample distributions, with optional filtering by doctorId, userId, or productId
const getSampleDistributions = asyncHandler(async (req, res) => {
  const { doctorId, userId, productId } = req.query;

  const filter = {};

  if (doctorId) {
    // same lookup trick: find the real _id behind the friendly code
    const doctor = await Doctor.findOne({ doctorId: doctorId, isActive: true });
    if (!doctor) {
      throw new ApiError(400, "Invalid or inactive Doctor ID");
    }
    filter.doctorId = doctor._id;
  }

  if (productId) {
    await validateRefExists(Product, productId, "Product");
    filter.productId = productId;
  }

  if (userId) {
    filter.userId = userId;
  }

  // .populate() now works normally, because internally we always
  // store the real MongoDB _id, not the friendly code
  const records = await SampleDistribution.find(filter)
    .populate("doctorId", "doctorId doctorName") // shows both the code AND the name
    .populate("productId", "productName")
    .populate("userId", "firstName lastName email")
    .sort({ dateGiven: -1 });

  if (!records.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No sample distribution records found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, records, "Sample distributions fetched successfully")
    );
});

export { createSampleDistribution, getSampleDistributions };