import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },

    // Aggregated data
    totalClasses: { type: Number, default: 0 },
    attended: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },

    // Trends
    monthlyStats: [
      {
        month: String, // e.g. "Sep-2025"
        total: Number,
        attended: Number,
      },
    ],
  },
  { timestamps: true }
);

const Analytics = mongoose.model("Analytics", analyticsSchema);

export default Analytics;
