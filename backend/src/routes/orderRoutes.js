
import { Router } from "express";
import { createOrder } from "../controllers/orderController.js";

const router = Router();

// Public checkout endpoint.
// Product prices and stock are validated by the backend.
router.post("/", createOrder);

export default router;
