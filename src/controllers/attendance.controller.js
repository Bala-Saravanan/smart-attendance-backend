// backend/src/controllers/attendanceController.js

// Mark attendance (calls Python face recognition API)
import axios from "axios";
import Attendance from "../models/attendance.model.js";
import FormData from "form-data";
import Subject from "../models/subject.model.js";
import Class from "../models/class.model.js";
import User from "../models/user.model.js";

// Recognize user face and mark attendance
// export const markAttendance = async (req, res) => {
//   try {
//     const file = req.file; // uploaded photo from multer

//     if (!file) {
//       return res.status(400).json({ message: "No image uploaded" });
//     }

//     const formData = new FormData();
//     formData.append("file", file.buffer, {
//       filename: file.originalname,
//       contentType: file.mimetype,
//     });

//     // Send image to FastAPI recognize-face API
//     const response = await axios.post(
//       "http://localhost:9999/recognize-face",
//       formData,
//       { headers: formData.getHeaders() }
//     );

//     const data = response.data;

//     if (data.status === "success") {
//       const studentId = data.studentId;

//       // Record attendance in MongoDB
//       await Attendance.create({
//         studentId,
//         date: new Date(),
//         status: "Present",
//       });

//       return res.json({
//         message: "Attendance marked",
//         studentId,
//         confidence: data.confidence,
//       });
//     } else {
//       return res.status(400).json({ message: data.message });
//     }
//   } catch (error) {
//     console.error("Mark Attendance Error:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// Recognize users in group photo and mark attendance
export const markAttendance = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const file = req.file; // uploaded photo from multer

    if (!file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const formData = new FormData();
    formData.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    // Send image to FastAPI recognize-face API
    const response = await axios.post(
      "http://localhost:9999/recognize-face",
      formData,
      { headers: formData.getHeaders() }
    );

    const data = response.data;

    if (data.status === "success") {
      const attendanceResults = [];

      for (const student of data.students) {
        const studentDoc = await User.findById(student.studentId);

        if (!studentDoc || studentDoc.role !== "student") {
          attendanceResults.push({
            email: student.email,
            message: "Student not found or invalid",
          });
          continue;
        }

        const classDoc = await Class.findById(studentDoc.classId);

        if (!classDoc) {
          attendanceResults.push({
            email: student.email,
            message: "Class not found",
          });
          continue;
        }

        // ❌ Subject not assigned to class → don’t store in DB
        if (!classDoc.subjectIds.includes(subjectId)) {
          attendanceResults.push({
            email: student.email,
            message: "Subject not part of this class",
          });
          continue;
        }

        // ✅ All checks passed → mark attendance in DB
        const record = await Attendance.create({
          studentId: student.studentId,
          subjectId,
          date: new Date(),
          status: "Present",
        });

        attendanceResults.push({
          email: student.email,
          confidence: student.confidence,
          message: "Attendance marked as Present",
        });
      }

      return res.json({
        message: "Attendance process completed",
        students: attendanceResults,
      });
    } else {
      return res.status(400).json({ message: data.message });
    }
  } catch (error) {
    console.error("Mark Attendance Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get attendance for a student
export const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.params.id;

    // TODO: Query MongoDB
    const attendanceRecords = await Attendance.find({ studentId });

    // Format results
    const records = attendanceRecords.map((record) => ({
      date: record.date.toISOString().split("T")[0], // only YYYY-MM-DD
      status: record.status,
    }));

    res.json({
      studentId,
      records,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get attendance for a class
export const getClassAttendance = async (req, res) => {
  try {
    const classId = req.params.classId;

    // TODO: Query MongoDB
    res.json({
      classId,
      summary: {
        totalStudents: 50,
        present: 45,
        absent: 5,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
