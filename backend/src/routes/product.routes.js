import { Router } from "express";
import {
    getAllProduct,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
} from "../controller/product.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyUser } from "../middleware/verifyUser.middleware.js";

const router = Router();

router.route("/addproduct").post(verifyJWT, verifyUser, addProduct);
router.route("/getallproducts").get(verifyJWT, verifyUser, getAllProduct);
router.route("/getproduct/:id").get(verifyJWT, verifyUser, getProductById);
router.route("/updateproduct/:id").put(verifyJWT, verifyUser, updateProduct);
router.route("/deleteproduct/:id").delete(verifyJWT, verifyUser, deleteProduct);

export default router;