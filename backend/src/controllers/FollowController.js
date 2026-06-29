import FollowService from "../services/FollowService.js";

class FollowController {
  async getFollower(req, res) {
    try {
      const userId = req.user._id;

      const result = await FollowService.getFollower(userId);

      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi khi lấy danh sách Follow: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách Follow: " + error.message,
      });
    }
  }

  async getFollowing(req, res) {
    try {
      const userId = req.user._id;

      const result = await FollowService.getFollowing(userId);

      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi khi lấy danh sách Follow: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách Follow: " + error.message,
      });
    }
  }
}

export default new FollowController();
