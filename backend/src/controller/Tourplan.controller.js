import { TourPlan } from "../models/tourPlan.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

// Manager/MR uploads a tour plan excel file.
// Multer already saved it TEMPORARILY to public/temp.
// We now upload that temp file to Cloudinary and save the
// returned URL in the database.
const uploadTourPlan = asyncHandler(async (req, res) => {
  // Step 1: multer already processed the file and saved it locally
  // req.file.path tells us where the file is stored temporarily.
  if (!req.file) {
    throw new ApiError(400, "No excel file uploaded");
  }

  // Step 2: upload that local file to Cloudinary
  const cloudinaryResponse = await uploadOnCloudinary(req.file.path);

  if (!cloudinaryResponse) {
    throw new ApiError(500, "Failed to upload file to Cloudinary");
  }

  // Step 3: if this salesperson already has an active tour plan,
  // mark it inactive first (keep as history, don't delete)
  await TourPlan.updateMany(
    { salespersonId: req.user._id, isActive: true },
    { $set: { isActive: false } }
  );

  // Step 4: save the Cloudinary URL + details in the database
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

  // Step 2: simplest approach — just redirect the browser/Postman
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


export { uploadTourPlan, exportTourPlan, getAllTourPlans };