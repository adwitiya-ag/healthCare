import { Router } from "express";
import { uploadTourPlan, exportTourPlan, getAllTourPlans } from "../controller/Tourplan.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyUser } from "../middleware/verifyUser.middleware.js";
import { uploadExcel } from "../middleware/multer.middleware.js";

const router = Router();

// POST /upload -> Manager/MR uploads a tour plan excel file
router
  .route("/upload")
  .post(verifyJWT, verifyUser, uploadExcel.single("file"), uploadTourPlan);

// GET /export -> download the current tour plan as excel
router.route("/export").get(verifyJWT, verifyUser, exportTourPlan);

// GET /all -> get this salesperson's full tour plan upload history
router.route("/all").get(verifyJWT, verifyUser, getAllTourPlans);

export default router;