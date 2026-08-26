import { Router } from "express";
import { createChemist, getChemists } from "../controller/Chemist.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyUser } from "../middleware/verifyUser.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

// POST /chemist -> create a new chemist entry
// verifyJWT: decodes token, sets req.user
// verifyUser: confirms req.user.isVerified
// authorizeRoles("admin"): confirms req.user.role === "admin"
router
  .route("/chemist")
  .post(verifyJWT, verifyUser, authorizeRoles("ADMIN","MANAGER"), createChemist);

// GET /chemists?cityId=&areaId=&chemistType=
// -> fetch area-wise / city-wise chemist list (public / any logged-in user)
router.route("/chemists").get(getChemists);

export default router;