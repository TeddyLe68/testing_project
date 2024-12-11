import Menu from "../../models/menu.js";

const homeController = () => {
  return {
    async index(req, res) {
      try {
        // Lấy tất cả pizza từ menu
        const pizzas = await Menu.find();

        // Render trang home với danh sách pizza
        return res.render("home", { pizzas });
      } catch (error) {
        console.error("Error fetching pizzas:", error);
        // Xử lý lỗi, có thể render một trang lỗi hoặc trả về thông báo lỗi
        return res
          .status(500)
          .render("error", { message: "Internal server error" });
      }
    },
  };
};

export default homeController;
