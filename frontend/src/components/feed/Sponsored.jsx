import React from "react";
import { assets } from "../../assets/assets";

const Sponsored = () => {
  return (
    <div className="bg-white text-xs p-4 rounded-md shadow-sm border border-slate-100 flex flex-col gap-2.5">
      <h3 className="text-slate-800 font-bold text-[13px] tracking-wide">
        Sponsored
      </h3>
      <img
        src={assets.sponsored_img}
        className="w-full aspect-[3/2] object-cover rounded-lg"
        alt=""
      />
      <p className="text-slate-700 font-semibold text-[12px]">
        Email Marketing
      </p>
      <p className="text-slate-500 leading-relaxed">
        Superchange your marketing with a powerful, easy-to-use platform for
        result built
      </p>
    </div>
  );
};

export default Sponsored;
