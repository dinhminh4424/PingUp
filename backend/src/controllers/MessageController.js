import MessageService from "../services/MessageService.js";
import { uploadImageFromBuffer } from "../middlewares/UpLoadMiddleware.js";


class MessageController {
  async getMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const userId = req.user._id;

      const result = await MessageService.getMessages(
        conversationId,
        page,
        limit,
        userId,
      );
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy tin nhắn: " + error.message,
      });
    }
  }

  async sendMessage(req, res) {
    try {
      const { conversationId, content, replyTo, linkPreview } = req.body;
      const senderId = req.user._id;

      let parsedLinkPreview = null;
      if (linkPreview) {
        try {
          parsedLinkPreview = typeof linkPreview === "string" ? JSON.parse(linkPreview) : linkPreview;
        } catch (e) {
          console.error("Lỗi parse linkPreview:", e);
        }
      }

      let imageUrls = [];
      let filesData = [];

      if (req.files) {
        // Upload images
        if (req.files.images && req.files.images.length > 0) {
          for (const file of req.files.images) {
            try {
              const uploadResult = await uploadImageFromBuffer(file.buffer, {
                folder: "minh_Pingup/messages",
              });
              imageUrls.push(uploadResult.secure_url);
            } catch (uploadError) {
              console.error(
                "Lỗi khi tải ảnh tin nhắn lên Cloudinary: ",
                uploadError,
              );
            }
          }
        }

        // Upload documents/files
        if (req.files.files && req.files.files.length > 0) {
          for (const file of req.files.files) {
            try {
              const originalName = file.originalname;
              const lastDotIndex = originalName.lastIndexOf(".");
              const nameWithoutExt =
                lastDotIndex !== -1
                  ? originalName.substring(0, lastDotIndex)
                  : originalName;
              const ext =
                lastDotIndex !== -1 ? originalName.substring(lastDotIndex) : "";

              const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, "_");
              const uniquePublicId = `${cleanName}_${Date.now()}${ext}`;

              const uploadResult = await uploadImageFromBuffer(file.buffer, {
                folder: "minh_Pingup/files",
                resource_type: "raw",
                public_id: uniquePublicId,
              });

              const getReadableSize = (bytes) => {
                if (bytes === 0) return "0 Bytes";
                const k = 1024;
                const sizes = ["Bytes", "KB", "MB", "GB"];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return (
                  parseFloat((bytes / Math.pow(k, i)).toFixed(2)) +
                  " " +
                  sizes[i]
                );
              };

              filesData.push({
                url: uploadResult.secure_url,
                name: file.originalname,
                size: getReadableSize(file.size),
              });
            } catch (uploadError) {
              console.error(
                "Lỗi khi tải tệp tin lên Cloudinary: ",
                uploadError,
              );
            }
          }
        }
      }

      if (!content && imageUrls.length === 0 && filesData.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Nội dung tin nhắn không được để trống",
        });
      }

      const result = await MessageService.sendMessage(
        conversationId,
        senderId,
        content,
        imageUrls,
        filesData,
        replyTo,
        parsedLinkPreview,
      );

      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi gửi tin nhắn: " + error.message,
      });
    }
  }

  async reactToMessage(req, res) {
    try {
      const { messageId } = req.params;
      const { emoji } = req.body;
      const userId = req.user._id;

      if (!emoji) {
        return res.status(400).json({
          success: false,
          message: "Thiếu biểu cảm emoji",
        });
      }

      const result = await MessageService.reactToMessage(
        messageId,
        userId,
        emoji,
      );
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi bày tỏ biểu cảm: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }
  async getLinkPreview(req, res) {
    try {
      const { url } = req.query;
      if (!url) {
        return res.status(400).json({ success: false, message: "URL là bắt buộc" });
      }

      let targetUrl = url;
      if (!/^https?:\/\//i.test(url)) {
        targetUrl = 'http://' + url;
      }

      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      });
      const html = await response.text();

      const getMeta = (property) => {
        const metaRegex = new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i');
        let match = html.match(metaRegex);
        if (!match) {
          const metaRegexRev = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`, 'i');
          match = html.match(metaRegexRev);
        }
        return match ? match[1] : null;
      };

      const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
      const title = getMeta("og:title") || getMeta("title") || (titleMatch ? titleMatch[1] : "");

      const description = getMeta("og:description") || getMeta("description") || "";

      const image = getMeta("og:image") || "";

      const siteName = getMeta("og:site_name") || "";

      let domain = "";
      try {
        domain = new URL(targetUrl).hostname;
      } catch (e) {}

      return res.status(200).json({
        success: true,
        preview: {
          title: title.replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
          description: description.replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
          image,
          siteName,
          domain,
          url: targetUrl
        }
      });
    } catch (error) {
      console.error("Lỗi lấy thông tin link preview: ", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async recallMessage(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user._id;

      const result = await MessageService.recallMessage(messageId, userId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi thu hồi tin nhắn: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }

  async deleteMessageForMe(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user._id;

      const result = await MessageService.deleteMessageForMe(messageId, userId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi xóa tin nhắn phía tôi: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }

  async deleteChatHistory(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user._id;

      const result = await MessageService.deleteChatHistory(conversationId, userId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi xóa lịch sử trò chuyện: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }
}

export default new MessageController();
