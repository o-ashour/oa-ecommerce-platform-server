import express from "express";
import dbConnection from "./db.mjs";
import cors from "cors";
import dotenv from "dotenv";
import { getProducts, processOrder } from "./controllers.mjs";
import { validateOrder } from "./utils";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

try {
  await dbConnection.connect();
} catch (error) {
  console.error(error);
  throw new Error("Unable to connect to DB");
}

app.get("/products", getProducts);
app.post("/checkout", validateOrder, processOrder);

app.listen(PORT);
