import mongoose from "mongoose";
import Order from "../../../models/order.js";
import moment from "moment";
// import stripePackage from "stripe";

// const stripe = stripePackage(process.env.STRIPE_PRIVATE_KEY);

const orderController = () => {
  return {
    async store(req, res) {
      const { phone, address, paymentType } = req.body;
      if (!phone || !address) {
        return res.status(422).json({ message: "All fields are required" });
      }

      try {
        const order = new Order({
          customerId: req.user._id,
          items: req.session.cart.items,
          phone,
          address,
        });

        const result = await order.save();
        const placedOrder = await Order.populate(result, {
          path: "customerId",
        });

        if (paymentType === "card") {
          try {
            await stripe.charges.create({
              amount: req.session.cart.totalPrice * 100,
              source: stripeToken,
              currency: "inr",
              description: `Pizza order: ${placedOrder._id}`,
            });

            placedOrder.paymentStatus = true;
            placedOrder.paymentType = paymentType;
            const ord = await placedOrder.save();

            const eventEmitter = req.app.get("eventEmitter");
            eventEmitter.emit("orderPlaced", ord);
            delete req.session.cart;
            return res.json({
              message: "Payment successful, Order placed successfully",
            });
          } catch (err) {
            delete req.session.cart;
            return res.json({
              message:
                "Order placed but payment failed, You can pay at delivery time",
            });
          }
        } else {
          delete req.session.cart;
          return res.json({ message: "Order placed successfully" });
        }
      } catch (err) {
        return res.status(500).json({ message: "Something went wrong" });
      }
    },

    async index(req, res) {
      try {
        const orders = await Order.find({ customerId: req.user._id }, null, {
          sort: { createdAt: -1 },
        });
        res.header("Cache-Control", "no-store");
        res.render("customers/orders", { orders, moment });
      } catch (err) {
        return res.status(500).json({ message: "Something went wrong" });
      }
    },

    async show(req, res) {
      try {
        const order = await Order.findById(req.params.id);
        if (req.user._id.toString() === order.customerId.toString()) {
          return res.render("customers/singleOrder", { order });
        }
        return res.redirect("/");
      } catch (err) {
        return res.status(500).json({ message: "Something went wrong" });
      }
    },
    async delete(req, res) {
      try {
        // Kiểm tra tính hợp lệ của ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(400).json({ message: "Invalid order ID" });
        }

        // Tìm order theo ID
        const order = await Order.findById(req.params.id);
        if (!order) {
          return res.status(404).json({ message: "Order not found" });
        }

        // Xác minh người dùng có quyền xóa
        if (!req.user || !req.user._id) {
          return res.status(403).json({ message: "Unauthorized user" });
        }

        // So sánh quyền sở hữu của user
        if (req.user._id.toString() !== order.customerId.toString()) {
          return res
            .status(403)
            .json({ message: "You cannot delete this order" });
        }

        // Sử dụng deleteOne() để xóa tài liệu
        await Order.deleteOne({ _id: req.params.id });

        // Redirect về trang đơn hàng của khách hàng
        return res.json({ success: "Order deleted successfully" });
      } catch (err) {
        // Ghi log lỗi và trả về phản hồi lỗi
        console.error(err);
        return res
          .status(500)
          .json({ message: "Something went wrong", error: err.message });
      }
    },
  };
};

export default orderController;
