import mongoose from "mongoose";

const adPlacementSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    minBidPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const AdPlacement = mongoose.model("AdPlacement", adPlacementSchema);

export default AdPlacement;
