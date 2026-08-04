import { Router } from "express";
import {
  createDoctorQualification,
  getDoctorQualifications,
} from "../controller/doctorQualification.controller.js";
import {
  createDoctorSpecialization,
  getDoctorSpecializations,
} from "../controller/doctorSpecialization.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyUser } from "../middleware/verifyUser.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

// ---------------- Doctor Qualification ----------------

// GET /doctor-qualifications?isActive=  -> populate dropdown
router.route("/doctor-qualifications").get(getDoctorQualifications);

// POST /doctor-qualification -> create a new qualification (admin only)
router
  .route("/doctor-qualification")
  .post(
    verifyJWT,
    verifyUser,
    authorizeRoles("ADMIN","MANAGER"),
    createDoctorQualification
  );

// ---------------- Doctor Specialization ----------------

// GET /doctor-specializations?isActive=  -> populate dropdown
router.route("/doctor-specializations").get(getDoctorSpecializations);

// POST /doctor-specialization -> create a new specialization (admin only)
router
  .route("/doctor-specialization")
  .post(
    verifyJWT,
    verifyUser,
    authorizeRoles("ADMIN","MANAGER"),
    createDoctorSpecialization
  );

export default router;