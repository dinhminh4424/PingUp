import Feedback from "../../models/Feedback.js";
import User from "../../models/User.js";

class FeedbackService {
  // Get feedbacks list with pagination and search
  async getFeedbacks(
    searchQuery,
    rankFilter,
    categoryFilter,
    startDate,
    endDate,
    page = 1,
  ) {
    try {
      const limit = 10;
      const pageNumber = Math.max(1, parseInt(page) || 1);
      const skip = (pageNumber - 1) * limit;

      let search = {};

      if (searchQuery) {
        const matchedUsers = await User.find({
          $or: [
            { full_name: { $regex: searchQuery, $options: "i" } },
            { username: { $regex: searchQuery, $options: "i" } },
          ],
        }).select("_id");
        const userIds = matchedUsers.map((u) => u._id);

        search.$or = [
          { comment: { $regex: searchQuery, $options: "i" } },
          { userId: { $in: userIds } },
        ];
      }

      // Filter by rating / rank
      if (rankFilter && rankFilter !== "all") {
        search.rating = parseInt(rankFilter);
      }

      // Filter by category
      if (categoryFilter && categoryFilter !== "all") {
        search.category = categoryFilter;
      }

      // Filter by date range
      if (startDate || endDate) {
        search.createdAt = {};
        if (startDate) {
          search.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          search.createdAt.$lte = end;
        }
      }

      const feedbacks = await Feedback.find(search)
        .populate("userId", "_id username full_name profile_picture email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalFiltered = await Feedback.countDocuments(search);

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy danh sách feedback thành công!",
          feedbacks: feedbacks,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(totalFiltered / limit),
            totalFeedbacks: totalFiltered,
            limit,
          },
        },
      };
    } catch (error) {
      console.error("Lỗi hệ thống lấy danh sách feedback admin: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }
}

export default new FeedbackService();
