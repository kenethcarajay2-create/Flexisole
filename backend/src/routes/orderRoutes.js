import { Router } from "express";
import { createOrder, getMyOrders, getMyOrder } from "../controllers/orderController.js";
import { requireCustomer } from "../middleware/customerAuthMiddleware.js";

const router = Router();

// Every order action requires a verified customer account.
router.use(requireCustomer);
router.get("/mine", getMyOrders);
router.get("/mine/:id", getMyOrder);
router.post("/", createOrder);

export default router;
