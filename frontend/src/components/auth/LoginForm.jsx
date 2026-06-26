import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { login } from "../../services/AuthServices";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";

const LoginForm = () => {
  const { login: loginAuth } = useAuth();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn chặn hành vi reload mặc định của form
    console.log("loginForm: ", loginForm);

    try {
      setError("");
      setIsLoading(true);

      let res = await login(loginForm);

      await loginAuth(res.data.user, res.data.accessToken);

      toast.success("Đăng nhập thành công!", {
        duration: 3000,
      });

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.log("Lỗi: ", error);
      setError(error.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Chào mừng quay lại!
        </h2>
        <p className="text-slate-500 text-sm font-medium">
          Đăng nhập để kết nối với cộng đồng PingUp
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0"></span>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 pl-1">
            Email của bạn *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target.value })
              }
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-blue-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-slate-850 text-sm placeholder:text-slate-400"
              placeholder="nhap.email@viethoaduong.com"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 pl-1">
            Mật khẩu *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
              className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 focus:border-blue-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-slate-850 text-sm placeholder:text-slate-400"
              placeholder="Nhập mật khẩu"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-4 mt-6 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transform active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Đăng Nhập</span>
              <LogIn size={18} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center border-t border-slate-100 pt-6">
        <p className="text-sm text-slate-500 font-medium">
          Bạn chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
