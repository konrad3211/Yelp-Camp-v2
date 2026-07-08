import { Router } from "express";
import {
  createCampground,
  deleteCampground,
  getCampground,
  getCampgrounds,
  updateCampground,
} from "../controllers/campground.controller.js";
import catchAsync from "../lib/catchAsync.js";
import { protect } from "../middleware/auth.middleware.js";
import { isAuthor } from "../middleware/isAuthor.middleware.js";
import { validate } from "../middleware/validate.js";
import {
  createCampgroundSchema,
  updateCampgroundSchema,
} from "../schemas/campground.schema.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.get("/", catchAsync(getCampgrounds));
router.get("/:id", catchAsync(getCampground));
router.post(
  "/",
  protect,
  //? "images nazwa pola w formsie, 5 - tyle max plikow"
  upload.array("images", 5),
  validate(createCampgroundSchema),
  catchAsync(createCampground),
);
router.patch(
  "/:id",
  protect,
  isAuthor,
  validate(updateCampgroundSchema),
  catchAsync(updateCampground),
);
router.delete("/:id", protect, isAuthor, catchAsync(deleteCampground));

export default router;
