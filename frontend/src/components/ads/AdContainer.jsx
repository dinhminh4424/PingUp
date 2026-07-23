import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { serveAds, trackEvent, submitLead } from "../../services/admin/AdServices";
import { 
  ArrowRight, ShoppingCart, Mail, Info, MessageCircle, Play, Download, Phone, UserCheck, Gift, Send, X 
} from "lucide-react";
import toast from "react-hot-toast";

const AdContainer = ({ placementCode, className }) => {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLeadForm, setShowLeadForm] = useState(false);
  
  const [answers, setAnswers] = useState({});
  const [submittingLead, setSubmittingLead] = useState(false);
  
  const adRef = useRef(null);
  const tracked = useRef(false);

  useEffect(() => {
    let isMounted = true;
    serveAds(placementCode)
      .then((data) => {
        if (isMounted) {
          setAd(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải quảng cáo:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [placementCode]);

  useEffect(() => {
    if (!ad || tracked.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !tracked.current) {
          tracked.current = true;
          trackEvent(ad._id, "impression", placementCode).catch((err) =>
            console.error("Lỗi ghi nhận hiển thị quảng cáo:", err)
          );
        }
      },
      { threshold: 0.2 }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ad, placementCode]);

  const getLeadFormFields = () => {
    return ad.leadFormConfig?.fields && ad.leadFormConfig.fields.length > 0
      ? ad.leadFormConfig.fields
      : [
          { label: "Họ và tên", fieldType: "text", required: true, options: [] },
          { label: "Số điện thoại", fieldType: "tel", required: true, options: [] }
        ];
  };

  const handleCtaClick = (e, btn) => {
    trackEvent(ad._id, "click", placementCode).catch((err) =>
      console.error("Lỗi ghi nhận click quảng cáo:", err)
    );

    if (btn.actionType === "lead_form") {
      e.preventDefault();
      const initialAnswers = {};
      const fields = getLeadFormFields();
      fields.forEach((f) => {
        initialAnswers[f.label] = f.fieldType === "select" ? (f.options?.[0] || "") : "";
      });
      setAnswers(initialAnswers);
      setShowLeadForm(true); // Mở Modal
    }
  };

  const handleMainClick = () => {
    trackEvent(ad._id, "click", placementCode).catch((err) =>
      console.error("Lỗi ghi nhận click quảng cáo:", err)
    );
  };

  const handleInputChange = (label, val) => {
    setAnswers((prev) => ({ ...prev, [label]: val }));
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();

    const fields = getLeadFormFields();
    for (const f of fields) {
      const val = answers[f.label];
      const hasValue = f.fieldType === "file" ? !!val : !!(typeof val === "string" ? val.trim() : val);
      if (f.required && !hasValue) {
        toast.error(`Vui lòng điền thông tin: ${f.label}`);
        return;
      }
    }

    const answersArray = fields.map((f, index) => {
      let val = answers[f.label];
      if (f.fieldType === "range" && val === undefined) {
        val = String(f.min ?? 0);
      }
      return {
        label: f.label,
        value: val instanceof File ? "" : (val || ""),
        fieldType: f.fieldType,
        fileKey: f.fieldType === "file" && val instanceof File ? `file_${index}` : undefined,
      };
    });

    try {
      setSubmittingLead(true);
      
      const formData = new FormData();
      formData.append("answers", JSON.stringify(answersArray));
      
      fields.forEach((f, index) => {
        if (f.fieldType === "file" && answers[f.label] instanceof File) {
          formData.append(`file_${index}`, answers[f.label]);
        }
      });

      const res = await submitLead(ad._id, formData);
      if (res?.success) {
        toast.success("Gửi thông tin thành công! Chúng tôi sẽ liên hệ sớm.");
        setShowLeadForm(false);
        setAnswers({});
      }
    } catch (err) {
      console.error(err);
      toast.error("Gửi thông tin thất bại, vui lòng thử lại.");
    } finally {
      setSubmittingLead(false);
    }
  };

  const isVideoUrl = (url) => {
    if (!url) return false;
    return (
      url.endsWith(".mp4") ||
      url.endsWith(".webm") ||
      url.endsWith(".ogg") ||
      url.includes("/video/upload/")
    );
  };

  const getCtaIcon = (iconName, color) => {
    const style = color ? { color } : {};
    switch (iconName) {
      case "ShoppingCart": return <ShoppingCart className="h-3.5 w-3.5" style={style} />;
      case "Mail": return <Mail className="h-3.5 w-3.5" style={style} />;
      case "Info": return <Info className="h-3.5 w-3.5" style={style} />;
      case "MessageCircle": return <MessageCircle className="h-3.5 w-3.5" style={style} />;
      case "Play": return <Play className="h-3.5 w-3.5" style={style} />;
      case "Download": return <Download className="h-3.5 w-3.5" style={style} />;
      case "Phone": return <Phone className="h-3.5 w-3.5" style={style} />;
      case "UserCheck": return <UserCheck className="h-3.5 w-3.5" style={style} />;
      case "Gift": return <Gift className="h-3.5 w-3.5" style={style} />;
      default: return <ArrowRight className="h-3.5 w-3.5" style={style} />;
    }
  };

  if (loading) {
    return (
      <div className={`${className} animate-pulse flex flex-col gap-2`}>
        <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/4"></div>
        <div className="w-full aspect-[3/2] bg-slate-200 dark:bg-zinc-800 rounded-lg"></div>
        <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-3/4"></div>
        <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-full"></div>
      </div>
    );
  }

  if (!ad) return null;

  return (
    <div ref={adRef} className={className} style={{ position: "relative" }}>
      <div className="w-full h-full flex flex-col gap-2.5">
        
        {/* Linkable Image / Video Header */}
        <a
          href={ad.targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleMainClick}
          className="block hover:opacity-95 transition-opacity"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex flex-col">
              <span className="text-slate-800 dark:text-zinc-200 font-bold text-[13px] tracking-wide line-clamp-1">
                {ad.title}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                Chủ đề: <strong className="text-slate-600 dark:text-zinc-300">{ad.category || "Khác"}</strong>
              </span>
            </div>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-full shrink-0">
              Được tài trợ
            </span>
          </div>

          {/* Media (Image / Video) */}
          {ad.mediaUrl && (
            <div className="w-full aspect-[3/2] overflow-hidden rounded-lg bg-slate-50 dark:bg-zinc-950">
              {isVideoUrl(ad.mediaUrl) ? (
                <video
                  src={ad.mediaUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                />
              ) : (
                <img
                  src={ad.mediaUrl}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  alt={ad.title}
                />
              )}
            </div>
          )}
        </a>

        {/* Content */}
        <p className="text-slate-500 dark:text-zinc-400 leading-relaxed text-[12px] line-clamp-2">
          {ad.content}
        </p>

        {/* Dynamic CTA buttons list render with Colors & Icons */}
        {(() => {
          const ctaButtonsList = ad.ctaButtons && ad.ctaButtons.length > 0
            ? ad.ctaButtons
            : [{ label: "Tìm hiểu thêm", actionType: "link", actionUrl: ad.targetUrl, icon: "ArrowRight", backgroundColor: "#4f46e5", textColor: "#ffffff", iconColor: "#ffffff" }];
          
          return (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50 dark:border-zinc-800/80">
              {ctaButtonsList.map((btn, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => handleCtaClick(e, btn)}
                  style={{
                    backgroundColor: btn.backgroundColor || "#4f46e5",
                    color: btn.textColor || "#ffffff",
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-[11px] font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer hover:opacity-90"
                >
                  <span>{btn.label}</span>
                  {getCtaIcon(btn.icon, btn.iconColor || btn.textColor || "#ffffff")}
                </button>
              ))}
            </div>
          );
        })()}

      </div>

      {/* LEAD FORM MODAL OVERLAY (Sử dụng React Portal để trỏ trực tiếp ra body, tránh lỗi transform) */}
      {showLeadForm && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative text-left flex flex-col max-h-[90vh]">
            
            {/* Banner image for Form */}
            {ad.leadFormConfig?.imageUrl && (
              <div className="w-full aspect-[3/1] overflow-hidden bg-slate-100 border-b border-slate-200/50 shrink-0">
                <img src={ad.leadFormConfig.imageUrl} className="w-full h-full object-cover" alt="Form Header Banner" />
              </div>
            )}

            <button
              onClick={() => setShowLeadForm(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs shadow-xs"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto no-scrollbar" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {ad.leadFormConfig?.title || "Đăng ký tư vấn / Nhận ưu đãi"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  {ad.leadFormConfig?.description || "Nhập thông tin bên dưới để kết nối với chúng tôi."}
                </p>
              </div>

              <form onSubmit={handleLeadSubmit} className="space-y-4">
                {getLeadFormFields().map((field, idx) => (
                  <div key={idx}>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>
                    
                    {field.fieldType === "textarea" ? (
                      <textarea
                        required={field.required}
                        value={answers[field.label] || ""}
                        onChange={(e) => handleInputChange(field.label, e.target.value)}
                        rows="3"
                        placeholder={`Nhập ${field.label.toLowerCase()}...`}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : field.fieldType === "select" ? (
                      <select
                        required={field.required}
                        value={answers[field.label] || ""}
                        onChange={(e) => handleInputChange(field.label, e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {field.options && field.options.length > 0 ? (
                          field.options.map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>{opt}</option>
                          ))
                        ) : (
                          <option value="">Chưa cấu hình các lựa chọn</option>
                        )}
                      </select>
                    ) : field.fieldType === "radio" ? (
                      <div className="flex flex-wrap gap-4 pt-1">
                        {field.options && field.options.length > 0 ? (
                          field.options.map((opt, oIdx) => (
                            <label key={oIdx} className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-zinc-300 cursor-pointer">
                              <input
                                type="radio"
                                required={field.required}
                                name={`radio_${field.label}`}
                                value={opt}
                                checked={answers[field.label] === opt}
                                onChange={(e) => handleInputChange(field.label, e.target.value)}
                                className="h-4 w-4 border border-slate-300 dark:border-zinc-800 text-indigo-600 focus:ring-0"
                              />
                              <span>{opt}</span>
                            </label>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">Chưa cấu hình các lựa chọn</span>
                        )}
                      </div>
                    ) : field.fieldType === "range" ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <input
                            type="range"
                            min={field.min ?? 0}
                            max={field.max ?? 100}
                            step={field.step ?? 1}
                            required={field.required}
                            value={answers[field.label] || field.min || 0}
                            onChange={(e) => handleInputChange(field.label, e.target.value)}
                            className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                          <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 pl-4">
                            {answers[field.label] || field.min || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Min: {field.min ?? 0}</span>
                          <span>Max: {field.max ?? 100}</span>
                        </div>
                      </div>
                    ) : field.fieldType === "file" ? (
                      <div className="space-y-2">
                        {answers[field.label] ? (
                          <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-zinc-850/50 dark:bg-zinc-950/20">
                            {answers[field.label] instanceof File ? (
                              answers[field.label].type.startsWith("image/") ? (
                                <img
                                  src={URL.createObjectURL(answers[field.label])}
                                  className="h-10 w-10 rounded-lg object-cover border border-slate-200 dark:border-zinc-700 bg-white"
                                  alt=""
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-indigo-600 font-bold text-[10px] uppercase">
                                  File
                                </div>
                              )
                            ) : (
                              typeof answers[field.label] === "string" && answers[field.label].match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                                <img
                                  src={answers[field.label]}
                                  className="h-10 w-10 rounded-lg object-cover border border-slate-200 dark:border-zinc-700 bg-white"
                                  alt=""
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-indigo-600 font-bold text-[10px] uppercase">
                                  File
                                </div>
                              )
                            )}
                            <div className="flex-1 min-w-0">
                              {answers[field.label] instanceof File ? (
                                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 truncate block">
                                  {answers[field.label].name}
                                </span>
                              ) : (
                                <a
                                  href={answers[field.label]}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate block"
                                >
                                  {answers[field.label].split("/").pop().slice(-30)}
                                </a>
                              )}
                              <span className="text-[9px] text-emerald-500 block font-medium">Tệp đã chọn</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleInputChange(field.label, "")}
                              className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
                            >
                              Xóa
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                              type="file"
                              required={field.required && !answers[field.label]}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                handleInputChange(field.label, file);
                              }}
                              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer border border-slate-200 dark:border-zinc-800 rounded-lg p-1.5"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type={field.fieldType}
                        required={field.required}
                        value={answers[field.label] || ""}
                        onChange={(e) => handleInputChange(field.label, e.target.value)}
                        placeholder={`Nhập ${field.label.toLowerCase()}...`}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={submittingLead}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {submittingLead ? "Đang gửi thông tin..." : "Gửi thông tin"}
                </button>
              </form>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdContainer;
