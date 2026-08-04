require("dotenv").config();

const mongoose = require("mongoose");
const connectDatabase = require("../config/database");
const Admin = require("../models/Admin");

const resetAdminPassword = async () => {
  try {
    const email = String(process.env.ADMIN_EMAIL || "")
      .trim()
      .toLowerCase();

    const password = String(process.env.ADMIN_PASSWORD || "");

    if (!email || !password) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
    }

    if (password.length < 12) {
      throw new Error("Password must contain at least 12 characters.");
    }

    await connectDatabase();

    const admin = await Admin.findOne({ email });

    if (!admin) {
      throw new Error("No admin account was found with this email.");
    }

    admin.password = password;
    await admin.save();

    console.log("Admin password reset successfully.");
  } catch (error) {
    console.error("Password reset failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
};

resetAdminPassword();