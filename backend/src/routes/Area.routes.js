import { Router } from "express";
import {
    createArea,
    getAreas,
    getAreaById,
    updateArea,
    deleteArea,
    reactivateArea,
} from "../controller/Area.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyUser } from "../middleware/verifyUser.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

// GET /areas?cityId=&isActive=  -> populate dropdown (any logged-in / public)
router.route("/areas").get(getAreas);

// GET /area/:id -> fetch single area
router.route("/area/:id").get(getAreaById);

// POST /area -> create a new area under a city (admin only)
router
    .route("/area")
    .post(verifyJWT, verifyUser, authorizeRoles("ADMIN", "MANAGER"), createArea);

// PATCH /area/:id -> update an area (admin only)
router
    .route("/area/:id")
    .patch(verifyJWT, verifyUser, authorizeRoles("ADMIN", "MANAGER"), updateArea);

router
    .route("/area/activate/:id")
    .patch(verifyJWT, verifyUser, authorizeRoles("ADMIN", "MANAGER"), reactivateArea);

// DELETE /area/:id -> soft-delete an area (admin only)
router
    .route("/area/:id")
    .delete(verifyJWT, verifyUser, authorizeRoles("ADMIN", "MANAGER"), deleteArea);

export default router;