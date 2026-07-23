import React from "react";
import { UserCheck, ArrowRight } from "lucide-react";

const LeadCampaignCard = ({ item, onSelect, isAdmin }) => {
  const { campaign, advertiser, leadsList } = item;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group">
      
      {/* Campaign Media Banner */}
      <div className="w-full h-36 bg-slate-100 dark:bg-zinc-950 overflow-hidden relative border-b border-slate-100 dark:border-zinc-800/50">
        {campaign.mediaUrl ? (
          campaign.mediaUrl.endsWith(".mp4") || campaign.mediaUrl.includes("video") ? (
            <video src={campaign.mediaUrl} className="w-full h-full object-cover" muted loop autoPlay />
          ) : (
            <img 
              src={campaign.mediaUrl} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              alt={campaign.title} 
            />
          )
        ) : (
          <div className="w-full h-full bg-linear-to-br from-indigo-50 to-indigo-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center">
            <span className="text-indigo-400 dark:text-zinc-700 text-xs font-semibold uppercase tracking-wider">No Media Banner</span>
          </div>
        )}
        
        {/* Category tag */}
        <span className="absolute top-3 left-3 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold px-2.5 py-0.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs shadow-xs rounded-full">
          {campaign.category || "Khác"}
        </span>

        {/* Lead Count Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs shadow-xs px-2.5 py-0.5 rounded-full border border-emerald-50/55">
          <UserCheck className="h-3 w-3" />
          <span>{leadsList.length} Leads</span>
        </div>
      </div>

      {/* Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-base line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {campaign.title}
          </h3>
          
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
            Mã ID: <span className="font-mono bg-slate-50 dark:bg-zinc-950 px-1.5 py-0.5 rounded text-slate-500 select-all">{campaign._id}</span>
          </p>

          {isAdmin && (
            <div className="text-[11px] text-slate-500 border-t border-slate-50 dark:border-zinc-800/80 pt-2.5 flex justify-between items-center">
              <span className="text-slate-400">Nhà quảng cáo:</span>
              <strong className="text-slate-700 dark:text-zinc-300">{advertiser?.full_name || "N/A"}</strong>
            </div>
          )}
        </div>

        <button
          onClick={() => onSelect(campaign)}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:shadow-md"
        >
          <span>Xem danh sách câu trả lời</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </div>
  );
};

export default LeadCampaignCard;
