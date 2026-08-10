import { Router } from "express";
import {
    getAllProduct,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
} from "../controller/product.controller.js";

const router = Router();

router.route("/addproduct").post(addProduct);
router.route("/getallproducts").get(getAllProduct);
router.route("/getproduct/:id").get(getProductById);
router.route("/updateproduct/:id").put(updateProduct);
router.route("/deleteproduct/:id").delete(deleteProduct);

export default router;