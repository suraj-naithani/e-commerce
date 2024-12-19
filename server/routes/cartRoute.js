import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  addToCart,
  getCart,
  removeFromCart,
} from "../controllers/cartController.js";

const app = express.Router();

app.use(isAuthenticated);

app.post("/addToCart", addToCart);

app.post("/removeFromCart", removeFromCart);

app.get("/", getCart);

export default app;
