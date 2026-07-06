import User from "../models/User.js";
import Follow from "../models/Follow.js";
import Story from "../models/Story.js";
import { uploadImageFromBuffer } from "../middlewares/UpLoadMiddleware.js";
import Connection from "../models/Connection.js";
import mongoose from "mongoose";
import ConnectionRequest from "../models/ConnectionRequest.js";
import { io } from "../socket/index.js";

class StoryService {
  async getStoryForUser(userId) {
    try {
      if (!userId) {
        console.log("Không có id người dùng");
        return {
          status: 404,
          data: {
            success: false,
            message: "Không có id người dùng",
          },
        };
      }

      // chỉ lấy các post của follow và friend

      const follows = await Follow.find({
        follower: userId,
      }).lean();
      const followUsers = follows.map((f) => f.following);

      const connections = await Connection.find({
        $or: [{ userA: userId }, { userB: userId }],
      }).lean();

      const friendUsers = connections.map((c) =>
        c.userA.toString() === userId.toString() ? c.userB : c.userA,
      );

      // Gộp và loại bỏ trùng
      const rawUsers = [
        ...new Set([...friendUsers, ...followUsers].map((id) => id.toString())),
      ];

      const userIds = [
        ...rawUsers.map((id) => new mongoose.Types.ObjectId(id)),
        new mongoose.Types.ObjectId(userId),
      ];

      const stories = await Story.find({
        user: { $in: userIds },
        isDelete: false,
        isActive: true,
        expiresAt: { $gt: new Date() },
      })
        .populate("user", "full_name username profile_picture location bio")
        .sort({
          createdAt: -1,
        })
        .lean();

      const groupedStories = [];

      const map = new Map();

      for (const story of stories) {
        const id = story.user._id.toString();

        if (!map.has(id)) {
          map.set(id, {
            user: story.user,
            stories: [],
            latestStory: story.createdAt,
            hasViewed: false,
          });
        }

        const group = map.get(id);

        group.stories.push({
          ...story,
          hasViewed: story.viewers.some(
            (viewer) => viewer.user.toString() === userId.toString(),
          ),
        });
      }

      groupedStories.push(...map.values());

      groupedStories.sort((a, b) => {
        const aViewed = a.stories.every((s) => s.hasViewed);
        const bViewed = b.stories.every((s) => s.hasViewed);

        if (aViewed !== bViewed) {
          return aViewed ? 1 : -1;
        }

        return new Date(b.latestStory) - new Date(a.latestStory);
      });

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy danh sách story thành công",
          stories: groupedStories,
        },
      };
    } catch (error) {
      console.log("Lỗi hệ thống Lấy Danh sách Story: ", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống Lấy Danh sách Story: " + error.message,
        },
      };
    }
  }

  async createStory(content, background_color, text_color, file, userId) {
    try {
      let story_type = "text";

      if (file) {
        if (file.mimetype.startsWith("image/")) {
          story_type = content ? "text_with_image" : "image";
        } else if (file.mimetype.startsWith("video/")) {
          story_type = "video";
        }
      }

      let media = null;

      if (file) {
        const isVideo = file.mimetype.startsWith("video/");
        const uploadResult = await uploadImageFromBuffer(file.buffer, {
          resource_type: isVideo ? "video" : "image",
        });
        let linkUrl = uploadResult.secure_url;

        media = {
          url: linkUrl,
          type: isVideo ? "video" : "image",
        };
      }

      const story = await Story.create({
        user: userId,
        content,
        media,
        story_type,
        background_color,
        text_color,
      });

      const storyWithUser = await Story.findById(story._id).populate("user");

      // Socket

      // Lấy danh sách bạn bè
      const connections = await Connection.find({
        $or: [{ userA: userId }, { userB: userId }],
      });
      console.log("connections:", connections);

      const friends = connections
        .map((c) => {
          return c.userA.toString() === userId.toString() ? c.userB : c.userA;
        })
        .filter(Boolean);

      console.log("friends:", friends);

      // gửi thông báo
      for (let i of friends) {
        console.log("i: ", i.toString());

        io.to(i.toString()).emit("story:new", { story: storyWithUser });
      }

      return {
        status: 200,
        data: {
          success: true,
          message: "Tạo Story thành công",
          story: storyWithUser,
        },
      };
    } catch (error) {
      console.log("Lỗi hệ thống Đăng Story: ", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống đăng Story: " + error.message,
        },
      };
    }
  }
}

export default new StoryService();
