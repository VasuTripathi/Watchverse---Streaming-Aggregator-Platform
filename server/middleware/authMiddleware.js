const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer")) {
    try {
      token = token.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ FIX: Validate that decoded.id is a real usable value
      // Old tokens had id: undefined (from user._id which doesn't exist in Supabase)
      // Those tokens decode to id = undefined or id = { ... } (object) — both invalid
      if (
        !decoded.id ||
        typeof decoded.id === "object" ||
        decoded.id === "undefined"
      ) {
        return res
          .status(401)
          .json({ message: "Invalid token: please log out and log in again" });
      }

      req.user = decoded.id;

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized" });
    }
  } else {
    return res.status(401).json({ message: "No token" });
  }
};

module.exports = protect;