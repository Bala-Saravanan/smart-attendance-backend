// backend/src/controllers/userController.js

// Register new user (student, teacher, or admin)
import axios from "axios";
import User from "../models/user.model.js";
import FormData from "form-data";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Class from "../models/class.model.js";

export const registerFace = async (req, res) => {
  try {
    const { details } = req.body;
    const student_details = JSON.parse(details);
    const file = req.file; // multer upload

    if (!file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(student_details.password, 10);

    // find class
    const ClassDoc = await Class.findOne({ name: student_details.ClassName });
    if (!ClassDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    // build student object
    const studentData = {
      name: student_details.name,
      email: student_details.email,
      password: hashedPassword,
      role: student_details.role,
      rollNumber: student_details?.rollNumber,
      classId: ClassDoc._id,
    };

    // build form-data for FastAPI
    const formData = new FormData();
    formData.append("studentData", JSON.stringify(studentData));
    formData.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    // call FastAPI service
    const response = await axios.post(
      "http://localhost:8000/register-face",
      formData,
      { headers: formData.getHeaders() }
    );

    if (response.data.status === "success") {
      // upsert student in MongoDB
      const newStudent = await User.findOneAndUpdate(
        { email: studentData.email },
        {
          ...studentData,
          faceRegistered: true,
          // store encoding only if you want, else skip it
          faceEncoding: response.data.encoding,
        },
        { new: true, upsert: true } // upsert ensures student is created if not exist
      );

      // link student with class
      if (!ClassDoc.studentIds.includes(newStudent._id)) {
        ClassDoc.studentIds.push(newStudent._id);
        await ClassDoc.save();
      }

      return res.json({
        message: "Face registered successfully",
        student: await User.findById(newStudent._id).select(
          "-faceEncoding -password -__v"
        ),
      });
    } else {
      return res.status(400).json({ message: response.data.message });
    }
  } catch (error) {
    console.error("Register Face Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Login user
export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await User.findOne({ email });
    if (!student || student.role !== "student") {
      return res.status(404).json({
        message: "student not found!",
      });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "invalid password",
      });
    }
    // TODO: Verify user from MongoDB
    const token = jwt.sign(
      { id: student._id, email: student.email, role: student.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.cookie("token", token, {
      httpOnly: true, // prevents client-side JS access
      secure: process.env.NODE_ENV === "production", // only over HTTPS in production
      sameSite: "None",
    });
    return res.status(200).json({
      message: "Student Login Successful!",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // TODO: Fetch user from MongoDB
    res.json({
      id: userId,
      name: "Sample User",
      role: "student",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const registerTeacher = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        message: "Teacher already Registered",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newTeacher = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    await newTeacher.save();
    return res.status(201).json({
      message: "Teacher created successfully",
      teacher: {
        id: newTeacher._id,
        name: newTeacher.name,
        email: newTeacher.email,
      },
    });
  } catch (error) {
    console.log("Error registering teacher: ", error);
    return res.status(500).json({ error: error.message });
  }
};

export const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;
    const teacher = await User.findOne({ email });

    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ message: "Teacher not found" });
    }
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Password",
      });
    }
    const token = jwt.sign(
      { id: teacher._id, email: teacher.email, role: teacher.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // 1 day expiry
    );
    console.log(token);
    res.cookie("token", token, {
      httpOnly: true, // prevents client-side JS access
      secure: process.env.NODE_ENV === "production", // only over HTTPS in production
      sameSite: "None",
    });

    return res.status(200).json({
      message: `Login Successful! Welcome ${teacher.name}`,
    });
  } catch (error) {
    console.log("Error Logging in Teacher", error);
    return res.status(500).json({ message: error.message });
  }
};

export const logoutTeacher = (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logged out successfully" });
};
