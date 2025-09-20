import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // e.g., "CSE A Second Year"
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // references the teacher
      required: true,
    },
    studentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // references students
      },
    ],
    subjectIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject", // references subjects
      },
    ],
  },
  { timestamps: true }
);

const Class = mongoose.model("Class", classSchema);
export default Class;
