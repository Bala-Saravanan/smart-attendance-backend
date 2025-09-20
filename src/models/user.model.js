import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed password
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      required: true,
    },

    // Student-specific fields
    rollNumber: { type: String },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },

    // Face registration
    faceRegistered: { type: Boolean, default: false },
    faceEncoding: { type: Array }, // stored landmark encoding from MediaPipe
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
