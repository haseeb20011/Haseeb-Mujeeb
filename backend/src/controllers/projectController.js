const mongoose = require("mongoose");
const Project = require("../models/Project");
const logActivity = require("../utils/logActivity");

const tones = [
  "purple",
  "pink",
  "orange",
  "blue",
  "green",
  "amber",
  "red",
];

const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const cleanString = (value, fallback = "") =>
  typeof value === "string" ? value.trim() : fallback;

const cleanStringArray = (value, limit = 40) => {
  const entries = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/\r?\n|,/)
      : [];

  return Array.from(
    new Set(
      entries
        .map((item) => cleanString(item))
        .filter(Boolean)
    )
  ).slice(0, limit);
};

const cleanTone = (value, fallback = "purple") =>
  tones.includes(value) ? value : fallback;

const projectPayload = (body = {}) => ({
  title: cleanString(body.title),
  slug: slugify(body.slug || body.title),
  code: cleanString(body.code).toUpperCase().slice(0, 10),
  category:
    cleanString(body.category, "Website") || "Website",
  projectType: cleanString(body.projectType),
  status:
    body.status === "published" ? "published" : "draft",
  publicStatus:
    cleanString(body.publicStatus, "Live") || "Live",
  statusTone:
    body.statusTone === "development"
      ? "development"
      : "live",
  description: cleanString(body.description),
  domain: cleanString(body.domain),
  role: cleanString(body.role),
  platform: cleanString(body.platform),
  focus: cleanString(body.focus),
  highlight: cleanString(body.highlight),
  challenge: cleanString(body.challenge),
  solution: cleanString(body.solution),
  outcome: cleanString(body.outcome),
  details: cleanStringArray(body.details, 50),
  technologies: cleanStringArray(
    body.technologies,
    30
  ),
  filters: cleanStringArray(body.filters, 20),
  image: cleanString(body.image),
  liveUrl: cleanString(body.liveUrl),
  caseStudyUrl: cleanString(body.caseStudyUrl),
  caseStudyEnabled:
    body.caseStudyEnabled !== false,
  featured: Boolean(body.featured),
  accent:
    cleanString(body.accent, "#8B5CF6") ||
    "#8B5CF6",
  badgeBg:
    cleanString(body.badgeBg, "#6D28D9") ||
    "#6D28D9",
  tone: cleanTone(body.tone),
});

const ensureValidProjectId = (projectId) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    const error = new Error("Invalid project ID.");
    error.statusCode = 400;
    throw error;
  }
};

const findAvailableSlug = async (
  requestedSlug,
  excludedProjectId = null
) => {
  const baseSlug = slugify(requestedSlug) || "project";
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const query = {
      slug: candidate,
    };

    if (excludedProjectId) {
      query._id = {
        $ne: excludedProjectId,
      };
    }

    const existingProject = await Project.exists(query);

    if (!existingProject) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};

const handleProjectError = (error, next) => {
  if (error?.code === 11000) {
    error.statusCode = 409;
    error.message =
      "A project with this slug already exists.";
  }

  if (error?.name === "ValidationError") {
    error.statusCode = 400;
    error.message = Object.values(error.errors)
      .map((item) => item.message)
      .join(" ");
  }

  if (error?.name === "CastError") {
    error.statusCode = 400;
    error.message = "Invalid project ID.";
  }

  next(error);
};

const serializeLeanProjects = (projects) =>
  projects.map((project) => {
    const normalized = {
      ...project,
      id: project._id.toString(),
    };

    delete normalized._id;
    delete normalized.__v;
    delete normalized.createdBy;
    delete normalized.migrationVersion;

    return normalized;
  });

const getPublicProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      status: "published",
    })
      .sort({
        sortOrder: 1,
        createdAt: -1,
      })
      .select("-createdBy -migrationVersion")
      .lean();

    res.status(200).json({
      success: true,
      count: projects.length,
      projects: serializeLeanProjects(projects),
    });
  } catch (error) {
    handleProjectError(error, next);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .sort({
        sortOrder: 1,
        createdAt: -1,
      })
      .select("+migrationVersion")
      .lean();

    res.status(200).json({
      success: true,
      count: projects.length,
      projects: serializeLeanProjects(projects),
    });
  } catch (error) {
    handleProjectError(error, next);
  }
};

