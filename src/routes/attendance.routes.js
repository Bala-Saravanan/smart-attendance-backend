import express from "express";
import multer from "multer";
import {
  markAttendance,
  getStudentAttendance,
  getClassAttendance,
} from "../controllers/attendance.controller.js";
import { authenticateRole } from "../middlewares/authMiddleware.js";

const router = express.Router();
const upload = multer();

// Mark attendance (calls Python API internally)
router.post(
  "/mark-attendance",
  authenticateRole(["teacher"]),
  upload.single("file"),
  markAttendance
);

// Get individual student attendance
router.get(
  "/student/:id",
  authenticateRole(["teacher", "student"]),
  getStudentAttendance
);

// Get class attendance
router.get(
  "/class/:classId",
  authenticateRole(["teacher"]),
  getClassAttendance
);

export default router;
