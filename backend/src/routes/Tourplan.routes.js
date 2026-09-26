import { Router } from "express";
import {
  uploadTourPlan,
  exportTourPlan,
  getAllTourPlans,
  deleteTourPlan,
} from "../controller/Tourplan.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyUser } from "../middleware/verifyUser.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { uploadExcel } from "../middleware/multer.middleware.js";

const router = Router();

// POST /upload -> Manager/MR uploads a tour plan excel file
router
  .route("/upload")
  .post(
    verifyJWT,
    verifyUser,
    authorizeRoles("MR", "MANAGER"),
    uploadExcel.single("file"),
    uploadTourPlan
  );

// GET /export -> download the current tour plan as excel
router
  .route("/export")
  .get(verifyJWT, verifyUser, authorizeRoles("MR", "MANAGER"), exportTourPlan);

// GET /all -> get tour plan upload history (own, or team's for Manager)
router
  .route("/all")
  .get(verifyJWT, verifyUser, authorizeRoles("MR", "MANAGER"), getAllTourPlans);

// DELETE /delete/:id -> permanently delete a specific tour plan record
router
  .route("/delete/:id")
  .delete(verifyJWT, verifyUser, authorizeRoles("MR", "MANAGER"), deleteTourPlan);

export default router;