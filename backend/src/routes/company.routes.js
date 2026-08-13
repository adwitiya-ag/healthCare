import { Router } from "express";
import{ getAllCompany,
        getCompanyById,
        addCompany,
        updateCompany,
        deleteCompany}  from "../controller/company.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyUser } from "../middleware/verifyUser.middleware.js";

const router = Router();

router.route("/addcompany").post(verifyJWT, verifyUser, addCompany);
router.route("/getallcompany").get(verifyJWT, verifyUser, getAllCompany);
router.route("/getcompany/:id").get(verifyJWT, verifyUser, getCompanyById);
router.route("/updatecompany/:id").put(verifyJWT, verifyUser, updateCompany);
router.route("/deletecompany/:id").delete(verifyJWT, verifyUser, deleteCompany);

export default router;