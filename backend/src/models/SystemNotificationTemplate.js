import mongoose from "mongoose";

const actionSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    label: { type: String, default: "Đồng ý" },
    color: { type: String, default: "blue" }, // blue, red, amber, emerald, purple, gray, outline
    icon: { type: String, default: "" },
    actionType: {
      type: String,
      enum: ["close", "redirect", "submit_form", "custom"],
      default: "redirect",
    },
    url: { type: String, default: "" },
  },
  { _id: false }
);

const formFieldSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "textarea", "select", "radio", "checkbox"],
      default: "text",
    },
    placeholder: { type: String, default: "" },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
  },
  { _id: false }
);

const systemNotificationTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isHtml: {
      type: Boolean,
      default: false,
    },
    customCss: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["info", "warning", "danger", "lock", "success"],
      default: "info",
    },
    displayType: {
      type: String,
      enum: ["feed", "modal", "both"],
      default: "both",
    },
    modalOptions: {
      size: {
        type: String,
        enum: ["sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "full"],
        default: "md",
      },
      image: {
        type: String,
        default: "",
      },
      showCloseButton: {
        type: Boolean,
        default: true,
      },
      actions: {
        type: [actionSchema],
        default: () => [
          {
            id: "btn-1",
            label: "Đồng ý",
            color: "blue",
            icon: "",
            actionType: "close",
            url: "",
          },
        ],
      },
      hasForm: {
        type: Boolean,
        default: false,
      },
      formFields: [formFieldSchema],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const SystemNotificationTemplate = mongoose.model(
  "SystemNotificationTemplate",
  systemNotificationTemplateSchema
);

export default SystemNotificationTemplate;
