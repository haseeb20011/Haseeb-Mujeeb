const mongoose = require("mongoose");

const { Schema } = mongoose;

const activitySchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        "project",
        "message",
        "page",
        "media",
        "settings",
        "navigation",
        "seo",
        "style",
        "system",
      ],
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: [
        "created",
        "updated",
        "deleted",
        "published",
        "unpublished",
        "uploaded",
        "received",
        "read",
        "archived",
        "restored",
        "settings_updated",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    entityId: {
      type: String,
      default: "",
      trim: true,
    },

    entityType: {
      type: String,
      default: "",
      trim: true,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    admin: {
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

activitySchema.index({
  createdAt: -1,
});

activitySchema.index({
  type: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "Activity",
  activitySchema
);