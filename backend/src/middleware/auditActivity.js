const logActivity = require("../utils/logActivity");

const pickEntityId = (req, payload) => {
  const candidates = [
    payload?.message?.id,
    payload?.message?._id,
    payload?.item?.id,
    payload?.item?._id,
    payload?.project?.id,
    payload?.project?._id,
    payload?.page?.id,
    payload?.page?._id,
  ].filter(Boolean);

  if (candidates.length > 0) {
    return String(candidates[0]);
  }

  const parts = String(req.originalUrl || "")
    .split("?")[0]
    .split("/")
    .filter(Boolean);

  const last = parts.at(-1) || "";

  return /^[a-f0-9]{24}$/i.test(last) ? last : "";
};

const buildMessageActivity = (req, payload) => {
  const method = req.method;
  const body = req.body || {};
  const name =
    body.name ||
    payload?.message?.name ||
    payload?.name ||
    "Website visitor";

  if (method === "POST") {
    return {
      type: "message",
      action: "received",
      title: `Message from ${name}`,
      description:
        body.subject ||
        payload?.message?.subject ||
        "New portfolio enquiry received.",
      entityId: pickEntityId(req, payload),
      entityType: "Message",
      metadata: {
        email: body.email || payload?.message?.email || "",
        projectType:
          body.projectType || payload?.message?.projectType || "",
      },
    };
  }

  if (method === "DELETE") {
    return {
      type: "message",
      action: "deleted",
      title: "Deleted contact message",
      description: "A contact message was permanently deleted.",
      entityId: pickEntityId(req, payload),
      entityType: "Message",
    };
  }

  if (method === "PATCH" || method === "PUT") {
    if (body.archived === true) {
      return {
        type: "message",
        action: "archived",
        title: "Archived contact message",
        description: "A contact message was moved to the archive.",
        entityId: pickEntityId(req, payload),
        entityType: "Message",
      };
    }

    if (body.archived === false) {
      return {
        type: "message",
        action: "restored",
        title: "Restored contact message",
        description: "A contact message was moved back to the inbox.",
        entityId: pickEntityId(req, payload),
        entityType: "Message",
      };
    }

    if (body.unread === false) {
      return {
        type: "message",
        action: "read",
        title: "Read contact message",
        description: "A contact message was marked as read.",
        entityId: pickEntityId(req, payload),
        entityType: "Message",
      };
    }

    return {
      type: "message",
      action: "updated",
      title: "Updated contact message",
      description: "Contact message details were updated.",
      entityId: pickEntityId(req, payload),
      entityType: "Message",
    };
  }

  return null;
};

const buildSiteConfigActivity = (req) => {
  const method = req.method;
  const url = String(req.originalUrl || "").split("?")[0];
  const body = req.body || {};

  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return null;
  }

  if (url.includes("/pages/")) {
    const pageKey = decodeURIComponent(url.split("/").filter(Boolean).at(-1));

    return {
      type: "page",
      action: body.status === "published" ? "published" : "updated",
      title:
        body.status === "published"
          ? `Published ${body.title || pageKey} page`
          : `Updated ${body.title || pageKey} page`,
      description:
        body.status === "published"
          ? "Page content was published."
          : "Page content or settings were updated.",
      entityId: pageKey,
      entityType: "Page",
      metadata: {
        pageKey,
        status: body.status || "",
      },
    };
  }

  if (url.endsWith("/pages")) {
    return {
      type: "page",
      action: "updated",
      title: "Updated website pages",
      description: "Page list or page settings were updated.",
      entityType: "Page",
    };
  }

  if (url.endsWith("/styles")) {
    return {
      type: "style",
      action: "updated",
      title: "Updated site styles",
      description: "Global website styling was updated.",
      entityType: "SiteStyles",
    };
  }

  if (url.endsWith("/navigation")) {
    return {
      type: "navigation",
      action: "updated",
      title: "Updated navigation",
      description: "Website navigation settings were updated.",
      entityType: "Navigation",
    };
  }

  if (url.endsWith("/seo")) {
    return {
      type: "seo",
      action: "updated",
      title: "Updated SEO settings",
      description: "Website SEO configuration was updated.",
      entityType: "SEO",
    };
  }

  if (url.endsWith("/settings")) {
    return {
      type: "settings",
      action: "settings_updated",
      title: "Updated website settings",
      description: "Portfolio website settings were updated.",
      entityType: "Settings",
    };
  }

  if (url.endsWith("/initialize")) {
    return {
      type: "system",
      action: "updated",
      title: "Initialized site configuration",
      description: "The central site configuration was initialized.",
      entityType: "SiteConfig",
    };
  }

  return null;
};

const auditActivity = (scope) => (req, res, next) => {
  let responsePayload = null;
  const originalJson = res.json.bind(res);

  res.json = (payload) => {
    responsePayload = payload;
    return originalJson(payload);
  };

  res.on("finish", () => {
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return;
    }

    let activity = null;

    if (scope === "message") {
      activity = buildMessageActivity(req, responsePayload);
    }

    if (scope === "site-config") {
      activity = buildSiteConfigActivity(req);
    }

    if (!activity) {
      return;
    }

    void logActivity({
      ...activity,
      admin: req.admin || null,
    });
  });

  next();
};

module.exports = auditActivity;
