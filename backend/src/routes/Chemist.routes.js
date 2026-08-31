import { Router } from "express";
import { createChemist, deleteChemist, getChemists, updateChemist } from "../controller/Chemist.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyUser } from "../middleware/verifyUser.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

// create a new chemist
router
  .route("/chemist")
  .post(verifyJWT, verifyUser, authorizeRoles("ADMIN","MANAGER"), createChemist);

// fetch all chemists
router.route("/chemists").get(getChemists);

// update chemist
router
  .route("/chemist/:id")
  .patch(verifyJWT, verifyUser, authorizeRoles("ADMIN","MANAGER"), updateChemist);

// inActive chemist
router
  .route("/chemist/:id")
  .delete(verifyJWT, verifyUser, authorizeRoles("ADMIN","MANAGER"), deleteChemist);

export default router;