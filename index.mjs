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
  const orderId = Date.now();


  try {
    await dbConnection.query('CREATE TABLE Purchased_Items (id INT NOT NULL AUTO_INCREMENT, product_id INT NOT_NULL, order_id BIGINT NOT_NULL, quantity INT, FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE, FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE);')
  } catch (error) {
    console.error(error)
  }

  try {
    const [result] = await dbConnection.query('DESCRIBE Orders;')
    console.log(result)
  } catch (error) {
    console.error(error)
  }

  try {
    const [result] = await dbConnection.query('DESCRIBE Purchased_Items;')
    console.log(result)
  } catch (error) {
    console.error(error)
  }

  // try {
  //   await dbConnection.query(
  //     `INSERT INTO Orders (id, subtotal) VALUES (${orderId}, ${subtotal});`
  //   );
  // } catch (error) {
  //   console.error(error);
  //   res.sendStatus(500);
  // }


  // cart.forEach(async (item) => {
  //   try {
  //     await dbConnection.query(
  //       `INSERT INTO Purchased_Items (product_id, quantity, order_id) VALUES (${item.id}, ${item.qtyInCart}, ${orderId})`
  //     );
  //   } catch (error) {
  //     console.error(error);
  //   }
  // });

  // cart.forEach(async (item) => {
  //   try {
  //     await dbConnection.query(
  //       `UPDATE Products SET stock = stock - ${item.qtyInCart} WHERE id = ${item.id};`
  //     );
  //   } catch (error) {
  //     console.error(error);
  //   }
  // });

  res.sendStatus(201);
});

app.listen(PORT);
