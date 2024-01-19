import express from "express";

import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();
// add order (user) / get orders (admin)
router.get("/", protect, admin, getOrders);

router.post("/createOrder", protect, addOrderItems);

// get my orders (user)
router.route("/mine").get(protect, getMyOrders);
// get order by id (user)
router.route("/userOrder/:id").get(protect, getOrderById);
// update order to paid (user)
router.route("/pay/:id").put(protect, updateOrderToPaid);
// update order to deliver (admin)
router.route("/deliver/:id").put(protect, admin, updateOrderToDelivered);

export default router;
