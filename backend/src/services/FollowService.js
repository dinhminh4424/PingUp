import Follow from "../models/Follow.js";

class FollowService {
  async getFollowing(userId) {
    try {
      if (!userId) {
        console.log("Không có userId");
        return {
          status: 400,
          data: {
            success: false,
            message: "Lỗi hệ thống getFollowing: Không có userId",
          },
        };
      }

      const following = await Follow.find({ follower: userId }).populate(
        "following",
        "_id email username full_name bio profile_picture cover_photo location"
      );
      const followingUsers = following.map((f) => f.following).filter(Boolean);

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy danh sách getFollowing thành công !!",
          following: followingUsers,
        },
      };
    } catch (error) {
      console.log("Lỗi hệ thống getFollowing: ", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống getFollowing: " + error.message,
        },
      };
    }
  }

  async getFollower(userId) {
    try {
      if (!userId) {
        console.log("Không có userId");
        return {
          status: 400,
          data: {
            success: false,
            message: "Lỗi hệ thống getFollower: Không có userId",
          },
        };
      }

      const followers = await Follow.find({ following: userId }).populate(
        "follower",
        "_id email username full_name bio profile_picture cover_photo location"
      );
      const followerUsers = followers.map((f) => f.follower).filter(Boolean);

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy danh sách getFollower thành công !!",
          followers: followerUsers,
        },
      };
    } catch (error) {
      console.log("Lỗi hệ thống getFollower: ", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống getFollower: " + error.message,
        },
      };
    }
  }
}

export default new FollowService();
