import express from "express";
import dbConnection from "./db.mjs";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

try {
  await dbConnection.connect();
} catch (error) {
  console.error(error);
}

app.get("/products", async (req, res) => {
  try {
    const [results] = await dbConnection.query("SELECT * FROM Products");
    res.json(results).status(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.post("/checkout", async (req, res) => {
  const { cart, subtotal } = req.body;

  try {
    await dbConnection.query(
      `INSERT INTO Orders (subtotal) VALUES (${subtotal});`
    );
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }

  const orderId = new Date.now();
  
  cart.forEach(async (item) => {
    try {
      await dbConnection.query(
        `INSERT INTO Purchased_Items (product_id, quantity, order_id) VALUES (${item.id}, ${item.qtyInCart}, ${orderId})`
      );
    } catch (error) {
      console.error(error);
    }
  });

  cart.forEach(async (item) => {
    try {
      await dbConnection.query(
        `UPDATE Products SET stock = stock - ${item.qtyInCart} WHERE id = ${item.id};`
      );
    } catch (error) {
      console.error(error);
    }
  });

  res.sendStatus(201);
});

app.listen(PORT);
