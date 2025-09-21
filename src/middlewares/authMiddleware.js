import jwt from "jsonwebtoken";

export const authenticateRole = (roles) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).send("Unauthorized");

      const token = authHeader.split(" ")[1];
      if (!token) return res.status(401).json({ message: "Unauthorized" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);

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
