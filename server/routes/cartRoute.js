import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  addToCart,
  decreaseQuantity,
  getCart,
  increaseQuantity,
  removeFromCart,
} from "../controllers/cartController.js";

const app = express.Router();

app.use(isAuthenticated);

app.post("/addToCart", addToCart);

app.post("/decreaseQuantity", decreaseQuantity);

app.post("/increaseQuantity", increaseQuantity);

app.post("/removeFromCart", removeFromCart);

app.get("/cartProduct", getCart);

export default app;
