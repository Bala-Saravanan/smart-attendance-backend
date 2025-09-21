import express from "express";
import multer from "multer";
import {
  registerFace,
  getProfile,
  loginStudent,
  loginTeacher,
  registerTeacher,
  // logoutTeacher,
} from "../controllers/user.controller.js";
import { authenticateRole } from "../middlewares/authMiddleware.js";

const router = express.Router();
const upload = multer();

// Student/Admin/Teacher can register
router.post("/register-face", upload.single("file"), registerFace);

// Login route
router.post("/student-login", loginStudent);
router.post("/teacher-register", registerTeacher);
router.post("/teacher-login", loginTeacher);
// router.get("/teacher-logout", authenticateRole(["teacher"]), logoutTeacher);

// Profile fetch
router.get("/:id", authenticateRole(["student"]), getProfile);

export default router;
