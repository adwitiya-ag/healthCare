import mongoose from "mongoose";


const tourPlanSchema = new mongoose.Schema(
  {
    // who uploaded this tour plan (the logged-in Manager/MR)
    salespersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // the original name of the file they uploaded (for display)
    originalFileName: {
      type: String,
      required: true,
    },

    // the permanent Cloudinary URL where the file now lives
    fileUrl: {
      type: String,
      required: true,
    },

    // Cloudinary's internal ID for this file — we need this if we
    // ever want to delete the file from Cloudinary later
    cloudinaryPublicId: {
      type: String,
      required: true,
    },

    // when someone re-uploads, we mark the old one inactive
    // instead of deleting it, so we keep history
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const TourPlan = mongoose.model("TourPlan", tourPlanSchema);