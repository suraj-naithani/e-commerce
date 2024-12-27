import express from "express";
import {
  product,
  products,
  searchProduct,
} from "../controllers/productController.js";

const app = express.Router();

app.get("/product", products);

app.get("/searchProduct", searchProduct);

app.get("/:id", product);

export default app;
