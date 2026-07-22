import User from "../models/User.js";
import Session from "../models/Session.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import ActivityLogService from "./ActivityLogService.js";


const REFRESH_TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 ngày (ms)

class AuthService {
  async register(email, username, password, full_name) {
    try {
      console.log("email: ", email);
      console.log("password: ", password);
      console.log("full_name: ", full_name);

      // CheckUser
      const user = await User.findOne({
        email: email,
      });

      if (user) {
        return {
          status: 400,
          data: {
            success: false,
            message: "Email đã tồn tại!",
          },
        };
      }

      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10); // Số 10 là số vòng băm (salt rounds)

      // Tạo User
      const newUser = new User({
        email: email,
        username: username,
        password: hashedPassword,
        full_name: full_name,
      });

      // Lưu User
      await newUser.save();

      return {
        status: 201,
        data: {
          success: true,
          message: "Đăng ký thành công!",
          user: newUser,
        },
      };
    } catch (error) {
      console.error("Lỗi đăng ký User:", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi server: " + error,
        },
      };
    }
  }

  async logIn(email, password) {
    try {
      console.log("email: ", email);
      console.log("password: ", password);

      const userCurrent = await User.findOne({ email });

      // KT Email
      if (!userCurrent) {
        console.log("Email không chính xác");
        return {
          status: 400,
          data: {
            success: false,
            message: "Email không chính xác",
          },
        };
      }

      // Kiểm tra mật khẩu
      const isPasswordValid = await bcrypt.compare(
        password,
        userCurrent.password,
      ); // So sánh mật khẩu nhập vào với mật khẩu đã mã hóa

      if (userCurrent.isActive !== true) {
        console.log("Tài khoản bị xoá");
        return {
          status: 400,
          data: {
            success: false,
            message: "Tài khoản bị xoá",
          },
        };
      }

      if (!isPasswordValid) {
        console.log("Mật khẩu không chính xác");
        return {
          status: 400,
          data: {
            success: false,
            message: "Mật khẩu không chính xác",
          },
        };
      }

      // tạo token

      const accessToken = jwt.sign(
        //payload
        {
          userId: userCurrent._id,
        },
        // signature
        process.env.ACCESS_TOKEN_SECRET, // bí mật để ký
        {
          expiresIn: process.env.ACCESS_TOKEN_TTL, // thời gian tồn tại của token
        },
      );

      // Tạo refreshToken với CRYPTO

      const refreshToken = crypto.randomBytes(64).toString("hex"); // Tạo chuỗi ngẫu nhiên dài 128 ký tự

      // Tạo session mới để lưu refresh Token vào DB

      await Session.create({
        userId: userCurrent._id,
        refreshToken: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      });

      // Đăng nhập thành công
      return {
        status: 200,
        data: {
          success: true,
          message: `User ${userCurrent.email} - ${userCurrent.full_name} đăng nhập thành công.`,
          user: userCurrent,
          accessToken: accessToken,
        },
        refreshToken: refreshToken,
      };
    } catch (error) {
      console.error("Lỗi đăng nhập User:", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi server: " + error,
        },
      };
    }
  }

  async logOut(refreshToken, req) {
    try {
      if (refreshToken) {
        const session = await Session.findOne({ refreshToken });
        if (session) {
          await ActivityLogService.log({
            userId: session.userId,
            action: "LOGOUT",
            entityType: "AUTH",
            req,
          });
          await Session.deleteOne({ _id: session._id });
        }
      }
      return {
        status: 200,
        data: {
          success: true,
          message: "Đăng xuất thành công",
        },
      };
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi server: " + error,
        },
      };
    }
  }

  async refreshToken(tokenFromCookie) {
    try {
      if (!tokenFromCookie) {
        return {
          status: 401,
          data: {
            success: false,
            message: "Không tìm thấy Refresh Token",
          },
        };
      }

      // Tìm session trong DB
      const session = await Session.findOne({ refreshToken: tokenFromCookie });
      if (!session) {
        return {
          status: 401,
          data: {
            success: false,
            message: "Refresh Token không hợp lệ",
          },
        };
      }

      // Kiểm tra hết hạn
      if (new Date() > session.expiresAt) {
        await Session.deleteOne({ refreshToken: tokenFromCookie });
        return {
          status: 401,
          data: {
            success: false,
            message: "Refresh Token đã hết hạn",
          },
        };
      }

      // Tìm User
      const user = await User.findById(session.userId);
      if (!user) {
        return {
          status: 404,
          data: {
            success: false,
            message: "User không tồn tại",
          },
        };
      }

      // Tạo Access Token mới
      const newAccessToken = jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_TTL },
      );

      return {
        status: 200,
        data: {
          success: true,
          token: newAccessToken,
        },
      };
    } catch (error) {
      console.error("Lỗi Refresh Token:", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi server: " + error.message,
        },
      };
    }
  }

  async test(req, res) {
    return res.status(200).json({ message: "Thành công", success: true });
  }
}

export default new AuthService();
