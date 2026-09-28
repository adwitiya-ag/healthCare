import { v2 as cloudinary } from "cloudinary";
import { TourPlan } from "../models/Tourplan.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

// add tourplan
const uploadTourPlan = asyncHandler(async (req, res) => {
  // multer already processed the file and saved it locally
  // req.file.path tells us where the file is stored temporarily.
  if (!req.file) {
    throw new ApiError(400, "No excel file uploaded");
  }

  // upload that local file to Cloudinary
  const cloudinaryResponse = await uploadOnCloudinary(req.file.path);

  if (!cloudinaryResponse) {
    throw new ApiError(500, "Failed to upload file to Cloudinary");
  }

  // if this salesperson already has an active tour plan mark it inactive first (keep as history, don't delete)
  await TourPlan.updateMany(
    { salespersonId: req.user._id, isActive: true },
    { $set: { isActive: false } }
  );

  // save the Cloudinary URL + details in the database
  const tourPlan = await TourPlan.create({
    salespersonId: req.user._id,
    originalFileName: req.file.originalname,
    fileUrl: cloudinaryResponse.secure_url,
    cloudinaryPublicId: cloudinaryResponse.public_id,
    isActive: true,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, tourPlan, "Tour plan uploaded successfully"));
});

// Give the client the Cloudinary link to download the currently active tour plan excel file.
const exportTourPlan = asyncHandler(async (req, res) => {
  // Step 1: find this salesperson's current active tour plan record
  const tourPlan = await TourPlan.findOne({
    salespersonId: req.user._id,
    isActive: true,
  });

  if (!tourPlan) {
    throw new ApiError(404, "No tour plan found to export");
  }

  // simplest approach — just redirect the browser/Postman
  // straight to the Cloudinary file URL. Cloudinary serves the file
  // directly, so this triggers a download.
  return res.redirect(tourPlan.fileUrl);
});


// Get all tour plans (history) uploaded by the logged-in salesperson,
// newest first.
const getAllTourPlans = asyncHandler(async (req, res) => {

  //temporary 
  console.log("Logged in user:", req.user._id, req.user.role);
  
  let filter;

  if (req.user.role === "MANAGER") {
    // find all MRs reporting to this manager, then get their tour plans
    const teamMembers = await User.find({ manager: req.user._id }).select("_id");
    console.log("Team members found:", teamMembers); // ← temporary debug log
    const teamMemberIds = teamMembers.map((u) => u._id);
    console.log("Team member IDs:", teamMemberIds); // ← temporary debug log
    filter = { salespersonId: { $in: teamMemberIds } };
  } else if (req.user.role === "ADMIN") {
    // admin sees everyone's tour plans
    filter = {};
  } else {
    // MR sees only their own
    filter = { salespersonId: req.user._id };
  }

  const tourPlans = await TourPlan.find(filter)
    .populate("salespersonId", "firstName lastName employeeId")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, tourPlans, "Tour plans fetched successfully"));
});

// Delete uploaded tour plan
const deleteTourPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // find the tour plan record we want to delete
  const tourPlan = await TourPlan.findById(id);

  if (!tourPlan) {
    throw new ApiError(404, "Tour plan not found");
  }

  // check the logged-in user is actually allowed to delete this one
  const isOwnTourPlan =
    tourPlan.salespersonId.toString() === req.user._id.toString();

  let isAllowed = isOwnTourPlan;

  // if it's not their own, a MANAGER may still delete it if the
  // tour plan belongs to someone on their team
  if (!isAllowed && req.user.role === "MANAGER") {
    const teamMembers = await User.find({ manager: req.user._id }).select("_id");
    const teamMemberIds = teamMembers.map((u) => u._id.toString());
    isAllowed = teamMemberIds.includes(tourPlan.salespersonId.toString());
  }

  if (!isAllowed) {
    throw new ApiError(
      403,
      "You are not allowed to delete this tour plan"
    );
  }

  // delete the actual file from Cloudinary first
  // resource_type: "raw" must match what we used when uploading it
  await cloudinary.uploader.destroy(tourPlan.cloudinaryPublicId, {
    resource_type: "raw",
  });

  // delete the record from MongoDB
  await TourPlan.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tour plan deleted successfully"));
});

export { uploadTourPlan, exportTourPlan, getAllTourPlans, deleteTourPlan };