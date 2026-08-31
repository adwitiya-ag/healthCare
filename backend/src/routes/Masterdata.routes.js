import { Router } from "express";
import {
  createDoctorQualification,
  deleteDoctorQualification,
  getDoctorQualifications,
  toggleDoctorQualification,
  updateDoctorQualification,
} from "../controller/Doctorqualification.controller.js";
import {
  createDoctorSpecialization,
  deleteDoctorSpecialization,
  getDoctorSpecializations,
  toggleDoctorSpecialization,
  updateDoctorSpecialization,
} from "../controller/Doctorspecialization.controller.js";
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

// update doctor qualification
router
  .route("/doctor-qualification/:id")
  .patch(
    verifyJWT,
    verifyUser,
    authorizeRoles("ADMIN","MANAGER"),
    updateDoctorQualification
  );

// delete doctor qualification
router
  .route("/doctor-qualification/:id")
  .delete(
    verifyJWT,
    verifyUser,
    authorizeRoles("ADMIN","MANAGER"),
    deleteDoctorQualification
  );

// toggole active inactive
router
  .route("/doctor-qualification/:id/toggle")
  .patch(
    verifyJWT,
    verifyUser,
    authorizeRoles("ADMIN","MANAGER"),
    toggleDoctorQualification
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

// update doctor specialization
router
  .route("/doctor-specialization/:id")
  .patch(
    verifyJWT,
    verifyUser,
    authorizeRoles("ADMIN","MANAGER"),
    updateDoctorSpecialization
  );

// delete specialization
router
  .route("/doctor-specialization/:id")
  .delete(
    verifyJWT,
    verifyUser,
    authorizeRoles("ADMIN","MANAGER"),
    deleteDoctorSpecialization
  );

// toggle active inactive
router
  .route("/doctor-specialization/:id/toggle")
  .patch(
    verifyJWT,
    verifyUser,
    authorizeRoles("ADMIN","MANAGER"),
    toggleDoctorSpecialization
  );
export default router;