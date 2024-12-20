import express from "express";
import { isAuthenticated, isSeller } from "../middleware/auth.js";
import {
  createProduct,
  deleteProduct,
  products,
  updateProduct,
  product,
} from "../controllers/sellerController.js";
import { image, multerErrorHandler } from "../middleware/multer.js";

const app = express.Router();

app.use(isAuthenticated, isSeller);

app.post("/createProduct", image, multerErrorHandler, createProduct);

app.get("/products", products);

app.get("/product/:id", product);

app.put("/updateProduct/:id", image, multerErrorHandler, updateProduct);

app.delete("/deleteProduct/:id", deleteProduct);

export default app;
