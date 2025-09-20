// backend/src/controllers/analyticsController.js

// Student analytics
export const getStudentAnalytics = async (req, res) => {
  try {
    const studentId = req.params.id;

    // TODO: Calculate from MongoDB
    res.json({
      studentId,
      totalClasses: 30,
      attended: 28,
      percentage: "93%",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Class analytics
export const getClassAnalytics = async (req, res) => {
  try {
    const classId = req.params.classId;

    // TODO: Calculate from MongoDB
    res.json({
      classId,
      totalStudents: 50,
      avgAttendance: "88%",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
