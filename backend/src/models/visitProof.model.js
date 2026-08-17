import mongoose, { Schema } from "mongoose";


const visitProofSchema = new Schema(
    {
        MRId: {
            type: Schema.Types.ObjectId,
            ref: "MR",
            required: true
        },

        Photos: [
        {
            url: {
                type: String,
                required: true
            },
            public_id: {
                type: String,
                required: true
            }
        }],

        Location: {
            latitude: {
                type: Number,
                required: true
            },

            longitude: {
                type: Number,
                required: true
            },

            accuracy: {
                type: Number,
                required: true
            }
        },

        Notes: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);


// indexes for finding visits of a particular MR
visitProofSchema.index({ MRId: 1 });

// index for sorting/filtering visits by date
visitProofSchema.index({ createdAt: -1 });


export const VisitProof = mongoose.model(
    "VisitProof",
    visitProofSchema
);