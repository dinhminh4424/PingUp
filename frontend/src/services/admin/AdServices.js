import api from "../../lib/axios";

// Phân phối và Tracking (Dành cho Client / Người dùng cuối)
export const serveAds = async (placementCode) => {
  const res = await api.get(`/api/ads/serve`, {
    params: { placement: placementCode },
  });
  return res.data;
};

export const trackEvent = async (campaignId, eventType, placement) => {
  const res = await api.post(`/api/ads/track`, {
    campaignId,
    eventType,
    placement,
  });
  return res.data;
};

// Quản lý Chiến dịch (Dành cho Advertiser / Người tạo quảng cáo)
export const createCampaign = async (formData) => {
  const res = await api.post("/api/ads/campaigns", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateCampaign = async (id, formData) => {
  const res = await api.put(`/api/ads/campaigns/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const toggleCampaignStatus = async (id, status) => {
  const res = await api.put(`/api/ads/campaigns/${id}/status`, { status });
  return res.data;
};

// Quản trị viên (Dành cho Admin)
export const getAdminCampaigns = async () => {
  const res = await api.get("/api/admin/ads/campaigns");
  return res.data;
};

export const reviewCampaign = async (id, status, rejectionReason = "") => {
  const res = await api.put(`/api/admin/ads/campaigns/${id}/review`, {
    status,
    rejectionReason,
  });
  return res.data;
};

export const deleteCampaign = async (id) => {
  const res = await api.delete(`/api/admin/ads/campaigns/${id}`);
  return res.data;
};

export const submitLead = async (id, answers) => {
  const res = await api.post(`/api/ads/campaigns/${id}/lead`, { answers });
  return res.data;
};

export const getLeads = async () => {
  const res = await api.get("/api/ads/leads");
  return res.data;
};

export const getAdminLeads = async () => {
  const res = await api.get("/api/admin/ads/leads");
  return res.data;
};

export const deleteLead = async (id) => {
  const res = await api.delete(`/api/ads/leads/${id}`);
  return res.data;
};
