const Activity = require("../models/Activity");

/*
|--------------------------------------------------------------------------
| Save CMS Activity
|--------------------------------------------------------------------------
|
| Activity logging should never break the actual CMS operation.
| If logging fails, the project/media/page/etc. can still save normally.
|
*/

const logActivity = async ({
  type,
  action,
  title,
  description = "",
  entityId = "",
  entityType = "",
  metadata = {},
  admin = null,
}) => {
  try {
    return await Activity.create({
      type,
      action,
      title,
      description,
      entityId:
        entityId !== null &&
        entityId !== undefined
          ? String(entityId)
          : "",
      entityType:
        String(entityType || ""),
      metadata:
        metadata &&
        typeof metadata === "object"
          ? metadata
          : {},
      admin:
        admin?._id ||
        admin ||
        null,
    });
  } catch (error) {
    console.error(
      "Activity logging failed:",
      error.message
    );

    return null;
  }
};

module.exports = logActivity;