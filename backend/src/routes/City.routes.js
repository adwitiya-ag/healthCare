import { Router } from "express";
import {
    createCity,
    getCities,
    getCityById,
    updateCity,
    deleteCity,
    reactivateCity,
} from "../controller/City.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyUser } from "../middleware/verifyUser.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

// GET /cities?cityName=&isActive=  -> populate dropdown (any logged-in / public)
router.route("/cities").get(getCities);

// GET /city/:id -> fetch single city
router.route("/city/:id").get(getCityById);

// POST /city -> create a new city (MANAGER only)
router
    .route("/city")
    .post(verifyJWT, verifyUser, authorizeRoles("MANAGER", "ADMIN"), createCity);

// PATCH /city/:id -> update a city (MANAGER only)
router
    .route("/city/:id")
    .patch(verifyJWT, verifyUser, authorizeRoles("MANAGER", "ADMIN"), updateCity);

router
    .route("/city/activate/:id")
    .patch(verifyJWT, verifyUser, authorizeRoles("MANAGER", "ADMIN"), reactivateCity);

// DELETE /city/:id -> soft-delete a city (admin only)
router
    .route("/city/:id")
    .delete(verifyJWT, verifyUser, authorizeRoles("MANAGER"), deleteCity);

export default router;