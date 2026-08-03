const express = require("express");

const {
  loginAdmin,
  getCurrentAdmin,
  logoutAdmin,
} = require("../controllers/authController");

const protectAdmin = require("../middleware/protectAdmin");

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/me", protectAdmin, getCurrentAdmin);
router.post("/logout", logoutAdmin);

module.exports = router;