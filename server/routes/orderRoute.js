import express from "express";
import {
  allOrders,
  createPaymentIntent,
  deleteOrder,
  getSingleOrder,
  myOrders,
  newOrder,
  processOrder,
} from "../controllers/orderController.js";
import { isAuthenticated, isSeller } from "../middleware/auth.js";

const app = express.Router();

app.use(isAuthenticated);

app.post("/new", newOrder);

app.get("/myOrders", myOrders);

app.get("/allOrdered", isSeller, allOrders);

app.post("/create", createPaymentIntent);

app
  .route("/:id")
  .get(getSingleOrder)
  .put(isSeller, processOrder)
  .delete(isSeller, deleteOrder);

export default app;
