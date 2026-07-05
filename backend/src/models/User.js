import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: "String", require: true },
    password: { type: "String" },
    full_name: { type: "String", require: true },
    username: { type: "String", unique: true },
    bio: {
      type: "String",
      default: "You should write a short description about yourself! ",
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
      default: "Not updated yet!",
    },

    isActive: { type: Boolean, default: true },
    role: { type: String, default: "user", enum: ["user", "admin"] },
    activeOnline: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
