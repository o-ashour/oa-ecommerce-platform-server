const checkNumVal = (val) => {
  if (!val || !Number(val)) {
    return res.sendStatus(400);
  }
};

export const validateOrder = async (req, res, next) => {
  const { cart, subtotal } = req.body;

  cart.forEach((item) => {
    checkNumVal(item.id);
    checkNumVal(item.qtyInCart);
    checkNumVal(subtotal);
  });
  
  next();
};
