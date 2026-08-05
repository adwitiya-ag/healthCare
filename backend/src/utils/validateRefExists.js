import { ApiError } from "./ApiError.js";

/**
 * Validates that a referenced document exists in the DB and is active.
 * Throws an ApiError(400) if not found — meant to be used inside
 * asyncHandler-wrapped controllers so the error is caught automatically.
 *
 * @param {mongoose.Model} Model     - the model to check against (City, Area, etc.)
 * @param {string} id                - the ObjectId (as string) to look up
 * @param {string} fieldName         - human-readable name used in the error message
 * @returns {Promise<Document>}      - the found document, if valid
 */
export const validateRefExists = async (Model, id, fieldName) => {
  if (!id) {
    throw new ApiError(400, `${fieldName} ID is required`);
  }

  const doc = await Model.findOne({ _id: id, isActive: true });

  if (!doc) {
    throw new ApiError(400, `Invalid or inactive ${fieldName}`);
  }

  return doc;
};