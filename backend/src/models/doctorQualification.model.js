import mongoose from "mongoose";

const doctorQualificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // e.g. MBBS, MD, MS, BDS
      uppercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

doctorQualificationSchema.index({ isActive: 1 });

export const DoctorQualification = mongoose.model(
  "DoctorQualification",
  doctorQualificationSchema
);