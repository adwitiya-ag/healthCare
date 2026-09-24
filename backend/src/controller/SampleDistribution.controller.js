import { SampleDistribution } from "../models/sampleDistribution.model.js";
import { Doctor } from "../models/doctor.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateRefExists } from "../utils/validateRefExists.js";
import { User } from "../models/user.model.js";

// Create a new sample distribution record
const createSampleDistribution = asyncHandler(async (req, res) => {
    // get the data sent from the frontend
    const { doctorId, productId, quantity } = req.body;

    // basic check — doctorId and productId must be given
    if (!doctorId || !productId) {
        throw new ApiError(400, "doctorId and productId are required");
    }

    // look up the doctor using their FRIENDLY code (e.g. "DOC0001")
    // instead of the long MongoDB _id — this is the extra lookup step
    const doctor = await Doctor.findOne({ _id: doctorId, isActive: true });

    if (!doctor) {
        throw new ApiError(400, "Invalid or inactive Doctor ID");
    }

    // make sure the product exists too (this one still uses
    // the normal MongoDB _id, since Product doesn't have a friendly code)
    await validateRefExists(Product, productId, "Product");

    // create the new entry
    // "doctor._id" is used here (the real MongoDB ObjectId)
    // when saving — NOT the friendly code — because that's what the
    // schema's "ref" system needs to work with .populate() later
    const sampleDistribution = await SampleDistribution.create({
        doctorId: doctor._id,
        productId,
        userId: req.user._id,
        quantity: quantity || 1,
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                sampleDistribution,
                "Sample distribution recorded successfully"
            )
        );
});

// get all sample distributions, with optional filtering by doctorId, userId, or productId
// controllers/distributionController.js
const fetchSampleDistributions = asyncHandler(async (req, res) => {
    const { doctorId, userId, productId } = req.query;
    const { _id: authUserId, role } = req.user;

    const filter = {};

    // ── Doctor filter (unchanged) ──
    if (doctorId) {
        const doctor = await Doctor.findOne({ doctorId, isActive: true });
        if (!doctor) throw new ApiError(400, "Invalid or inactive Doctor ID");
        filter.doctorId = doctor._id;
    }

    // ── Product filter (unchanged) ──
    if (productId) {
        await validateRefExists(Product, productId, "Product");
        filter.productId = productId;
    }

    // ── Role-based MR scoping ──
    if (role === "MR") {
        // An MR can only ever see their own records — ignore any userId param
        filter.userId = authUserId;
    } else if (role === "MANAGER") {
        // Find all MRs reporting to this manager
        const teamMrs = await User.find(
            { manager: authUserId, role: "MR", isActive: true },
            "_id"
        ).lean();
        const teamIds = teamMrs.map((m) => m._id);

        if (teamIds.length === 0) {
            return res
                .status(200)
                .json(new ApiResponse(200, [], "No sample distribution records found"));
        }

        if (userId) {
            // Manager drilled into one MR — verify it's within their team
            const requested = String(userId);
            const allowed = teamIds.some((id) => String(id) === requested);
            if (!allowed) {
                throw new ApiError(403, "You can only view records of MRs in your team");
            }
            filter.userId = userId;
        } else {
            filter.userId = { $in: teamIds };
        }
    } else if (role === "ADMIN") {
        // Admin sees everything; optional userId filter still respected
        if (userId) filter.userId = userId;
    } else {
        throw new ApiError(403, "Unauthorized role");
    }

    const records = await SampleDistribution.find(filter)
        .populate("doctorId", "doctorId doctorName")
        .populate("productId", "productName")
        .populate("userId", "firstName lastName email")
        .sort({ dateGiven: -1 });

    if (!records.length) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], "No sample distribution records found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, records, "Sample distributions fetched successfully"));
});

const deleteDistribution = asyncHandler(async(req, res) => {
    const {distributionId} = req.body;
    console.log(distributionId)

    const result = await SampleDistribution.findByIdAndDelete(distributionId);

    if(!result){
        throw new ApiError(404, "No such record found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Distributions deleted successfully")
        );
})

export { createSampleDistribution, fetchSampleDistributions, deleteDistribution };