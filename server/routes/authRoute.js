import express from "express";
import { logout, signIn, signUp } from "../controllers/authController.js";

const app = express.Router();

app.post("/signup", signUp);

app.post("/signin", signIn);

app.get("/logout", logout);

export default app;
