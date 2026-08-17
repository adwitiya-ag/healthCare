import mongoose from "mongoose";


const sampleDistributionSchema = new mongoose.Schema(
  {
    // which doctor received the sample
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // which product/sample was given
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // which user gave it — we get this automatically from the logged-in
    // user's token, the user never has to type this themselves
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // how many units were given (e.g. 2 strips, 1 box)
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    // when the sample was given — defaults to right now if not sent
    dateGiven: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// makes "show me all samples given to this doctor" queries fast
sampleDistributionSchema.index({ doctorId: 1 });
// makes "show me all samples this user has given" queries fast
sampleDistributionSchema.index({ userId: 1 });

export const SampleDistribution = mongoose.model(
  "SampleDistribution",
  sampleDistributionSchema
);