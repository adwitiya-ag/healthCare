import { Router } from "express";
import {
    getDoctorPreference,
    addDoctorPreference,
    updateDoctorPreference,
    deleteDoctorPreference,
} from "../controller/DoctorProductPreference.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyUser } from "../middleware/verifyUser.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, verifyUser, addDoctorPreference);
router.route("/:doctorId").get(verifyJWT, verifyUser, getDoctorPreference);
router.route("/:preferenceId").put(verifyJWT, verifyUser, updateDoctorPreference);
router.route("/:preferenceId").delete(verifyJWT, verifyUser, deleteDoctorPreference);

export default router;