import mongoose from "mongoose";

const doctorSpecializationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // e.g. Ortho, ENT, Cardiology
      uppercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

doctorSpecializationSchema.index({ isActive: 1 });

export const DoctorSpecialization = mongoose.model(
  "DoctorSpecialization",
  doctorSpecializationSchema
);