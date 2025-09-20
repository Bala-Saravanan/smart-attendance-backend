import express from "express";
import {
  addSubject,
  deleteSubject,
  getSubjectAttendance,
} from "../controllers/subject.controller.js";
import { authenticateRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateRole(["teacher"]), addSubject);
router.delete("/:id", authenticateRole(["teacher"]), deleteSubject);
router.get("/:id", authenticateRole(["teacher"]), getSubjectAttendance);

export default router;
