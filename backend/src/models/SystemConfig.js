import mongoose from "mongoose";

const systemConfigSchema = new mongoose.Schema(
  {
    key: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true 
    },
    value: { 
      type: mongoose.Schema.Types.Mixed, 
      required: true 
    },
    group: { 
      type: String, 
      required: true, 
      index: true 
    },
    type: { 
      type: String, 
      required: true,
      enum: ["string", "number", "boolean", "json", "array", "select"]
    },
    label: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      default: "" 
    },
    options: { 
      type: Array, 
      default: [] 
    },
    isPublic: { 
      type: Boolean, 
      default: false 
    },
    updatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }
  },
  { 
    timestamps: true 
  }
);

const SystemConfig = mongoose.model("SystemConfig", systemConfigSchema);
export default SystemConfig;
