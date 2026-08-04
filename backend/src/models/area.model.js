import mongoose from "mongoose";

const areaSchema = new mongoose.Schema(
  {
    areaName: {
      type: String,
      required: true,
      trim: true,
    },
    areaCode: {
      type: String,
      required: true,
      unique: true, // generated via counterUtils, e.g. ARE0001
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// same area name shouldn't repeat within the same city
areaSchema.index({ areaName: 1, cityId: 1 }, { unique: true });
areaSchema.index({ cityId: 1 });
areaSchema.index({ isActive: 1 });

export const Area = mongoose.model("Area", areaSchema);