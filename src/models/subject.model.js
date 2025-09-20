import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // e.g., "Data Structures"
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // references the teacher
      required: true,
    },
    periodTime: {
      type: String,
      required: true, // e.g., "09:00-10:00"
    },
    // classId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Class",
    //   required: true,
    // },
  },
  { timestamps: true }
);

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;
