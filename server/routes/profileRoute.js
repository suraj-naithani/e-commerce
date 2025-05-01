import express from "express";
import {
  deleteMyProfile,
  getMyProfile,
  updateProfile,
} from "../controllers/profileControllers.js";
import { isAuthenticated } from "../middleware/auth.js";

const app = express.Router();

app.get("/me", isAuthenticated, getMyProfile);

app.put("/updateProfile", isAuthenticated, updateProfile);

app.delete("/deleteProfile", isAuthenticated, deleteMyProfile);

export default app;
