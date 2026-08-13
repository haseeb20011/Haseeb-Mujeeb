const Activity = require("../models/Activity");

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const LEGACY_NOISE_FILTER = {
  title: {
    $ne: "Synchronized project defaults",
  },
};

const serializeActivity = (activity) => {
  const item =
    typeof activity.toObject === "function"
      ? activity.toObject()
      : activity;

  return {
    id: String(item._id),
    type: item.type || "system",
    action: item.action || "updated",
    title: item.title || "",
    description: item.description || "",
    entityId: item.entityId || "",
    entityType: item.entityType || "",
    metadata:
      item.metadata &&
      typeof item.metadata === "object"
        ? item.metadata
        : {},
    admin: item.admin
      ? {
          id: item.admin._id
            ? String(item.admin._id)
            : String(item.admin),
          name: item.admin.name || "",
          email: item.admin.email || "",
        }
      : null,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

/*
|--------------------------------------------------------------------------
| GET /api/activity
|--------------------------------------------------------------------------
|
| Returns meaningful CMS activity only.
| Legacy automatic project-default sync records are intentionally excluded.
|
*/

const getActivities = async (req, res, next) => {
  try {
    const requestedLimit =
      Number.parseInt(req.query.limit, 10) || 10;

    const limit = Math.min(
      Math.max(requestedLimit, 1),
      100
    );

    const allowedTypes = [
      "project",
      "message",
      "page",
      "media",
      "settings",
      "navigation",
      "seo",
      "style",
      "system",
    ];

    const filter = {
      ...LEGACY_NOISE_FILTER,
    };

    if (
      req.query.type &&
      allowedTypes.includes(req.query.type)
    ) {
      filter.type = req.query.type;
    }

    const [activities, total] =
      await Promise.all([
        Activity.find(filter)
          .populate("admin", "name email")
          .sort({ createdAt: -1 })
          .limit(limit),

        Activity.countDocuments(filter),
      ]);

    res.status(200).json({
      success: true,
      count: activities.length,
      total,
      activities:
        activities.map(serializeActivity),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/activity/summary
|--------------------------------------------------------------------------
*/

const getActivitySummary = async (
  req,
  res,
  next
) => {
  try {
    const meaningfulFilter = {
      ...LEGACY_NOISE_FILTER,
    };

    const [
      total,
      projectCount,
      messageCount,
      pageCount,
      mediaCount,
    ] = await Promise.all([
      Activity.countDocuments(
        meaningfulFilter
      ),

      Activity.countDocuments({
        ...meaningfulFilter,
        type: "project",
      }),

      Activity.countDocuments({
        ...meaningfulFilter,
        type: "message",
      }),

      Activity.countDocuments({
        ...meaningfulFilter,
        type: "page",
      }),

      Activity.countDocuments({
        ...meaningfulFilter,
        type: "media",
      }),
    ]);

    res.status(200).json({
      success: true,
      summary: {
        total,
        project: projectCount,
        message: messageCount,
        page: pageCount,
        media: mediaCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivities,
  getActivitySummary,
};
