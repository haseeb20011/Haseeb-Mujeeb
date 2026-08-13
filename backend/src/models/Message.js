const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      maxlength: [120, "Name is too long."],
    },

    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
      maxlength: [254, "Email is too long."],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address.",
      ],
    },

    projectType: {
      type: String,
      trim: true,
      default: "Not specified",
      maxlength: [160, "Project type is too long."],
    },

    budget: {
      type: String,
      trim: true,
      default: "Not specified",
      maxlength: [160, "Budget value is too long."],
    },

    subject: {
      type: String,
      trim: true,
      default: "Portfolio website enquiry",
      maxlength: [200, "Subject is too long."],
    },

    message: {
      type: String,
      required: [true, "Message is required."],
      trim: true,
      minlength: [
        20,
        "Please provide at least 20 characters.",
      ],
      maxlength: [10000, "Message is too long."],
    },

    sourceUrl: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Source URL is too long."],
    },

    ipAddress: {
      type: String,
      trim: true,
      default: "",
      maxlength: [120, "IP address is too long."],
      select: false,
    },

    userAgent: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "User agent is too long."],
      select: false,
    },

    unread: {
      type: Boolean,
      default: true,
      index: true,
    },

    starred: {
      type: Boolean,
      default: false,
      index: true,
    },

    archived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({
  archived: 1,
  createdAt: -1,
});

messageSchema.index({
  unread: 1,
  createdAt: -1,
});

const transformMessage = (
  document,
  returnedObject
) => {
  returnedObject.id =
    returnedObject._id.toString();

  delete returnedObject._id;
  delete returnedObject.__v;
  delete returnedObject.ipAddress;
  delete returnedObject.userAgent;

  return returnedObject;
};

messageSchema.set("toJSON", {
  virtuals: true,
  transform: transformMessage,
});

messageSchema.set("toObject", {
  virtuals: true,
  transform: transformMessage,
});

module.exports = mongoose.model(
  "Message",
  messageSchema
);