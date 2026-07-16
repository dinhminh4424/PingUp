import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Star, Clock, CheckCircle } from "lucide-react";

const FeedbackDetailModal = ({ isOpen, onClose, feedback, onMarkReviewed }) => {
  if (!feedback) return null;

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] rounded-3xl p-6">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 pb-4 border-b border-slate-100">
          <MessageSquare className="w-6 h-6 text-indigo-600" />
          <DialogTitle className="text-xl font-bold text-gray-900">
            Feedback Details
          </DialogTitle>
        </DialogHeader>

        <DialogDescription className="hidden">
          Detailed view of the user feedback submission.
        </DialogDescription>

        <div className="py-6 flex flex-col gap-6 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
          {/* User Profile */}
          <div className="flex items-center gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/60">
            <Avatar className="w-12 h-12 border border-slate-200 shadow-sm">
              <AvatarImage
                src={feedback.userId?.profile_picture}
                className="object-cover"
              />
              <AvatarFallback className="bg-indigo-50 text-indigo-700 font-semibold">
                {getInitials(feedback.userId?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-bold text-gray-800">
                {feedback.userId?.full_name || "Anonymous User"}
              </h4>
              <p className="text-xs text-gray-400">
                @{feedback.userId?.username || "anonymous"}
              </p>
            </div>
          </div>

          {/* Rating and Category Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Category
              </span>
              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider ${
                    feedback.category === "bug"
                      ? "bg-rose-50 text-rose-700"
                      : feedback.category === "suggestion"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-indigo-50 text-indigo-700"
                  }`}
                >
                  {feedback.category}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Rating
              </span>
              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: feedback.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
                {Array.from({ length: 5 - feedback.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-slate-200" />
                ))}
              </div>
            </div>
          </div>

          {/* Message Text */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              User Message
            </span>
            <p className="text-slate-700 bg-slate-50/20 border border-slate-100 p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap">
              {feedback.comment}
            </p>
          </div>

          {/* Media Attachments */}
          {feedback.media && feedback.media.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Attachments
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {feedback.media.map((url, i) => {
                  const isVideo =
                    url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes("/video");
                  return (
                    <div
                      key={i}
                      className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-100/50 shadow-sm"
                    >
                      {isVideo ? (
                        <video
                          src={url}
                          className="w-full h-full object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover cursor-zoom-in hover:opacity-95 transition"
                          onClick={() => window.open(url, "_blank")}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-slate-100 pt-4 flex gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl cursor-pointer"
          >
            Close
          </Button>
          {feedback.status === "New" && onMarkReviewed && (
            <Button
              type="button"
              onClick={() => {
                onMarkReviewed(feedback._id);
                onClose();
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Reviewed
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDetailModal;
