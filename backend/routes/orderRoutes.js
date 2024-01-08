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
router.route("/").post(protect, addOrderItems).get(protect, admin, getOrders);
// get my orders (user)
router.route("/mine").get(protect, getMyOrders);
// get order by id (admin)
router.route("/:id").get(protect, admin, getOrderById);
// update order to paid (user)
router.route("/:id/pay").put(protect, updateOrderToPaid);
// update order to deliver (admin)
router.route("/:id/deliver").put(protect, admin, updateOrderToDelivered);

export default router;
