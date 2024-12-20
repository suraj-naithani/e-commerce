import express from "express";
import {
  product,
  products,
  searchProduct,
} from "../controllers/productController.js";

const app = express.Router();

app.get("/", products);

app.get("/:id", product);

app.get("/searchProduct", searchProduct);

export default app;
