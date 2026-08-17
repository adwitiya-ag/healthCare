import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { VisitProof } from "../models/visitProof.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";


const addVisitProof = asyncHandler(async (req, res) => {

    const { latitude, longitude, accuracy, Notes } = req.body;

    const MRId = req.user._id;

    if (latitude === undefined || longitude === undefined || accuracy === undefined) {
        throw new ApiError(400,"latitude, longitude and accuracy are required");
    }

    // Check whether photos were uploaded
    if (!req.files || req.files.length === 0) {
        throw new ApiError(400,"At least one photo is required");
    }

    // Upload all photos to Cloudinary
    const uploadedPhotos = [];

    for (const file of req.files) {

        const response = await uploadOnCloudinary(
            file.path
        );

        if (!response) {
            throw new ApiError(500,"Failed to upload photo to Cloudinary");
        }

        uploadedPhotos.push({url: response.secure_url, public_id: response.public_id});
    }

    // Create VisitProof
    const visitProof = await VisitProof.create({

        MRId,

        Photos: uploadedPhotos,

        Location: {
            latitude: Number(latitude),
            longitude: Number(longitude),
            accuracy: Number(accuracy)
        },

        Notes: Notes || ""

    });


    return res
        .status(201)
        .json(new ApiResponse(201,visitProof,"Visit proof added successfully"));

});


const getAllVisitProof = asyncHandler(async (req, res) => {

    let visitProofs;

    // MR can see only their own visit proofs
    if (req.user.role === "MR") {
        visitProofs = await VisitProof
            .find({ MRId: req.user._id })
            .sort({ createdAt: -1 });
    }

    // Manager can see all visit proofs
    else if (req.user.role === "Manager") {
        visitProofs = await VisitProof
            .find()
            .sort({ createdAt: -1 });
    }

    else {
        throw new ApiError(403,"You are not authorized to view visit proofs");
    }

    return res
        .status(200)
        .json(new ApiResponse(200,visitProofs,"Visit proofs fetched successfully"));

});

const updateVisitProof = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { Notes } = req.body;

    // Check VisitProof ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400,"Invalid visit proof ID");
    }

     // Notes is optional
    const updateData = {};

    if (Notes !== undefined) {
        updateData.Notes = Notes;
    }

    // Find and update only if this VisitProof belongs to the logged-in MR
    const visitProof = await VisitProof.findOneAndUpdate(
        {
            _id: id,
            MRId: req.user._id
        },
        {
            $set: {
                Notes
            }
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!visitProof) {
        throw new ApiError(404,"Visit proof not found or you are not authorized to update it");
    }

    return res
        .status(200)
        .json(new ApiResponse(200,visitProof,"Visit proof updated successfully"));

});

const deleteVisitProof = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { public_id } = req.body;

    // Check VisitProof ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400,"Invalid visit proof ID");
    }

    // Check public_id
    if (!public_id) {
        throw new ApiError(400,"public_id is required");
    }

    // Find VisitProof only if it belongs to the logged-in MR
    const visitProof = await VisitProof.findOne({
        _id: id,
        MRId: req.user._id
    });

    if (!visitProof) {
        throw new ApiError(404,"Visit proof not found or you are not authorized to delete from it");
    }

    // Find the photo
    const photo = visitProof.Photos.find(
        (photo) => photo.public_id === public_id
    );

    if (!photo) {
        throw new ApiError(404,"Photo not found in this visit proof");
    }

    // Delete photo from Cloudinary
    const response = await deleteFromCloudinary(public_id);

    if (!response || response.result !== "ok") {
        throw new ApiError(500,"Failed to delete photo from Cloudinary");
    }

    // Remove photo from MongoDB
    visitProof.Photos = visitProof.Photos.filter(
        (photo) => photo.public_id !== public_id
    );

    // Save updated VisitProof
    await visitProof.save();

    return res
        .status(200)
        .json(new ApiResponse(200,visitProof,"Photo deleted successfully"));

});

export {
    addVisitProof,
    getAllVisitProof,
    updateVisitProof,
    deleteVisitProof
};