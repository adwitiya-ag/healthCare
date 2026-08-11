import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const revGeo = asyncHandler(async(req, res) => {

    const {lat, lng} = req.query;

    if(!lat || !lng){
        throw new ApiError(404, "Latitude or Longitude is missing")
    }

    const response = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${process.env.GEOAPIFY_KEY}`
        );

    const data = await response.json();

    const properties = data.features?.[0]?.properties;

    if (!properties) {
        return res.status(404).json({
            message: "Location not found"
        });
    }

    return res
        .status(201)
        .json({
            address: properties.formatted,
            area: properties.address_line1,
            city: properties.city,
            state: properties.state,
            postcode: properties.postcode,
            latitude: properties.lat,
            longitude: properties.lon
        });

})