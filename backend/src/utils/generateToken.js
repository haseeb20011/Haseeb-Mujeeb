const jwt = require("jsonwebtoken");

const generateToken = (adminId) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is missing from the .env file.");
  }

  return jwt.sign(
    {
      role: "admin",
    },
    jwtSecret,
    {
      subject: adminId.toString(),
      expiresIn: "7d",
      issuer: "portfolio-cms-api",
      audience: "portfolio-cms-admin",
      algorithm: "HS256",
    }
  );
};

module.exports = generateToken;