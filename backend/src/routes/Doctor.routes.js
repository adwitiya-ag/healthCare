import { Router } from "express";
import { createDoctor, deleteDoctor, getDoctors, updateDoctor } from "../controller/Doctor.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js"; // confirm actual export name
import { verifyUser } from "../middleware/verifyUser.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

// create a new doctor
router
  .route("/doctor")
  .post(verifyJWT, verifyUser, authorizeRoles("ADMIN","MANAGER"), createDoctor);

// fetch all doctors
router.route("/doctors").get(getDoctors);


// update doctor
router
  .route("/doctor/:id")
  .patch(verifyJWT, verifyUser, authorizeRoles("ADMIN","MANAGER"), updateDoctor);

// inActive doctor
router
  .route("/doctor/:id")
  .delete(verifyJWT, verifyUser, authorizeRoles("ADMIN","MANAGER"), deleteDoctor);


export default router;