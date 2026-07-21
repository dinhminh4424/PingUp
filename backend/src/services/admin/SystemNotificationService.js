import SystemNotificationTemplate from "../../models/SystemNotificationTemplate.js";
import SystemBroadcast from "../../models/SystemBroadcast.js";
import Notification from "../../models/Notification.js";
import User from "../../models/User.js";
import { io } from "../../socket/index.js";
import { uploadImageFromBuffer } from "../../middlewares/UpLoadMiddleware.js";

class SystemNotificationService {
  // ================= TEMPLATE MANAGEMENT =================
  async getTemplates() {
    return await SystemNotificationTemplate.find()
      .populate("createdBy", "username fullName avatarUrl")
      .sort({ createdAt: -1 });
  }

  async createTemplate(data, adminId) {
    const template = new SystemNotificationTemplate({
      ...data,
      createdBy: adminId,
    });
    return await template.save();
  }

  async updateTemplate(templateId, data) {
    const template = await SystemNotificationTemplate.findByIdAndUpdate(
      templateId,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!template) {
      throw new Error("Không tìm thấy mẫu thông báo");
    }
    return template;
  }

  async deleteTemplate(templateId) {
    const template = await SystemNotificationTemplate.findByIdAndDelete(templateId);
    if (!template) {
      throw new Error("Không tìm thấy mẫu thông báo để xóa");
    }
    return true;
  }

  // ================= UPLOAD IMAGE =================
  async uploadModalImage(fileBuffer) {
    if (!fileBuffer) {
      throw new Error("Không có file ảnh được tải lên");
    }
    const result = await uploadImageFromBuffer(fileBuffer, {
      folder: "minh_Pingup/system_modals",
    });
    return result.secure_url;
  }

  // ================= BROADCAST / SENDING =================
  async sendBroadcast(data, adminId) {
    const {
      title,
      content,
      isHtml = false,
      customCss = "",
      type = "info",
      displayType = "both",
      targetType = "all",
      targetValues = [],
      modalOptions = {},
      scheduledAt = null,
    } = data;

    if (!title || !content) {
      throw new Error("Vui lòng nhập đầy đủ Tiêu đề và Nội dung");
    }

    // 1. Tìm các người nhận mục tiêu
    let targetUsers = [];
    if (targetType === "all") {
      targetUsers = await User.find({ isLocked: { $ne: true } }).select("_id role");
    } else if (targetType === "role") {
      targetUsers = await User.find({
        role: { $in: targetValues },
        isLocked: { $ne: true },
      }).select("_id role");
    } else if (targetType === "users") {
      targetUsers = await User.find({
        _id: { $in: targetValues },
      }).select("_id role");
    }

    const totalTargets = targetUsers.length;
    const isScheduled = scheduledAt && new Date(scheduledAt) > new Date();

    // 2. Tạo bản ghi SystemBroadcast
    const broadcast = new SystemBroadcast({
      title,
      content,
      isHtml,
      customCss,
      type,
      displayType,
      targetType,
      targetValues,
      modalOptions,
      status: isScheduled ? "scheduled" : "sent",
      scheduledAt: isScheduled ? new Date(scheduledAt) : null,
      sentAt: isScheduled ? null : new Date(),
      sentBy: adminId,
      totalTargets,
    });

    await broadcast.save();

    if (isScheduled) {
      return { broadcast, message: "Đã lên lịch gửi thông báo thành công" };
    }

    // 3A. Tạo bản ghi Notification cho In-App Feed
    if (displayType === "feed" || displayType === "both") {
      const plainTextContent = isHtml
        ? content.replace(/<[^>]+>/g, " ").substring(0, 150)
        : content;

      const notificationDocs = targetUsers.map((u) => ({
        receiver: u._id,
        sender: adminId,
        content: `[Thông báo hệ thống] ${title}: ${plainTextContent}`,
        type: "system",
        detailType: type,
        referenceId: broadcast._id,
        link: modalOptions?.primaryAction?.url || modalOptions?.primaryActionUrl || "",
        isRead: false,
      }));

      if (notificationDocs.length > 0) {
        await Notification.insertMany(notificationDocs, { ordered: false }).catch(
          (err) => console.error("Lỗi khi chèn bảng tin thông báo:", err)
        );
      }
    }

    // 3B. Bắn Socket Realtime System Modal
    if (displayType === "modal" || displayType === "both") {
      const modalPayload = {
        broadcastId: broadcast._id,
        title,
        message: content,
        isHtml,
        customCss,
        type,
        size: modalOptions?.size || "md",
        image: modalOptions?.image || "",
        showCloseButton: modalOptions?.showCloseButton ?? true,
        actions: modalOptions?.actions || [
          {
            id: "btn-1",
            label: "Đồng ý",
            color: "blue",
            icon: "",
            actionType: "close",
            url: "",
          },
        ],
        hasForm: modalOptions?.hasForm || false,
        formFields: modalOptions?.formFields || [],
      };

      if (targetType === "all") {
        io.emit("system:modal_broadcast", modalPayload);
      } else {
        targetUsers.forEach((u) => {
          io.to(u._id.toString()).emit("system:modal_broadcast", modalPayload);
        });
      }
    }

    return { broadcast, message: `Đã gửi thông báo thành công tới ${totalTargets} người dùng` };
  }

  // ================= HISTORY & MANAGEMENT =================
  async getBroadcastHistory({ page = 1, limit = 10, type, search }) {
    const query = {};
    if (type && type !== "all") {
      query.type = type;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [broadcasts, total] = await Promise.all([
      SystemBroadcast.find(query)
        .populate("sentBy", "username fullName avatarUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      SystemBroadcast.countDocuments(query),
    ]);

    return {
      broadcasts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    };
  }

  async revokeBroadcast(broadcastId) {
    const broadcast = await SystemBroadcast.findById(broadcastId);
    if (!broadcast) {
      throw new Error("Không tìm thấy thông báo hệ thống");
    }

    broadcast.status = "cancelled";
    await broadcast.save();

    await Notification.deleteMany({ referenceId: broadcastId, type: "system" });

    return true;
  }
}

export default new SystemNotificationService();
