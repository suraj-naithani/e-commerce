import express from "express";
import {
  getMyProfile,
  updateProfile,
} from "../controllers/profileControllers.js";
import { isAuthenticated } from "../middleware/auth.js";

const app = express.Router();

app.get("/me", isAuthenticated, getMyProfile);

app.put("/updateProfile", isAuthenticated, updateProfile);

export default app;
