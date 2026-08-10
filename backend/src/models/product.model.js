import mongoose, {Schema} from "mongoose";

const productSchema = new Schema(
    {
        productName: {
            type: String,
            required: true,
            trim: true
        },
        companyId: {
            type: Schema.Types.ObjectId,
            ref : "Company",
            required: true
        },
        strength: {
            type: String,
            required: true,
            trim: true
        },
        packSize: {
            type: String,
            required: true,
            trim: true
        },
        mrp: {
            type: Number,
            required: true,
            min: 0
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

//To prevent duplicate products:
productSchema.index(
    {
        productName: 1,
        companyId: 1,
        strength: 1,
        packSize: 1
    },
    {
        unique: true
    }
);

//indexes for searching
productSchema.index({ companyId: 1 });
productSchema.index({ isActive: 1 });

//to search by name case-insensitive
productSchema.index({ productName: "text" });

export const Product = mongoose.model("Product", productSchema);
