import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["Present", "Absent"], default: "Present" },
  },
  { timestamps: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
