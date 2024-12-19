import express from "express";
import {
  adminDashboard,
  sellerDashboard,
} from "../controllers/dashboardController.js";
import { isAdmin, isAuthenticated, isSeller } from "../middleware/auth.js";

const app = express.Router();

app.use(isAuthenticated);

app.get("/sellerDashboard", isSeller, sellerDashboard);

app.get("/adminDashboard", isAdmin, adminDashboard);

export default app;
