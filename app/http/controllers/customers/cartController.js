const cartController = () => {
  return {
    index(req, res) {
      res.render("customers/cart", { cart: req.session.cart || null });
    },

    update(req, res) {
      if (!req.session.cart) {
        req.session.cart = {
          items: {},
          totalQty: 0,
          totalPrice: 0,
        };
      }
      const cart = req.session.cart;

      const productId = req.body._id;
      const productPrice = parseFloat(req.body.price) || 0;

      if (!cart.items[productId]) {
        cart.items[productId] = {
          item: req.body,
          qty: 1,
        };
        cart.totalQty += 1;
        cart.totalPrice += productPrice;
      } else {
        cart.items[productId].qty += 1;
        cart.totalQty += 1;
        cart.totalPrice += productPrice;
      }

      return res.json({ totalQty: cart.totalQty, totalPrice: cart.totalPrice });
    },

    remove(req, res) {
      const productId = req.body._id;

      if (!req.session.cart || !req.session.cart.items[productId]) {
        return res.status(400).json({ error: "Product not found in cart" });
      }

      const cart = req.session.cart;
      const productQty = cart.items[productId].qty;
      const productPrice = cart.items[productId].item.price * productQty;

      cart.totalQty -= productQty;
      cart.totalPrice -= productPrice;

      delete cart.items[productId];

      if (cart.totalQty === 0) {
        req.session.cart = null;
      }

      return res.json({ totalQty: cart.totalQty, totalPrice: cart.totalPrice });
    },

    updateQuantity(req, res) {
      const productId = req.body._id;
      const newQty = parseInt(req.body.qty, 10);

      if (!req.session.cart || !req.session.cart.items[productId]) {
        return res.status(400).json({ error: "Product not found in cart" });
      }

      if (newQty < 1) {
        return res.status(400).json({ error: "Quantity must be at least 1" });
      }

      const cart = req.session.cart;
      const product = cart.items[productId];

      const qtyDifference = newQty - product.qty;
      const priceDifference = qtyDifference * product.item.price;

      product.qty = newQty;
      cart.totalQty += qtyDifference;
      cart.totalPrice += priceDifference;

      return res.json({ totalQty: cart.totalQty, totalPrice: cart.totalPrice });
    },
  };
};

export default cartController;
