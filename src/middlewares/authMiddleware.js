import jwt from "jsonwebtoken";

export const authenticateRole = (roles) => {
  return (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) return res.status(401).json({ message: "Unauthorized" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (roles.includes(decoded.role)) {
        req.user = decoded;
        return next();
      }

      return res.status(403).json({ message: "Forbidden: Not authorized" });
    } catch (error) {
      return res.status(403).json({ message: "Invalid Token" });
    }
  };
};
