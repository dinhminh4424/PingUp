import React from "react";
import { assets } from "../../assets/assets";

const Sponsored = () => {
  return (
    <div className="bg-white dark:bg-zinc-900 text-xs p-4 rounded-md shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col gap-2.5 transition-colors duration-200">
      <h3 className="text-slate-800 dark:text-zinc-200 font-bold text-[13px] tracking-wide">
        Sponsored
      </h3>
      <img
        src={assets.sponsored_img}
        className="w-full aspect-[3/2] object-cover rounded-lg"
        alt=""
      />
      <p className="text-slate-700 dark:text-zinc-200 font-semibold text-[12px]">
        Email Marketing
      </p>
      <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
        Superchange your marketing with a powerful, easy-to-use platform for
        result built
      </p>
    </div>
  );
};

export default Sponsored;
