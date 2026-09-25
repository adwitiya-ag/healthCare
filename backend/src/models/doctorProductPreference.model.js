import mongoose, {Schema} from "mongoose";

const productPreferenceSchema = new Schema(
    {
        doctorId : {
            type: Schema.Types.ObjectId,
            ref : "Doctor",
            required: true
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref : "Product",
            required: true
        },
        preferenceOrder: {
            type: Number,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

productPreferenceSchema.index(
    {
        doctorId: 1,
        productId: 1,
    },
    {
        unique: true,
    }
);

productPreferenceSchema.index({ doctorId: 1 });
productPreferenceSchema.index({ productId: 1 });
productPreferenceSchema.index({ isActive: 1 });

export const ProductPreference = mongoose.model("ProductPreference", productPreferenceSchema);


