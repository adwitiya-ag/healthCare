import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/product.model.js";
import { Company } from "../models/company.model.js";
import mongoose from "mongoose";

const addProduct = asyncHandler(async (req, res) => {
    const { productName, companyId, strength, packSize, mrp } = req.body;

    if (!productName || !companyId || !strength || !packSize || mrp === undefined) {
        throw new ApiError(400, "Product name, company ID, strength, pack size and MRP are required");
    }

    // Validating companyId format to prevent Mongoose CastErrors
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
        throw new ApiError(400, "Invalid company ID format");
    }

    const product = await Product.create(
        {
            productName,
            companyId,
            strength,
            packSize,
            mrp
        }
    );

    return res
        .status(201)
        .json(new ApiResponse(201, product, "Product added successfully"));

});


const getAllProduct = asyncHandler(async (req, res) => {

    const products = await Product.find({isActive: true}).populate("companyId").sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, products, "Products fetched successfully"));

});

const getProductById = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid product ID");
    }

    const product = await Product.findById(id).populate("companyId");

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, product, "Product fetched successfully"));

});

const updateProduct = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const { productName, companyId, strength, packSize, mrp, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid product ID");
    }

    if (!productName || !companyId || !strength || !packSize || mrp === undefined) {
        throw new ApiError(400, "Product name, company ID, strength, pack size and MRP are required");
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
        throw new ApiError(400, "Invalid company ID format");
    }

    const product = await Product.findByIdAndUpdate(
        id,
        {
            $set:
            {
                productName,
                companyId,
                strength,
                packSize,
                mrp,
                isActive
            }
        },
        { new: true, runValidators: true })
        .populate("companyId");

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, product, "Product updated successfully"));

});

const deleteProduct = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid product ID");
    }

    const product = await Product.findByIdAndUpdate(
        id,
        {
            $set:
                { isActive: false }
        },
        { new: true }
    );

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, product, "Product deleted successfully"));

});




export {
    getAllProduct,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
}