import Order from "../../../models/order.js";

const orderController = () => {
  return {
    index: async (req, res) => {
      try {
        // Tìm tất cả đơn hàng có trạng thái khác "completed", sắp xếp theo ngày tạo
        const orders = await Order.find({ status: { $ne: "completed" } })
          .populate("customerId", "-password")
          .sort({ createdAt: -1 });

        // Kiểm tra nếu yêu cầu là AJAX
        if (req.xhr) {
          return res.json(orders);
        } else {
          return res.render("admin/orders", { orders });
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        // Xử lý lỗi, có thể render trang lỗi hoặc trả về lỗi
        return res.status(500).json({ message: "Internal server error" });
      }
    },
  };
};

export default orderController;
