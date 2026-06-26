import React, { useState } from "react";
import { register } from "../../services/AuthServices";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, UserCheck, Eye, EyeOff, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [registerForm, setRegisterForm] = useState({
    email: "",
    username: "",
    password: "",
    passwordCheck: "",
    full_name: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordCheck, setShowPasswordCheck] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn chặn hành vi reload mặc định của form
    console.log("registerForm: ", registerForm);

    try {
      setError("");
      if (registerForm.password !== registerForm.passwordCheck) {
        setError("Mật khẩu xác nhận phải giống nhau!");
        return;
      }

      setIsLoading(true);
      let res = await register(registerForm);
      if (res.success || res.data) {
        toast.success("Tạo tài khoản thành công! Vui lòng đăng nhập.");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (error) {
      console.log("Lỗi: ", error);
      setError(error.response?.data?.message || "Tạo tài khoản thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Tạo Tài Khoản
        </h2>
        <p className="text-slate-500 text-sm font-medium">
          Đăng ký để khám phá và kết nối trên PingUp
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0"></span>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 pl-1">
            Email *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={registerForm.email}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, email: e.target.value })
              }
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-slate-850 text-sm placeholder:text-slate-400"
              placeholder="nhap.email@viethoaduong.com"
              required
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 pl-1">
            Tên đăng nhập *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User size={18} />
            </div>
            <input
              type="text"
              value={registerForm.username}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, username: e.target.value })
              }
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-slate-850 text-sm placeholder:text-slate-400"
              placeholder="username_cua_ban"
              required
            />
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 pl-1">
            Họ và tên
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <UserCheck size={18} />
            </div>
            <input
              type="text"
              value={registerForm.full_name}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, full_name: e.target.value })
              }
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-slate-850 text-sm placeholder:text-slate-400"
              placeholder="Nguyễn Văn A"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 pl-1">
            Mật khẩu *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={registerForm.password}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, password: e.target.value })
              }
              className="w-full pl-11 pr-12 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-slate-850 text-sm placeholder:text-slate-400"
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

        {/* Password Check */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 pl-1">
            Xác nhận mật khẩu *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input
              type={showPasswordCheck ? "text" : "password"}
              value={registerForm.passwordCheck}
              onChange={(e) =>
                setRegisterForm({
                  ...registerForm,
                  passwordCheck: e.target.value,
                })
              }
              className="w-full pl-11 pr-12 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-slate-850 text-sm placeholder:text-slate-400"
              placeholder="Nhập lại mật khẩu"
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswordCheck(!showPasswordCheck)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPasswordCheck ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 mt-6 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transform active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Đăng Ký</span>
              <UserPlus size={18} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center border-t border-slate-100 pt-5">
        <p className="text-sm text-slate-500 font-medium">
          Đã có tài khoản?{" "}
          <Link
            to="/"
            className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
