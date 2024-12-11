import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/user.js";
import bcrypt from "bcrypt";

const init = (passport) => {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          // Tìm người dùng bằng email
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { message: "No user with this email" });
          }

          // Kiểm tra mật khẩu
          const isMatch = await bcrypt.compare(password, user.password);
          if (isMatch) {
            return done(null, user, { message: "Logged in successfully" });
          } else {
            return done(null, false, {
              message: "Incorrect email or password",
            });
          }
        } catch (error) {
          console.error("Error during authentication:", error);
          return done(error); // Trả về lỗi nếu có
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id); // Chỉ cần serialize user ID
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      if (user) {
        done(null, user); // Nếu tìm thấy user, trả về user
      } else {
        done(null, false); // Nếu không tìm thấy user, trả về false
      }
    } catch (error) {
      console.error("Error during deserialization:", error);
      done(error); // Trả về lỗi nếu có
    }
  });
};

export default init;
