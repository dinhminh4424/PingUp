import React from "react";
import { assets } from "../../assets/assets";
import AdContainer from "../ads/AdContainer";

const Sponsored = () => {
  // Thử tải quảng cáo động, nếu không có quảng cáo hoạt động thì AdContainer sẽ trả về null
  // Lúc đó có thể hiển thị quảng cáo mặc định như một Fallback.
  return (
    <div className="bg-white dark:bg-zinc-900 text-xs p-4 rounded-md shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col gap-2.5 transition-colors duration-200">
      <AdContainer
        placementCode="SIDEBAR_SPONSORED"
        className="w-full flex flex-col gap-2.5"
      />
      {/* Nút hoặc phần fallback tĩnh khi không có quảng cáo động phù hợp */}
      <StaticFallback />
    </div>
  );
};

// Component con hiển thị tĩnh làm fallback dự phòng
const StaticFallback = () => {
  return (
    <div className="flex flex-col gap-2.5 border-t border-slate-100 dark:border-zinc-800 pt-2.5 mt-1">
      <div className="flex justify-between items-center">
        <p className="text-slate-700 dark:text-zinc-200 font-semibold text-[12px]">
          Email Marketing
        </p>
        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">
          {/* Dự phòng */}
        </span>
      </div>
      <img
        src={assets.sponsored_img}
        className="w-full aspect-[3/2] object-cover rounded-lg"
        alt="Static Sponsor"
      />
      <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
        Superchange your marketing with a powerful, easy-to-use platform for
        results built.
      </p>
    </div>
  );
};

export default Sponsored;
