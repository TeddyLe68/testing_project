import User from "../../../models/user.js";
import bcrypt from "bcrypt";
import passport from "passport";

const authController = () => {
  const _getRedirectUrl = (user) =>
    user.role === "admin" ? "/admin/orders" : "/";

  const login = (req, res) => {
    res.render("auth/login");
  };

  const postLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      req.flash("error", "All fields are required");
      return res.redirect("/login");
    }

    passport.authenticate("local", (err, user, info) => {
      if (err) {
        req.flash("error", "Something went wrong");
        return next(err);
      }
      if (!user) {
        req.flash("error", info?.message || "Invalid email or password");
        return res.redirect("/login");
      }

      req.logIn(user, (err) => {
        if (err) {
          req.flash("error", "Login failed");
          return next(err);
        }
        return res.redirect(_getRedirectUrl(user));
      });
    })(req, res, next);
  };

  const register = (req, res) => {
    res.render("auth/register");
  };

  const postRegister = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      req.flash("error", "All fields are required");
      req.flash("name", name);
      req.flash("email", email);
      return res.redirect("/register");
    }
    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      req.flash("error", "Invalid email format");
      req.flash("name", name);
      req.flash("email", email);
      return res.redirect("/register");
    }
    // kiểm tra độ dài của mật khẩu
    if (password.length < 8) {
      req.flash("error", "Password must be at least 8 characters");
      req.flash("name", name);
      req.flash("email", email);
      return res.redirect("/register");
    }
    // Kiểm tra tên không chứa ký tự đặc biệt
    const nameRegex = /^[a-zA-Z0-9 ]+$/;
    if (!nameRegex.test(name)) {
      req.flash("error", "Name can only contain letters, numbers, and spaces");
      req.flash("name", name);
      req.flash("email", email);
      return res.redirect("/register");
    }

    try {
      const userExists = await User.exists({ email }).exec();
      if (userExists) {
        req.flash("error", "Email already taken");
        req.flash("name", name);
        req.flash("email", email);
        return res.redirect("/register");
      }
      // Tạo salt và mã hóa mật khẩu
      const salt = await bcrypt.genSalt(10); // Tạo salt với 10 rounds
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = new User({ name, email, password: hashedPassword });

      await user.save();
      // Điều hướng tới trang chủ
      return res.redirect("/");
    } catch (err) {
      req.flash("error", "Something went wrong");
      return res.redirect("/register");
    }
  };

  const logout = async (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      // // Xóa toàn bộ session
      // req.session.destroy((err) => {
      //   if (err) {
      //     return next(err);
      //   }
      // });
      // // Tên cookie mặc định của express-session
      // res.clearCookie("connect.sid");

      return res.redirect("/login");
    });
  };

  return { login, postLogin, register, postRegister, logout };
};

export default authController;