const createProject = async (req, res, next) => {
  try {
    const previousStatus = project.status;
    const payload = projectPayload(req.body);

    if (!payload.title || !payload.slug) {
      return res.status(400).json({
        success: false,
        message:
          "Project title and project slug are required.",
      });
    }

    payload.slug = await findAvailableSlug(payload.slug);

    const projectCount = await Project.countDocuments();

    const project = await Project.create({
      ...payload,
      sortOrder: projectCount,
      migrationVersion: 2,
      createdBy: req.admin._id,
    });

    await logActivity({
      type: "project",
      action: "created",
      title: `Created ${project.title}`,
      description:
        project.status === "published"
          ? "Project was created and published."
          : "Project was created as a draft.",
      entityId: project._id,
      entityType: "Project",
      metadata: {
        slug: project.slug,
        status: project.status,
        featured: project.featured,
      },
      admin: req.admin,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully.",
      project,
    });
  } catch (error) {
    handleProjectError(error, next);
  }
};

const updateProject = async (req, res, next) => {
  try {
    ensureValidProjectId(req.params.projectId);

    const project = await Project.findById(
      req.params.projectId
    ).select("+migrationVersion");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const payload = projectPayload(req.body);

    if (!payload.title || !payload.slug) {
      return res.status(400).json({
        success: false,
        message:
          "Project title and project slug are required.",
      });
    }

    payload.slug = await findAvailableSlug(
      payload.slug,
      project._id
    );

    Object.assign(project, payload, {
      migrationVersion: 2,
    });

    await project.save();

    let activityAction = "updated";
    let activityDescription = "Project details were updated.";

    if (
      previousStatus !== "published" &&
      project.status === "published"
    ) {
      activityAction = "published";
      activityDescription = "Project was published.";
    } else if (
      previousStatus === "published" &&
      project.status !== "published"
    ) {
      activityAction = "unpublished";
      activityDescription = "Project was moved back to draft.";
    }

    await logActivity({
      type: "project",
      action: activityAction,
      title:
        activityAction === "published"
          ? `Published ${project.title}`
          : activityAction === "unpublished"
            ? `Unpublished ${project.title}`
            : `Updated ${project.title}`,
      description: activityDescription,
      entityId: project._id,
      entityType: "Project",
      metadata: {
        slug: project.slug,
        status: project.status,
        featured: project.featured,
      },
      admin: req.admin,
    });

    res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      project,
    });
  } catch (error) {
    handleProjectError(error, next);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    ensureValidProjectId(req.params.projectId);

    const project = await Project.findByIdAndDelete(
      req.params.projectId
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    await logActivity({
      type: "project",
      action: "deleted",
      title: `Deleted ${project.title}`,
      description: "Project was permanently deleted.",
      entityId: project._id,
      entityType: "Project",
      metadata: {
        slug: project.slug,
        status: project.status,
      },
      admin: req.admin,
    });

    res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
      projectId: req.params.projectId,
    });
  } catch (error) {
    handleProjectError(error, next);
  }
};

