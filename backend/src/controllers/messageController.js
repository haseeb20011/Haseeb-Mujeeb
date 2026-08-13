const mongoose = require("mongoose");
const Message = require("../models/Message");

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getMessageCounts = async () => {
  const [
    inbox,
    unread,
    starred,
    archived,
    total,
  ] = await Promise.all([
    Message.countDocuments({
      archived: false,
    }),

    Message.countDocuments({
      archived: false,
      unread: true,
    }),

    Message.countDocuments({
      archived: false,
      starred: true,
    }),

    Message.countDocuments({
      archived: true,
    }),

    Message.countDocuments({}),
  ]);

  return {
    inbox,
    unread,
    starred,
    archived,
    total,
  };
};

const createMessage = async (req, res, next) => {
  try {
    const {
      name,
      email,
      projectType,
      budget,
      subject,
      message,
      sourceUrl,
      website,
    } = req.body;

    // Honeypot field for spam bots.
    if (
      typeof website === "string" &&
      website.trim()
    ) {
      return res.status(201).json({
        success: true,
        message:
          "Thank you. Your message has been received.",
      });
    }

    if (
      !name?.trim() ||
      !email?.trim() ||
      !message?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, and message are required.",
      });
    }

    if (message.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide at least 20 characters in your message.",
      });
    }

    const createdMessage = await Message.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),

      projectType:
        projectType?.trim() || "Not specified",

      budget:
        budget?.trim() || "Not specified",

      subject:
        subject?.trim() ||
        "Portfolio website enquiry",

      message: message.trim(),

      sourceUrl:
        sourceUrl?.trim() || "",

      ipAddress:
        req.headers["x-forwarded-for"]
          ?.split(",")[0]
          ?.trim() ||
        req.socket?.remoteAddress ||
        "",

      userAgent:
        req.get("user-agent") || "",

      unread: true,
      starred: false,
      archived: false,
    });

    res.status(201).json({
      success: true,
      message:
        "Thank you. Your message has been received.",

      data: {
        id: createdMessage.id,
        createdAt: createdMessage.createdAt,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const firstError =
        Object.values(error.errors)[0];

      return res.status(400).json({
        success: false,
        message:
          firstError?.message ||
          "Please check the submitted information.",
      });
    }

    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const filterName =
      req.query.filter || "inbox";

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const query = {};

    if (filterName === "inbox") {
      query.archived = false;
    }

    if (filterName === "unread") {
      query.archived = false;
      query.unread = true;
    }

    if (filterName === "starred") {
      query.archived = false;
      query.starred = true;
    }

    if (filterName === "archived") {
      query.archived = true;
    }

    if (search) {
      const searchRegex = new RegExp(
        escapeRegex(search),
        "i"
      );

      query.$or = [
        {
          name: searchRegex,
        },
        {
          email: searchRegex,
        },
        {
          subject: searchRegex,
        },
        {
          projectType: searchRegex,
        },
        {
          budget: searchRegex,
        },
        {
          message: searchRegex,
        },
      ];
    }

    const requestedLimit = Number(
      req.query.limit
    );

    const limit = Number.isFinite(
      requestedLimit
    )
      ? Math.min(
          Math.max(requestedLimit, 1),
          100
        )
      : 100;

    const [messages, counts] =
      await Promise.all([
        Message.find(query)
          .sort({
            createdAt: -1,
          })
          .limit(limit),

        getMessageCounts(),
      ]);

    res.status(200).json({
      success: true,
      messages,
      counts,
    });
  } catch (error) {
    next(error);
  }
};

const getMessageById = async (
  req,
  res,
  next
) => {
  try {
    const { messageId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        messageId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const message = await Message.findById(
      messageId
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

const updateMessage = async (
  req,
  res,
  next
) => {
  try {
    const { messageId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        messageId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const allowedUpdates = [
      "unread",
      "starred",
      "archived",
    ];

    const updates = {};

    allowedUpdates.forEach((field) => {
      if (
        typeof req.body[field] ===
        "boolean"
      ) {
        updates[field] = req.body[field];
      }
    });

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        success: false,
        message:
          "No valid message updates were provided.",
      });
    }

    const updatedMessage =
      await Message.findByIdAndUpdate(
        messageId,
        updates,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    const counts =
      await getMessageCounts();

    res.status(200).json({
      success: true,
      message: updatedMessage,
      counts,
    });
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (
  req,
  res,
  next
) => {
  try {
    const { messageId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        messageId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const deletedMessage =
      await Message.findByIdAndDelete(
        messageId
      );

    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    const counts =
      await getMessageCounts();

    res.status(200).json({
      success: true,
      message:
        "Message deleted successfully.",
      counts,
    });
  } catch (error) {
    next(error);
  }
};

const getMessageStats = async (
  req,
  res,
  next
) => {
  try {
    const counts =
      await getMessageCounts();

    const recentMessages =
      await Message.find({
        archived: false,
      })
        .sort({
          createdAt: -1,
        })
        .limit(3);

    res.status(200).json({
      success: true,
      counts,
      recentMessages,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMessage,
  getMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
  getMessageStats,
};