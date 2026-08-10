import { Router } from "express";
import { revGeo } from "../controller/Location.controller.js";

const router = Router();

router.get("/revGeo", revGeo);

export default router;