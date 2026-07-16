import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

const DateRangeFilter = ({ onFilterChange }) => {
  const [preset, setPreset] = useState("all");
  const [customRange, setCustomRange] = useState({
    startDate: "",
    endDate: "",
  });

  const getFormatDate = (date) => {
    const yyyy = date.getFullYear();
    let mm = date.getMonth() + 1; // Months start at 0
    let dd = date.getDate();

    if (dd < 10) dd = "0" + dd;
    if (mm < 10) mm = "0" + mm;

    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    let start = "";
    let end = "";
    const today = new Date();

    if (preset === "today") {
      start = getFormatDate(today);
      end = getFormatDate(today);
    } else if (preset === "yesterday") {
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      start = getFormatDate(yesterday);
      end = getFormatDate(yesterday);
    } else if (preset === "last7days") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      start = getFormatDate(sevenDaysAgo);
      end = getFormatDate(today);
    } else if (preset === "thismonth") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      start = getFormatDate(firstDay);
      end = getFormatDate(today);
    } else if (preset === "custom") {
      start = customRange.startDate;
      end = customRange.endDate;
    }

    onFilterChange({ startDate: start, endDate: end });
  }, [preset, customRange]);

  const handleCustomChange = (e) => {
    const { name, value } = e.target;
    setCustomRange((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Preset select */}
      <div className="flex items-center gap-1.5 rounded-lg border border-input bg-transparent px-2 py-1 text-sm">
        <Calendar className="size-3.5 text-muted-foreground" />
        <select
          className="bg-transparent text-sm outline-none cursor-pointer pr-1"
          value={preset}
          onChange={(e) => setPreset(e.target.value)}
        >
          <option value="all">Tất cả thời gian</option>
          <option value="today">Hôm nay</option>
          <option value="yesterday">Hôm qua</option>
          <option value="last7days">7 ngày qua</option>
          <option value="thismonth">Tháng này</option>
          <option value="custom">Tự chọn (a-b)</option>
        </select>
      </div>

      {/* Custom range inputs */}
      {preset === "custom" && (
        <div className="flex items-center gap-1.5 animate-in slide-in-from-left duration-200">
          <Input
            type="date"
            name="startDate"
            className="h-8 py-1 px-2 text-xs w-36"
            value={customRange.startDate}
            onChange={handleCustomChange}
          />
          <span className="text-xs text-muted-foreground">đến</span>
          <Input
            type="date"
            name="endDate"
            className="h-8 py-1 px-2 text-xs w-36"
            value={customRange.endDate}
            onChange={handleCustomChange}
          />
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
