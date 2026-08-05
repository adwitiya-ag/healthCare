import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    doctorId: {
        type: String,
        unique: true
    },
    doctorName: {
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
    qualificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorQualification",
      required: true,
    },
    specializationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorSpecialization",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// prevent the exact same doctor entry (name + city + area + qualification + specialization)
// from being inserted twice
doctorSchema.index(
  { doctorName: 1, cityId: 1, areaId: 1, qualificationId: 1, specializationId: 1 },
  { unique: true }
);

// speeds up the area-wise / city-wise GET /doctors filtering
doctorSchema.index({ cityId: 1, areaId: 1 });
doctorSchema.index({ isActive: 1 });

export const Doctor = mongoose.model("Doctor", doctorSchema);