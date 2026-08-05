import mongoose from "mongoose";

const citySchema = new mongoose.Schema(
  {
    cityName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    cityCode: {
      type: String,
      required: true,
      unique: true, // generated via counterUtils, e.g. CTY0001
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// helps area-wise / city-wise lookups run fast
citySchema.index({ cityName: 1 });
citySchema.index({ isActive: 1 });

export const City = mongoose.model("City", citySchema);