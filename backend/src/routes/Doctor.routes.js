import { Router } from "express";
import { createDoctor, getDoctors } from "../controller/Doctor.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js"; // confirm actual export name
import { verifyUser } from "../middleware/verifyUser.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

// POST /doctor -> create a new doctor entry
// verifyJWT: decodes token, sets req.user
// verifyUser: confirms req.user.isVerified
// authorizeRoles("admin"): confirms req.user.role === "admin"
router
  .route("/doctor")
  .post(verifyJWT, verifyUser, authorizeRoles("ADMIN","MANAGER"), createDoctor);

// GET /doctors?cityId=&areaId=&qualificationId=&specializationId=
// -> fetch area-wise / city-wise doctor list (public / any logged-in user)
router.route("/doctors").get(getDoctors);

export default router;