import ConnectionService from "../services/ConnectionService.js";

class ConnectionController {
  async sendConnectionRequest(req, res) {
    try {
      const sender = req.user._id;
      const { receiver, message = "" } = req.body;

      const request = await ConnectionService.sendConnectionRequest(
        sender,
        receiver,
        message,
      );

      res.status(request.status).json(request.data);
    } catch (error) {
      console.error("Gửi lời mời kết bạn thất bại: ", error);
      res.status(500).json({
        success: false,
        message: "Gửi lời mời kết bạn thất bại: " + error.message,
      });
    }
  }

  async getConnectionStatus(req, res) {
    try {
      const user1 = req.user._id;
      const { profileId } = req.params;

      const result = await ConnectionService.getConnectionStatus(user1, profileId);
      res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lấy trạng thái kết bạn thất bại: ", error);
      res.status(500).json({
        success: false,
        message: "Lấy trạng thái kết bạn thất bại: " + error.message,
      });
    }
  }

  async acceptConnectionRequest(req, res) {
    try {
      const { requestId } = req.body;
      const userId = req.user._id;

      const result = await ConnectionService.acceptConnectionRequest(requestId, userId);
      res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Đồng ý kết bạn thất bại: ", error);
      res.status(500).json({
        success: false,
        message: "Đồng ý kết bạn thất bại: " + error.message,
      });
    }
  }

  async rejectConnectionRequest(req, res) {
    try {
      const { requestId } = req.body;
      const userId = req.user._id;

      const result = await ConnectionService.rejectConnectionRequest(requestId, userId);
      res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Từ chối/hủy lời mời thất bại: ", error);
      res.status(500).json({
        success: false,
        message: "Từ chối/hủy lời mời thất bại: " + error.message,
      });
    }
  }

  async disconnectConnection(req, res) {
    try {
      const { profileId } = req.body;
      const userId = req.user._id;

      const result = await ConnectionService.disconnectConnection(userId, profileId);
      res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Hủy kết bạn thất bại: ", error);
      res.status(500).json({
        success: false,
        message: "Hủy kết bạn thất bại: " + error.message,
      });
    }
  }

  async toggleFollow(req, res) {
    try {
      const { profileId } = req.body;
      const userId = req.user._id;

      const result = await ConnectionService.toggleFollow(userId, profileId);
      res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Toggle follow thất bại: ", error);
      res.status(500).json({
        success: false,
        message: "Toggle follow thất bại: " + error.message,
      });
    }
  }
}

export default new ConnectionController();
