import React from "react";
import { MessageSquare, Star, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FeedbackStatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Tổng số phản hồi
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">
              {stats.totalCount} phản hồi
            </h3>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-500 flex items-center justify-center">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Đánh giá trung bình
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">
              {stats.avgRating} / 5.0
            </h3>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Báo cáo lỗi hoạt động
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">
              {stats.bugCount} lỗi đang hoạt động
            </h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackStatsCards;