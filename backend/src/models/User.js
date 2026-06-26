import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: "String", require: true },
    password: { type: "String" },
    full_name: { type: "String", require: true },
    username: { type: "String", unique: true },
    bio: {
      type: "String",
      default: "Bạn hãy ghi viết mô tả ngắn về bản thân đi nhóc!",
    },
    profile_picture: {
      type: "String",
      default: "",
    },
    cover_photo: {
      type: "String",
      default: "",
    },
    location: {
      type: "String",
      default: "Chưa cập nhật!",
    },
    followers: [
      {
        type: "String",
        ref: "User",
      },
    ],
    following: [
      {
        type: "String",
        ref: "User",
      },
    ],
    connections: [
      {
        type: "String",
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    minimize: false,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
