import React from "react";
import { Link } from "react-router-dom";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { assets } from "../assets/assets";

const NotFound = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background image matching the Login/Register page */}
      {assets.bgImage && (
        <img
          src={assets.bgImage}
          className="absolute top-0 left-0 -z-1 w-full h-full object-cover"
          alt=""
        />
      )}

      {/* Glassmorphic content card */}
      <div className="w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 md:p-12 text-center relative z-10 transition-all duration-300 hover:shadow-2xl">
        {/* Animated Icon Container */}
        <div className="inline-flex p-5 rounded-full bg-blue-50 border border-blue-100/50 shadow-sm mb-6 animate-bounce duration-[3000ms]">
          <FileQuestion size={48} className="text-blue-600" />
        </div>

        {/* 404 text with gradient */}
        <h1 className="text-7xl md:text-8xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent select-none mb-3">
          404
        </h1>

        {/* Status Message */}
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Không tìm thấy trang
        </h2>

        {/* Detail text */}
        <p className="text-slate-500 text-sm md:text-base mb-8 max-w-sm mx-auto leading-relaxed font-medium">
          Đường liên kết bạn vừa truy cập có thể bị hỏng hoặc trang này đã bị xóa hoặc di chuyển đi nơi khác.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer active:scale-95 border border-slate-200/50"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-bold shadow-md shadow-blue-500/15 hover:shadow-blue-500/25 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Home size={16} />
            Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
