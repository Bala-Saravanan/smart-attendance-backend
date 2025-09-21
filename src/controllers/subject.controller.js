import Subject from "../models/subject.model.js";
import User from "../models/user.model.js";
import Class from "../models/class.model.js";
import Attendance from "../models/attendance.model.js";

export const addSubject = async (req, res) => {
  try {
    const { name, teacher, periodTime, ClassName } = req.body;

    // validate input
    if (!name || !teacher || !periodTime || !ClassName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // find teacher
    const teacherDoc = await User.findOne({ name: teacher, role: "teacher" });
    if (!teacherDoc) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // find class
    const ClassDoc = await Class.findOne({ name: ClassName });
    if (!ClassDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    // create subject
    const newSubject = await Subject.create({
      name,
      teacherId: teacherDoc._id,
      periodTime,
    });

    // link subject with class
    ClassDoc.subjectIds.push(newSubject._id);
    await ClassDoc.save();

    return res.status(201).json({
      message: "Subject added successfully",
      subject: newSubject,
    });
  } catch (error) {
    console.error("Add Subject Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete a subject
export const deleteSubject = async (req, res) => {
  try {
    const subjectId = req.params.id;

    const deleted = await Subject.findByIdAndDelete(subjectId);

    if (!deleted) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json({
      message: "Subject deleted successfully",
      subject: deleted,
    });
  } catch (error) {
    console.error("Delete Subject Error:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getAllSubject = async (req, res) => {
  try {
    const subjects = await Subject.find({}).populate("teacherId", "name email");
    // console.log(subjects);
    return res.status(200).json({
      message: "Subject fetched successfully",
      subjects,
    });
  } catch (error) {
    console.error("Get all Subjects Error: ", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// Get single subject details

export const getSubjectAttendance = async (req, res) => {
  try {
    const subjectId = req.params.id;
    const { classId } = req.query;

    const classDoc = await Class.findById(classId).populate(
      "studentIds",
      "name email"
    );
    // Find the class that has this subject
    // const classData = await Class.findOne({ subjectIds: subjectId }).populate(
    //   "studentIds",
    //   "name email"
    // );

    if (!classDoc) {
      return res
        .status(404)
        .json({ message: "Class for this subject not found" });
    }

    // Attendance records for this subject
    const attendanceRecords = await Attendance.find({
      subjectId,
      status: "Present",
    }).populate("studentId", "name email");

    const presentStudents = attendanceRecords.map((r) => r.studentId);

    // Absent students = students in class not in presentStudents
    const absentStudents = classDoc.studentIds.filter(
      (student) => !presentStudents.some((p) => p._id.equals(student._id))
    );

    res.status(200).json({
      subjectId,
      subjectName:
        classDoc.subjectIds.find((s) => s._id.equals(subjectId))?.name || "",
      presentStudents,
      absentStudents,
      totalPresent: presentStudents.length,
      totalAbsent: absentStudents.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
