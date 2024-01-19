import express from "express";

const router = express.Router();

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  deleteProductImage,
  filterByCategory,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import checkObjectId from "../middleware/checkObjectId.js";

router.route("/").get(getProducts).post(protect, admin, createProduct);
router.get("/top", getTopProducts);

router.put("/updateImage", deleteProductImage);
router.get("/category", filterByCategory);
router.get("/getone/:id", checkObjectId, getProductById);
router.put("/updateProduct/:id", protect, admin, checkObjectId, updateProduct);
router.delete(
  "/deleteProduct/:id",
  protect,
  admin,
  checkObjectId,
  deleteProduct
);
router.post("/reviews/:id", protect, checkObjectId, createProductReview);

export default router;
