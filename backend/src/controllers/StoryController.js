import StoryService from "../services/StoryService.js";

class StoryController {
  async getStoryForUser(req, res) {
    try {
      // console.log("req.user: ", req.user);
      const userId = req.user._id;

      const result = await StoryService.getStoryForUser(userId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi danh sách story: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi danh sách story: " + error.message,
      });
    }
  }

  async createStory(req, res) {
    try {
      const { content, background_color, text_color } = req.body;
      const file = req.file;
      const userId = req.user._id;

      const result = await StoryService.createStory(
        content,
        background_color,
        text_color,
        file,
        userId,
      );
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi tạo Story: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi tạo Story: " + error.message,
      });
    }
  }

  async viewStory(req, res) {
    try {
      const storyId = req.params.id;
      const userId = req.user._id;
      const result = await StoryService.viewStory(storyId, userId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi xem story: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi xem story: " + error.message,
      });
    }
  }
}

export default new StoryController();
