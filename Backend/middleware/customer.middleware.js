import jwt from "jsonwebtoken";

const customerAuth = (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies?.customerToken;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication failed: No token provided" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token is for a customer
    if (decodedToken.role !== "customer") {
      return res
        .status(403)
        .json({ message: "Not authorized: Customer access only" });
    }

    req.userId = decodedToken.id;
    req.userRole = decodedToken.role;

    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication failed: Invalid token" });
  }
};

export default customerAuth;