const duplicateProject = async (req, res, next) => {
  try {
    ensureValidProjectId(req.params.projectId);

    const sourceProject = await Project.findById(
      req.params.projectId
    );

    if (!sourceProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const slug = await findAvailableSlug(
      `${sourceProject.slug}-copy`
    );

    const projectCount = await Project.countDocuments();

    const duplicateData = sourceProject.toObject();

    delete duplicateData.id;
    delete duplicateData._id;
    delete duplicateData.__v;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    delete duplicateData.createdBy;

    const duplicatedProject = await Project.create({
      ...duplicateData,
      title: `${sourceProject.title} Copy`,
      slug,
      status: "draft",
      featured: false,
      sortOrder: projectCount,
      migrationVersion: 2,
      createdBy: req.admin._id,
    });

    await logActivity({
      type: "project",
      action: "created",
      title: `Duplicated ${sourceProject.title}`,
      description: `Created draft copy "${duplicatedProject.title}".`,
      entityId: duplicatedProject._id,
      entityType: "Project",
      metadata: {
        sourceProjectId: String(sourceProject._id),
        sourceTitle: sourceProject.title,
        slug: duplicatedProject.slug,
        status: duplicatedProject.status,
      },
      admin: req.admin,
    });

    res.status(201).json({
      success: true,
      message: "Project duplicated successfully.",
      project: duplicatedProject,
    });
  } catch (error) {
    handleProjectError(error, next);
  }
};

const setProjectFeatured = async (req, res, next) => {
  try {
    ensureValidProjectId(req.params.projectId);

    const project = await Project.findById(
      req.params.projectId
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    project.featured = Boolean(req.body.featured);

    await project.save();

    await logActivity({
      type: "project",
      action: "updated",
      title: project.featured
        ? `Featured ${project.title}`
        : `Unfeatured ${project.title}`,
      description: project.featured
        ? "Project was added to homepage Featured Projects."
        : "Project was removed from homepage Featured Projects.",
      entityId: project._id,
      entityType: "Project",
      metadata: {
        slug: project.slug,
        featured: project.featured,
        status: project.status,
      },
      admin: req.admin,
    });

    res.status(200).json({
      success: true,
      message: project.featured
        ? "Project added to homepage Featured Projects."
        : "Project removed from homepage Featured Projects.",
      project,
    });
  } catch (error) {
    handleProjectError(error, next);
  }
};

const syncDefaultProjects = async (req, res, next) => {
  try {
    const sourceProjects = Array.isArray(
      req.body.projects
    )
      ? req.body.projects.slice(0, 120)
      : [];

    if (sourceProjects.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Provide at least one project to synchronize.",
      });
    }

    const fillWhenEmpty = [
      "code",
      "projectType",
      "publicStatus",
      "description",
      "domain",
      "role",
      "platform",
      "focus",
      "highlight",
      "challenge",
      "solution",
      "outcome",
      "image",
      "liveUrl",
      "caseStudyUrl",
      "accent",
      "badgeBg",
    ];

    for (
      let index = 0;
      index < sourceProjects.length;
      index += 1
    ) {
      const source = sourceProjects[index];
      const payload = projectPayload(source);
      const legacySlugs = cleanStringArray(
        source.legacySlugs,
        10
      ).map(slugify);

      if (!payload.title || !payload.slug) {
        continue;
      }

      const existingProject = await Project.findOne({
        $or: [
          {
            slug: payload.slug,
          },
          ...(legacySlugs.length > 0
            ? [
                {
                  slug: {
                    $in: legacySlugs,
                  },
                },
              ]
            : []),
        ],
      }).select("+migrationVersion");

      if (!existingProject) {
        await Project.create({
          ...payload,
          sortOrder: Number.isFinite(source.sortOrder)
            ? source.sortOrder
            : index,
          migrationVersion: 2,
          createdBy: req.admin._id,
        });

        continue;
      }

      const currentVersion =
        existingProject.migrationVersion || 0;

      fillWhenEmpty.forEach((fieldName) => {
        if (
          !existingProject[fieldName] &&
          payload[fieldName]
        ) {
          existingProject[fieldName] =
            payload[fieldName];
        }
      });

      if (
        (!Array.isArray(existingProject.details) ||
          existingProject.details.length === 0) &&
        payload.details.length > 0
      ) {
        existingProject.details = payload.details;
      }

      if (
        (!Array.isArray(
          existingProject.technologies
        ) ||
          existingProject.technologies.length === 0) &&
        payload.technologies.length > 0
      ) {
        existingProject.technologies =
          payload.technologies;
      }

      if (
        (!Array.isArray(existingProject.filters) ||
          existingProject.filters.length === 0) &&
        payload.filters.length > 0
      ) {
        existingProject.filters = payload.filters;
      }

      if (currentVersion < 2) {
        const migrationPayload = {
          ...payload,
        };

        delete migrationPayload.slug;

        Object.assign(
          existingProject,
          migrationPayload,
          {
            migrationVersion: 2,
          }
        );
      }

      if (
        legacySlugs.includes(existingProject.slug) &&
        existingProject.slug !== payload.slug
      ) {
        const slugInUse = await Project.exists({
          slug: payload.slug,
          _id: {
            $ne: existingProject._id,
          },
        });

        if (!slugInUse) {
          existingProject.slug = payload.slug;
        }
      }

      await existingProject.save();
    }

    const projects = await Project.find()
      .sort({
        sortOrder: 1,
        createdAt: -1,
      })
      .select("+migrationVersion")
      .lean();

    await logActivity({
      type: "project",
      action: "updated",
      title: "Synchronized project defaults",
      description:
        "Project records and case-study defaults were synchronized.",
      entityType: "Project",
      metadata: {
        projectCount: projects.length,
      },
      admin: req.admin,
    });

    res.status(200).json({
      success: true,
      message:
        "Project records and case-study defaults are synchronized.",
      count: projects.length,
      projects: serializeLeanProjects(projects),
    });
  } catch (error) {
    handleProjectError(error, next);
  }
};

module.exports = {
  getPublicProjects,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  duplicateProject,
  setProjectFeatured,
  syncDefaultProjects,
};
