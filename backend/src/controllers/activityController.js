const Activity = require("../models/Activity");

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

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
          id:
            item.admin._id
              ? String(item.admin._id)
              : String(item.admin),

          name:
            item.admin.name || "",

          email:
            item.admin.email || "",
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
| Get recent real CMS activity.
|
| Examples:
| /api/activity
| /api/activity?limit=10
| /api/activity?type=project
|
*/

const getActivities = async (
  req,
  res,
  next
) => {
  try {
    const requestedLimit =
      Number.parseInt(
        req.query.limit,
        10
      ) || 10;

    const limit = Math.min(
      Math.max(
        requestedLimit,
        1
      ),
      100
    );

    const filter = {};

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

    if (
      req.query.type &&
      allowedTypes.includes(
        req.query.type
      )
    ) {
      filter.type =
        req.query.type;
    }

    const activities =
      await Activity.find(filter)
        .populate(
          "admin",
          "name email"
        )
        .sort({
          createdAt: -1,
        })
        .limit(limit);

    const total =
      await Activity.countDocuments(
        filter
      );

    res.status(200).json({
      success: true,

      count:
        activities.length,

      total,

      activities:
        activities.map(
          serializeActivity
        ),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/activity/summary
|--------------------------------------------------------------------------
|
| Small summary for the dashboard.
|
*/

const getActivitySummary = async (
  req,
  res,
  next
) => {
  try {
    const [
      total,
      projectCount,
      messageCount,
      pageCount,
      mediaCount,
    ] = await Promise.all([
      Activity.countDocuments(),

      Activity.countDocuments({
        type: "project",
      }),

      Activity.countDocuments({
        type: "message",
      }),

      Activity.countDocuments({
        type: "page",
      }),

      Activity.countDocuments({
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