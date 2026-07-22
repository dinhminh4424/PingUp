import React from "react";
import { Calendar, Eye, Trash2 } from "lucide-react";

const LeadTableRow = ({ lead, onViewDetails, onDelete }) => {
  return (
    <tr className="hover:bg-slate-50/50 dark:hover:bg-zinc-950/30 transition border-b border-slate-100 dark:border-zinc-800/60">
      
      {/* Registration Time */}
      <td className="p-4 whitespace-nowrap text-slate-500">
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500">
          <Calendar className="h-3.5 w-3.5" />
          <span className="text-[11px] font-medium">
            {new Date(lead.createdAt).toLocaleString("vi-VN")}
          </span>
        </div>
      </td>

      {/* User Information */}
      <td className="p-4">
        <div className="flex items-center gap-2.5">
          {lead.user?.profile_picture ? (
            <img
              src={lead.user.profile_picture}
              className="h-8 w-8 rounded-full object-cover shadow-xs border border-slate-100 dark:border-zinc-800"
              alt=""
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 uppercase text-xs">
              {(lead.user?.full_name || "K")[0]}
            </div>
          )}
          <div>
            <div className="font-semibold text-slate-900 dark:text-white text-xs">
              {lead.user?.full_name || "Khách vãng lai"}
            </div>
            {lead.user?.email && (
              <div className="text-[10px] text-slate-400 dark:text-zinc-500">{lead.user.email}</div>
            )}
          </div>
        </div>
      </td>

      {/* View Action Button */}
      <td className="p-4 whitespace-nowrap">
        <button
          onClick={() => onViewDetails(lead)}
          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-indigo-600 dark:text-indigo-300 font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer text-[11px]"
        >
          <Eye className="h-3.5 w-3.5" />
          Xem câu trả lời ({lead.answers?.length || 0})
        </button>
      </td>

      {/* Delete Action Button */}
      <td className="p-4 whitespace-nowrap text-center">
        <button
          onClick={() => onDelete(lead._id)}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
          title="Xóa thông tin này"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>

    </tr>
  );
};

export default LeadTableRow;
