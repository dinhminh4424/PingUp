import AdCampaign from "../models/AdCampaign.js";
import AdLog from "../models/AdLog.js";
import AdPlacement from "../models/AdPlacement.js";
import AdLead from "../models/AdLead.js";
import { uploadImageFromBuffer } from "../middlewares/UpLoadMiddleware.js";

class AdService {
  async createCampaign(campaignData, file, advertiserId) {
    try {
      const {
        title,
        content,
        targetUrl,
        pricingModel,
        budgetTotal,
        dailyLimit,
        targeting,
        category,
        displayPlacements,
        ctaButtons,
        leadFormConfig,
      } = campaignData;

      if (!title || !content || !targetUrl || !budgetTotal) {
        return {
          status: 400,
          data: { success: false, message: "Vui lòng nhập đầy đủ thông tin quảng cáo" },
        };
      }

      let mediaUrl = "";
      if (file) {
        const uploadResult = await uploadImageFromBuffer(file.buffer, {
          folder: "pingup_ads",
          resource_type: "image",
        });
        mediaUrl = uploadResult.secure_url;
      }

      const parsedTargeting = typeof targeting === "string" ? JSON.parse(targeting) : targeting;
      const parsedCtaButtons = typeof ctaButtons === "string" ? JSON.parse(ctaButtons) : ctaButtons;
      const parsedPlacements = typeof displayPlacements === "string" ? JSON.parse(displayPlacements) : displayPlacements;
      const parsedLeadForm = typeof leadFormConfig === "string" ? JSON.parse(leadFormConfig) : leadFormConfig;

      const defaultLeadForm = {
        title: "Đăng ký tư vấn / Nhận ưu đãi",
        description: "Nhập thông tin bên dưới để kết nối với chúng tôi.",
        fields: [
          { label: "Họ và tên", fieldType: "text", required: true },
          { label: "Địa chỉ Email", fieldType: "email", required: true },
          { label: "Số điện thoại", fieldType: "tel", required: true },
        ],
      };

      const campaign = new AdCampaign({
        advertiser: advertiserId,
        title,
        content,
        targetUrl,
        pricingModel: pricingModel || "CPC",
        budget: {
          total: Number(budgetTotal),
          dailyLimit: Number(dailyLimit) || 0,
          remaining: Number(budgetTotal),
        },
        mediaUrl,
        targeting: {
          location: parsedTargeting?.location || [],
          ageMin: Number(parsedTargeting?.ageMin) || 18,
          ageMax: Number(parsedTargeting?.ageMax) || 100,
        },
        category: category || "Khác",
        displayPlacements: parsedPlacements || ["FEED_NATIVE", "SIDEBAR_SPONSORED"],
        ctaButtons: parsedCtaButtons || [
          { label: "Tìm hiểu thêm", actionType: "link", actionUrl: "", icon: "ArrowRight", backgroundColor: "#4f46e5", textColor: "#ffffff", iconColor: "#ffffff" },
        ],
        leadFormConfig: parsedLeadForm || defaultLeadForm,
        status: "pending",
      });

      await campaign.save();

      return {
        status: 201,
        data: { success: true, message: "Tạo chiến dịch quảng cáo thành công. Đang chờ phê duyệt.", campaign },
      };
    } catch (error) {
      console.error("Lỗi tạo chiến dịch quảng cáo:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi server khi tạo chiến dịch: " + error.message },
      };
    }
  }

  async getCampaigns(advertiserId) {
    try {
      const campaigns = await AdCampaign.find({ advertiser: advertiserId }).sort({ createdAt: -1 });
      return {
        status: 200,
        data: { success: true, campaigns },
      };
    } catch (error) {
      console.error("Lỗi lấy danh sách chiến dịch:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi server: " + error.message },
      };
    }
  }

  async toggleCampaignStatus(campaignId, advertiserId, newStatus) {
    try {
      if (!["active", "paused"].includes(newStatus)) {
        return {
          status: 400,
          data: { success: false, message: "Trạng thái không hợp lệ (Chỉ chấp nhận active hoặc paused)" },
        };
      }

      const campaign = await AdCampaign.findOne({ _id: campaignId, advertiser: advertiserId });
      if (!campaign) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy chiến dịch quảng cáo" },
        };
      }

      if (campaign.status === "pending" || campaign.status === "rejected" || campaign.status === "completed") {
        return {
          status: 400,
          data: { success: false, message: "Không thể đổi trạng thái khi chiến dịch chưa được duyệt hoặc đã kết thúc" },
        };
      }

      campaign.status = newStatus;
      await campaign.save();

      return {
        status: 200,
        data: { success: true, message: "Cập nhật trạng thái chiến dịch thành công", campaign },
      };
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái chiến dịch:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi server: " + error.message },
      };
    }
  }

  async serveAds(placementCode, userAge = 20, userLocation = "") {
    try {
      const query = {
        status: "active",
        displayPlacements: placementCode,
        "budget.remaining": { $gt: 0 },
      };

      if (userAge) {
        query["targeting.ageMin"] = { $lte: userAge };
        query["targeting.ageMax"] = { $gte: userAge };
      }

      if (userLocation) {
        query.$or = [
          { "targeting.location": { $size: 0 } },
          { "targeting.location": userLocation },
        ];
      }

      const activeCampaigns = await AdCampaign.find(query);

      if (activeCampaigns.length === 0) {
        const fallback = await AdCampaign.findOne({
          status: "active",
          displayPlacements: placementCode,
          "budget.remaining": { $gt: 0 },
        });
        return {
          status: 200,
          data: fallback || null,
        };
      }

      const randomIndex = Math.floor(Math.random() * activeCampaigns.length);
      const selectedAd = activeCampaigns[randomIndex];

      return {
        status: 200,
        data: selectedAd,
      };
    } catch (error) {
      console.error("Lỗi serve quảng cáo:", error);
      return {
        status: 500,
        data: null,
      };
    }
  }

  async trackEvent(campaignId, eventType, placement, userId, ipAddress, userAgent) {
    try {
      const campaign = await AdCampaign.findById(campaignId);
      if (!campaign) {
        return { status: 404, data: { success: false, message: "Không tìm thấy chiến dịch" } };
      }

      const log = new AdLog({
        campaign: campaignId,
        placement: placement || "unknown",
        eventType,
        user: userId || null,
        ipAddress,
        userAgent,
      });
      await log.save();

      if (eventType === "impression") {
        campaign.metrics.impressions += 1;
        if (campaign.pricingModel === "CPM") {
          campaign.budget.remaining = Math.max(0, campaign.budget.remaining - 0.1);
        }
      } else if (eventType === "click") {
        campaign.metrics.clicks += 1;
        if (campaign.pricingModel === "CPC") {
          campaign.budget.remaining = Math.max(0, campaign.budget.remaining - 1.0);
        }
      }

      if (campaign.budget.remaining <= 0) {
        campaign.status = "completed";
      }

      await campaign.save();

      return {
        status: 200,
        data: { success: true, remainingBudget: campaign.budget.remaining, status: campaign.status },
      };
    } catch (error) {
      console.error("Lỗi ghi nhận event quảng cáo:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi server khi tracking: " + error.message },
      };
    }
  }

  async submitLead(campaignId, answers, userId = null, files = []) {
    try {
      const campaign = await AdCampaign.findById(campaignId);
      if (!campaign) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy chiến dịch quảng cáo" },
        };
      }

      let parsedAnswers = typeof answers === "string" ? JSON.parse(answers) : (answers || []);

      if (files && files.length > 0) {
        for (const file of files) {
          const uploadResult = await uploadImageFromBuffer(file.buffer, {
            folder: "pingup_leads",
            resource_type: "auto",
          });
          const secureUrl = uploadResult.secure_url;
          const targetAns = parsedAnswers.find(ans => ans.fileKey === file.fieldname);
          if (targetAns) {
            targetAns.value = secureUrl;
          }
        }
      }

      const lead = new AdLead({
        campaign: campaignId,
        advertiser: campaign.advertiser,
        user: userId,
        answers: parsedAnswers,
      });
      await lead.save();

      return {
        status: 200,
        data: { success: true, message: "Gửi thông tin liên hệ thành công!" },
      };
    } catch (error) {
      console.error("Lỗi gửi lead form:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi server: " + error.message },
      };
    }
  }

  // --- ADMIN APIs ---
  async getAdminCampaigns() {
    try {
      const campaigns = await AdCampaign.find().populate("advertiser", "_id email username full_name").sort({ createdAt: -1 });
      return {
        status: 200,
        data: { success: true, campaigns },
      };
    } catch (error) {
      console.error("Lỗi lấy danh sách duyệt quảng cáo của Admin:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi server: " + error.message },
      };
    }
  }

  async reviewCampaign(campaignId, status, rejectionReason = "") {
    try {
      if (!["approved", "rejected"].includes(status)) {
        return {
          status: 400,
          data: { success: false, message: "Trạng thái phê duyệt không hợp lệ" },
        };
      }

      const campaign = await AdCampaign.findById(campaignId);
      if (!campaign) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy chiến dịch quảng cáo" },
        };
      }

      campaign.status = status === "approved" ? "active" : "rejected";
      await campaign.save();

      return {
        status: 200,
        data: { success: true, message: `Đã ${status === "approved" ? "duyệt và kích hoạt" : "từ chối"} chiến dịch thành công`, campaign },
      };
    } catch (error) {
      console.error("Lỗi duyệt chiến dịch quảng cáo:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi server: " + error.message },
      };
    }
  }

  async updateCampaign(campaignId, campaignData, file, advertiserId) {
    try {
      const campaign = await AdCampaign.findById(campaignId);
      if (!campaign) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy chiến dịch quảng cáo" },
        };
      }

      if (campaign.advertiser.toString() !== advertiserId.toString()) {
        return {
          status: 403,
          data: { success: false, message: "Bạn không có quyền sửa chiến dịch này" },
        };
      }

      const {
        title,
        content,
        targetUrl,
        pricingModel,
        budgetTotal,
        dailyLimit,
        targeting,
        category,
        displayPlacements,
        ctaButtons,
        leadFormConfig,
      } = campaignData;

      if (title) campaign.title = title;
      if (content) campaign.content = content;
      if (targetUrl) campaign.targetUrl = targetUrl;
      if (pricingModel) campaign.pricingModel = pricingModel;
      if (category) campaign.category = category;

      if (budgetTotal) {
        const diff = Number(budgetTotal) - campaign.budget.total;
        campaign.budget.total = Number(budgetTotal);
        campaign.budget.remaining = Math.max(0, campaign.budget.remaining + diff);
      }
      if (dailyLimit !== undefined) campaign.budget.dailyLimit = Number(dailyLimit);

      if (targeting) {
        const parsedTargeting = typeof targeting === "string" ? JSON.parse(targeting) : targeting;
        if (parsedTargeting.location) campaign.targeting.location = parsedTargeting.location;
        if (parsedTargeting.ageMin !== undefined) campaign.targeting.ageMin = Number(parsedTargeting.ageMin);
        if (parsedTargeting.ageMax !== undefined) campaign.targeting.ageMax = Number(parsedTargeting.ageMax);
      }

      if (displayPlacements) {
        const parsedPlacements = typeof displayPlacements === "string" ? JSON.parse(displayPlacements) : displayPlacements;
        campaign.displayPlacements = parsedPlacements;
      }

      if (ctaButtons) {
        const parsedCtaButtons = typeof ctaButtons === "string" ? JSON.parse(ctaButtons) : ctaButtons;
        campaign.ctaButtons = parsedCtaButtons;
      }

      if (leadFormConfig) {
        const parsedLeadForm = typeof leadFormConfig === "string" ? JSON.parse(leadFormConfig) : leadFormConfig;
        campaign.leadFormConfig = parsedLeadForm;
      }

      if (file) {
        const uploadResult = await uploadImageFromBuffer(file.buffer, {
          folder: "pingup_ads",
          resource_type: "image",
        });
        campaign.mediaUrl = uploadResult.secure_url;
      }

      campaign.status = "pending";

      await campaign.save();

      return {
        status: 200,
        data: { success: true, message: "Cập nhật thành công. Chiến dịch đang chờ duyệt lại.", campaign },
      };
    } catch (error) {
      console.error("Lỗi cập nhật chiến dịch quảng cáo:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi server: " + error.message },
      };
    }
  }

  async deleteCampaign(campaignId, advertiserId, isAdmin = false) {
    try {
      const campaign = await AdCampaign.findById(campaignId);
      if (!campaign) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy chiến dịch quảng cáo" },
        };
      }

      if (!isAdmin && campaign.advertiser.toString() !== advertiserId.toString()) {
        return {
          status: 403,
          data: { success: false, message: "Bạn không có quyền xóa chiến dịch này" },
        };
      }

      await AdCampaign.findByIdAndDelete(campaignId);
      await AdLog.deleteMany({ campaign: campaignId });

      return {
        status: 200,
        data: { success: true, message: "Đã xóa chiến dịch quảng cáo thành công" },
      };
    } catch (error) {
      console.error("Lỗi xóa chiến dịch quảng cáo:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi server: " + error.message },
      };
    }
  }

  async getLeads(advertiserId) {
    try {
      const leads = await AdLead.find({ advertiser: advertiserId })
        .populate("campaign", "title category targetUrl")
        .populate("user", "username full_name email profile_picture")
        .sort({ createdAt: -1 });

      return {
        status: 200,
        data: { success: true, leads },
      };
    } catch (error) {
      console.error("Lỗi lấy danh sách Lead:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi server: " + error.message },
      };
    }
  }

  async getAdminLeads() {
    try {
      const leads = await AdLead.find()
        .populate("campaign", "title category targetUrl")
        .populate("advertiser", "username full_name email")
        .populate("user", "username full_name email profile_picture")
        .sort({ createdAt: -1 });

      return {
        status: 200,
        data: { success: true, leads },
      };
    } catch (error) {
      console.error("Lỗi lấy danh sách Lead Admin:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi server: " + error.message },
      };
    }
  }

  async deleteLead(leadId, advertiserId, isAdmin = false) {
    try {
      const lead = await AdLead.findById(leadId);
      if (!lead) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy thông tin Lead" },
        };
      }

      if (!isAdmin && lead.advertiser.toString() !== advertiserId.toString()) {
        return {
          status: 403,
          data: { success: false, message: "Bạn không có quyền xóa Lead này" },
        };
      }

      await AdLead.findByIdAndDelete(leadId);

      return {
        status: 200,
        data: { success: true, message: "Đã xóa Lead thành công" },
      };
    } catch (error) {
      console.error("Lỗi xóa Lead:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi server: " + error.message },
      };
    }
  }

  /**
   * Tải tệp tin/hình ảnh trong biểu mẫu quảng cáo lên Cloudinary
   */
  async uploadFile(file) {
    try {
      if (!file) {
        return {
          status: 400,
          data: { success: false, message: "Không tìm thấy tệp tải lên." }
        };
      }
      const result = await uploadImageFromBuffer(file.buffer);
      return {
        status: 200,
        data: { success: true, url: result.secure_url }
      };
    } catch (error) {
      console.error("Lỗi upload tệp trong AdService:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi upload: " + error.message }
      };
    }
  }
}

export default new AdService();
