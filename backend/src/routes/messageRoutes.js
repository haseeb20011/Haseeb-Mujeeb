const express = require("express");

const protectAdmin = require("../middleware/protectAdmin");

const {
  createMessage,
  getMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
  getMessageStats,
} = require("../controllers/messageController");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public contact form route
|--------------------------------------------------------------------------
| Visitors can submit a message without logging in.
*/
router.post("/", createMessage);

/*
|--------------------------------------------------------------------------
| Protected CMS routes
|--------------------------------------------------------------------------
| Everything below requires an authenticated admin.
*/
router.use(protectAdmin);

router.get("/stats", getMessageStats);

router.get("/", getMessages);

router.get("/:messageId", getMessageById);

router.patch("/:messageId", updateMessage);

router.delete("/:messageId", deleteMessage);

module.exports = router;