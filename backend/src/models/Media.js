const mongoose = require("mongoose");

const { Schema } = mongoose;

const mediaSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    originalName: {
      type: String,
      default: "",
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "image",
        "video",
        "document",
      ],
      required: true,
    },

    mimeType: {
      type: String,
      default:
        "application/octet-stream",
      trim: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    blobPathname: {
      type: String,
      default: "",
      trim: true,
    },

    storageProvider: {
      type: String,
      default: "vercel-blob",
      trim: true,
    },

    alt: {
      type: String,
      default: "",
      trim: true,
    },

    caption: {
      type: String,
      default: "",
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    sizeBytes: {
      type: Number,
      default: 0,
      min: 0,
    },

    size: {
      type: String,
      default: "",
      trim: true,
    },

    width: {
      type: Number,
      default: null,
    },

    height: {
      type: Number,
      default: null,
    },

    dimensions: {
      type: String,
      default: "",
      trim: true,
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

mediaSchema.index({
  createdAt: -1,
});

mediaSchema.index({
  type: 1,
  createdAt: -1,
});

mediaSchema.index({
  title: "text",
  alt: "text",
  caption: "text",
  tags: "text",
});

module.exports = mongoose.model(
  "Media",
  mediaSchema
);