import express from "express";
import {
  getStudentAnalytics,
  getClassAnalytics,
} from "../controllers/analytics.controller.js";

const router = express.Router();

// Analytics for one student
router.get("/student/:id", getStudentAnalytics);

// Analytics for a class
router.get("/class/:classId", getClassAnalytics);

export default router;
