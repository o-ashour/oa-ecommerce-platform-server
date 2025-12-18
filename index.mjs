import express from "express";
import dbConnection from "./db.mjs";
import cors from "cors";
import cookieSession from "cookie-session";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

app.use(
  cookieSession({
    name: process.env.COOKIE_SESSION_NAME,
    keys: [process.env.COOKIE_SESSION_KEY1, process.env.COOKIE_SESSION_KEY1],
  })
);

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

try {
  await dbConnection.connect();
} catch (error) {
  console.error(error);
}

app.post("/products", async (req, res) => {
  try {
    await dbConnection.query("ALTER TABLE Products RENAME products");
  } catch (error) {
    console.error(error);
  }

  try {
    await dbConnection.query(
      "CREATE TABLE Products(id INT NOT NULL AUTO_INCREMENT, name VARCHAR(100), category VARCHAR(50), price DECIMAL, stock INT, image VARCHAR(100), PRIMARY KEY(id));"
    );
  } catch (error) {
    console.error(error);
  }

  try {
    await dbConnection.query(
      "CREATE TABLE Orders(id INT NOT NULL AUTO_INCREMENT, subtotal DECIMAL, session_id LONGTEXT, PRIMARY KEY(id));"
    );
  } catch (error) {
    console.error(error);
  }

  try {
    await dbConnection.query(
      "CREATE TABLE Purchased_Items (id INT NOT NULL AUTO_INCREMENT, product_id INT, quantity INT, order_id INT, session_id LONGTEXT, PRIMARY KEY(id), FOREIGN KEY(product_id) REFERENCES Products(id) ON DELETE CASCADE, FOREIGN KEY(order_id) REFERENCES Orders(id) ON DELETE CASCADE);"
    );
  } catch (error) {
    console.error(error);
  }
  res.end();
});

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
  const regex = /session=\w+=*;/;
  const sessionId = req.headers.cookie?.match(regex)[0].slice(8);
  let orderId;

  try {
    const [result] = await dbConnection.query(
      `INSERT INTO Orders (subtotal, session_id) VALUES (${subtotal}, '${sessionId}');`
    );
    orderId = result.insertId;
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }

  cart.forEach(async (item) => {
    try {
      await dbConnection.query(
        `INSERT INTO Purchased_Items (product_id, quantity, order_id, session_id) VALUES (${item.id}, ${item.qtyInCart}, ${orderId}, '${sessionId}')`
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

  req.session.cart = [];
  res.sendStatus(201);
});

app.get("/cart", (req, res) => {
  try {
    if (!req.session.cart) res.sendStatus(404);
    res.json(req.session.cart).status(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.post("/cart", (req, res) => {
  try {
    req.session.cart = [];
    res.json(req.session.cart).status(201);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.post("/cart/items", (req, res) => {
  try {
    if (!req.session.cart) res.send("No session found").status(400);
    req.session.cart = [...req.session.cart, { ...req.body, qtyInCart: 1 }];
    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.put("/cart/items/:id", (req, res) => {
  try {
    if (!req.session.cart) res.send("No session found").status(400);
    const cart = req.session.cart;
    const foundProduct = cart.find(
      (item) => item.id === parseInt(req.params.id)
    );

    if (!foundProduct) {
      res.sendStatus(404);
    }

    const filteredCart = req.session.cart?.filter(
      (item) => item !== foundProduct
    );
    req.session.cart = [
      ...filteredCart,
      { ...foundProduct, qtyInCart: foundProduct.qtyInCart + 1 },
    ];
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.delete("/cart/items/:id", (req, res) => {
  if (!req.session.cart) res.send("No session found").status(400);
  try {
    const cart = req.session.cart;
    const foundProduct = cart.find(
      (item) => item.id === parseInt(req.params.id)
    );

    if (!foundProduct) {
      res.sendStatus(404);
    }

    const filteredCart = req.session.cart?.filter(
      (item) => item !== foundProduct
    );
    if (foundProduct.qtyInCart <= 1) {
      req.session.cart = filteredCart;
    } else {
      req.session.cart = [
        ...filteredCart,
        { ...foundProduct, qtyInCart: foundProduct.qtyInCart - 1 },
      ];
    }
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.listen(PORT);
