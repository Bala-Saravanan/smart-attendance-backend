// backend/src/controllers/classController.js
import Class from "../models/class.model.js";
import User from "../models/user.model.js";

export const createClass = async (req, res) => {
  try {
    const { name, teacher } = req.body;

    if (!name || !teacher) {
      return res.status(400).json({
        message: "Both fields are required!",
      });
    }

    // Find teacher by name
    const teacherDoc = await User.findOne({ name: teacher, role: "teacher" });
    if (!teacherDoc) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    // Create class with teacher's _id
    const newClass = await Class.create({
      name,
      teacherId: teacherDoc._id,
    });

    return res.status(201).json({
      message: "Class created successfully",
      class: newClass,
    });
  } catch (err) {
    console.error("Error creating class:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all classes
export const getClasses = async (req, res) => {
  try {
    // TODO: Fetch from MongoDB
    const classList = await Class.find({});
    return res.status(200).json({
      message: "Classes fetched successfully",
      classList,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get class details
export const getClassDetails = async (req, res) => {
  try {
    const classId = req.params.id;

    // TODO: Fetch from MongoDB
    res.json({
      id: classId,
      name: "Computer Science",
      teacher: "Teacher A",
      students: ["Student1", "Student2"],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
