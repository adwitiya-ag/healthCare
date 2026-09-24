import { Router } from "express";
import { createSampleDistribution, deleteDistribution, fetchSampleDistributions} from "../controller/SampleDistribution.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyUser } from "../middleware/verifyUser.middleware.js";

const router = Router();

// POST /sample-distribution/add -> MR logs giving a sample to a doctor
// Any logged-in, verified user (MR/Manager) can do this — no admin
// restriction needed, since this is normal day-to-day MR work
router
  .route("/add")
  .post(verifyJWT, verifyUser, createSampleDistribution);

router
  .route("/delete")
  .delete(verifyJWT, verifyUser, deleteDistribution);

// GET /sample-distributions/fetch?doctorId=&mrId=&productId=
// view sample distribution history, filtered by doctor, MR, or product
router
  .route("/fetch")
  .get(verifyJWT, verifyUser, fetchSampleDistributions);

export default router;