import mongoose, { Schema } from "mongoose";


const visitProofSchema = new Schema(
    {
        MRId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        DoctorId: {
            type: Schema.Types.ObjectId,
            ref: "Doctor",
            default: null
        },

        ChemistId: {
            type: Schema.Types.ObjectId,
            ref: "Chemist",
            default: null
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

visitProofSchema.pre("validate", function(next){

    if(!this.DoctorId && !this.ChemistId){
        return next(
            new Error("Either DoctorId or ChemistId is required")
        );
    }

    if (this.DoctorId && this.ChemistId) {
        return next(
            new Error("Only one of DoctorId or ChemistId should be provided")
        );
    }
})

// indexes for finding visits of a particular MR
visitProofSchema.index({ MRId: 1 });

// index for sorting/filtering visits by date
visitProofSchema.index({ createdAt: -1 });


export const VisitProof = mongoose.model(
    "VisitProof",
    visitProofSchema
);