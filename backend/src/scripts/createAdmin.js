require("dotenv").config();

const mongoose = require("mongoose");
const connectDatabase = require("../config/database");
const Admin = require("../models/Admin");

const createAdmin = async () => {
  try {
    const name = String(process.env.ADMIN_NAME || "").trim();
    const email = String(process.env.ADMIN_EMAIL || "")
      .trim()
      .toLowerCase();
    const password = String(process.env.ADMIN_PASSWORD || "");

    if (!name || !email || !password) {
      throw new Error(
        "ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required."
      );
    }

    await connectDatabase();

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log("An admin with this email already exists.");
      return;
    }

    await Admin.create({
      name,
      email,
      password,
    });

    console.log("Admin account created successfully.");
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
};

createAdmin();