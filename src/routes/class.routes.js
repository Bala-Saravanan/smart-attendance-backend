import express from "express";
import {
  createClass,
  getClasses,
  getClassDetails,
} from "../controllers/class.controller.js";
import { authenticateRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin creates class
router.post("/", authenticateRole(["teacher"]), createClass);

// Get all classes
router.get("/", authenticateRole(["teacher"]), getClasses);

// Get details of one class
router.get("/:id", authenticateRole(["teacher"]), getClassDetails);

export default router;
