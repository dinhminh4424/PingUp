import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      trim: true,
    },
    media: {
      url: {
        type: String,
        trim: true,
      },
      type: {
        type: String,
        enum: ["image", "video"],
      },
    },
    story_type: {
      type: String,
      enum: ["text", "image", "video", "text_with_image"],
      default: "text",
    },

    background_color: {
      type: String,
      default: "#000000",
    },

    text_color: {
      type: String,
      default: "#FFFFFF",
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    viewers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: true,
    },

    isDelete: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

storySchema.index({
  user: 1,
  isDelete: 1,
  isActive: 1,
  expiresAt: 1,
  createdAt: -1,
});

const Story = mongoose.model("Story", storySchema);

export default Story;
