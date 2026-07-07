import { Router } from "express";
import { getAllUsers } from "../controllers/user.controller.js";
import catchAsync from "../lib/catchAsync.js";

const router = Router();

router.get("/", catchAsync(getAllUsers));

export default router;
