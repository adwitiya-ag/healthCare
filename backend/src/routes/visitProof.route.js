import { Router } from "express";

import {
    addVisitProof,
    getAllVisitProof,
    updateVisitProof,
    deleteVisitProof
} from "../controller/visitProof.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { upload } from "../middleware/multer.photo.middleware.js";


const router = Router();


router.route("/").post(
        verifyJWT,
        authorizeRoles("MR"),
        upload.array("photos"),
        addVisitProof
    );

router.route("/").get(
        verifyJWT,
        authorizeRoles("MR", "MANAGER"),
        getAllVisitProof
    );

router.route("/:id").put(
        verifyJWT,
        authorizeRoles("MR"),
        updateVisitProof
    );

router.route("/:id").delete(
        verifyJWT,
        authorizeRoles("MR"),
        deleteVisitProof
    );


export default router;