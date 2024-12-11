import homeController from "../app/http/controllers/homeController.js";
import authController from "../app/http/controllers/auth/authController.js";
import cartController from "../app/http/controllers/customers/cartController.js";
import orderController from "../app/http/controllers/customers/orderController.js";
import adminOrderController from "../app/http/controllers/admin/orderController.js";
import statusController from "../app/http/controllers/admin/statusController.js";

// Middlewares
import guest from "../app/http/middlewares/guest.js";
import auth from "../app/http/middlewares/auth.js";
import admin from "../app/http/middlewares/admin.js";

function initRoutes(app) {
  app.get("/", homeController().index);
  app.get("/login", guest, authController().login);
  app.post("/login", authController().postLogin);
  app.get("/register", guest, authController().register);
  app.post("/register", authController().postRegister);
  app.post("/logout", authController().logout);

  app.get("/cart", cartController().index);
  app.post("/update-cart", cartController().update);
  app.post("/cart/update-quantity", cartController().updateQuantity); // Route mới
  app.post("/cart/remove", cartController().remove); // Route mới

  // Customer routes
  app.post("/orders", auth, orderController().store);
  app.get("/customer/orders", auth, orderController().index);
  app.get("/customer/orders/:id", auth, orderController().show);
  app.delete("/customer/orders/remove/:id", auth, orderController().delete);

  // Admin routes
  app.get("/admin/orders", admin, adminOrderController().index);
  app.post("/admin/order/status", admin, statusController().update);
}

export default initRoutes;
