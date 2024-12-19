import dotenv from "dotenv";
dotenv.config();

const corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

const E_COMMERCE_TOKEN = "e-commerce-token";

export { corsOptions, E_COMMERCE_TOKEN };
