import AdPlacement from "../models/AdPlacement.js";

const seedPlacements = async () => {
  try {
    const defaultPlacements = [
      { code: "SIDEBAR_SPONSORED", name: "Quảng cáo thanh bên (Sidebar)" },
      { code: "FEED_NATIVE", name: "Quảng cáo bài viết dòng thời gian (Feed)" },
    ];

    for (const placement of defaultPlacements) {
      await AdPlacement.findOneAndUpdate(
        { code: placement.code },
        placement,
        { upsert: true, new: true }
      );
    }
    console.log(" ==== ✅ Seeded default AdPlacements successfully ====");
  } catch (error) {
    console.error("Error seeding AdPlacements:", error);
  }
};

export default seedPlacements;
