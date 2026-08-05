import mongoose from "mongoose";

const chemistSchema = new mongoose.Schema(
  {
    chemistId: {
        type: String,
        unique: true
    },
    chemistName: {
      type: String,
      required: true,
      trim: true,
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
    areaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
      required: true,
    },
    chemistType: {
      type: String,
      enum: ["RETAIL", "WHOLESALE", "HOSPITAL", "ONLINE"], // Dropdown -> Enum
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// prevent the exact same chemist entry from being inserted twice
chemistSchema.index(
  { chemistName: 1, cityId: 1, areaId: 1, chemistType: 1 },
  { unique: true }
);

// speeds up the area-wise / city-wise GET /chemists filtering
chemistSchema.index({ cityId: 1, areaId: 1 });
chemistSchema.index({ isActive: 1 });

export const Chemist = mongoose.model("Chemist", chemistSchema);