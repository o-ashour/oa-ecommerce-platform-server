import dbConnection from "./db.mjs";

const saveOrder = async (orderId, subtotal) => {
  try {
    await dbConnection.query(
      `INSERT INTO Orders (id, subtotal) VALUES (${orderId}, ${subtotal});`
    );
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const savePurchasedItems = async (cart, orderId) => {
  cart.forEach(async (item) => {
    try {
      await dbConnection.query(
        `INSERT INTO Purchased_Items (product_id, quantity, order_id) VALUES (${item.id}, ${item.qtyInCart}, ${orderId})`
      );
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });
};

const updateProductStock = async (cart) => {
  cart.forEach(async (item) => {
    try {
      await dbConnection.query(
        `UPDATE Products SET stock = stock - ${item.qtyInCart} WHERE id = ${item.id};`
      );
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });
};

export const getProducts = async (req, res) => {
  try {
    const [results] = await dbConnection.query("SELECT * FROM Products");
    res.json(results).status(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

export const processOrder = async (req, res) => {
  const { cart, subtotal } = req.body;
  const orderId = Date.now();

  saveOrder(orderId, subtotal);
  savePurchasedItems(cart, orderId);
  updateProductStock(cart);
  
  res.sendStatus(201);
};
