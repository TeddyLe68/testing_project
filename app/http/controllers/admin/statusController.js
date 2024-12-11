import Order from "../../../models/order.js";

const statusController = () => {
  return {
    async update(req, res) {
      try {
        // Cập nhật trạng thái đơn hàng
        await Order.updateOne(
          { _id: req.body.orderId },
          { status: req.body.status }
        );

        // Emit event
        const eventEmitter = req.app.get("eventEmitter");
        eventEmitter.emit("orderUpdated", {
          id: req.body.orderId,
          status: req.body.status,
        });

        // Chuyển hướng về trang đơn hàng
        return res.redirect("/admin/orders");
      } catch (err) {
        console.error("Error updating order status:", err);
        // Chuyển hướng đến trang đơn hàng với thông báo lỗi
        req.flash("error", "Something went wrong while updating the order.");
        return res.redirect("/admin/orders");
      }
    },
  };
};

export default statusController;
