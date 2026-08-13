const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required."],
      trim: true,
      maxlength: [140, "Project title is too long."],
    },
    slug: {
      type: String,
      required: [true, "Project slug is required."],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [160, "Project slug is too long."],
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Project slug must contain only lowercase letters, numbers, and hyphens.",
      ],
    },
    code: {
      type: String,
      trim: true,
      default: "",
      maxlength: 10,
    },
    category: {
      type: String,
      trim: true,
      default: "Website",
      maxlength: [120, "Project category is too long."],
    },
    projectType: {
      type: String,
      trim: true,
      default: "",
      maxlength: 180,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    publicStatus: {
      type: String,
      trim: true,
      default: "Live",
      maxlength: 80,
    },
    statusTone: {
      type: String,
      enum: ["live", "development"],
      default: "live",
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [3000, "Project description is too long."],
    },
    domain: {
      type: String,
      trim: true,
      default: "",
      maxlength: 300,
    },
    role: {
      type: String,
      trim: true,
      default: "",
      maxlength: 300,
    },
    platform: {
      type: String,
      trim: true,
      default: "",
      maxlength: 300,
    },
    focus: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
    highlight: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
    challenge: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000,
    },
    solution: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000,
    },
    outcome: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000,
    },
    details: {
      type: [String],
      default: [],
    },
    technologies: {
      type: [String],
      default: [],
    },
    filters: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: "",
    },
    liveUrl: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Live website URL is too long."],
    },
    caseStudyUrl: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Case study URL is too long."],
    },
    caseStudyEnabled: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    accent: {
      type: String,
      trim: true,
      default: "#8B5CF6",
      maxlength: 20,
    },
    badgeBg: {
      type: String,
      trim: true,
      default: "#6D28D9",
      maxlength: 20,
    },
    tone: {
      type: String,
      enum: [
        "purple",
        "pink",
        "orange",
        "blue",
        "green",
        "amber",
        "red",
      ],
      default: "purple",
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    migrationVersion: {
      type: Number,
      default: 0,
      select: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({
  status: 1,
  featured: -1,
  sortOrder: 1,
  createdAt: -1,
});

const transformProject = (document, returnedObject) => {
  returnedObject.id = returnedObject._id.toString();

  delete returnedObject._id;
  delete returnedObject.__v;
  delete returnedObject.createdBy;
  delete returnedObject.migrationVersion;

  return returnedObject;
};

projectSchema.set("toJSON", {
  virtuals: true,
  transform: transformProject,
});

projectSchema.set("toObject", {
  virtuals: true,
  transform: transformProject,
});

module.exports = mongoose.model("Project", projectSchema);
