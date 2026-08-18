const Media = require("../models/Media");
const Project = require("../models/Project");
const logActivity = require("../utils/logActivity");

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags
      .map((tag) => String(tag).trim())
      .filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};

const getMediaType = (mimeType = "") => {
  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.startsWith("video/")) {
    return "video";
  }

  return "document";
};

const formatFileSize = (bytes = 0) => {
  const value = Number(bytes);

  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${Math.round(value / 1024)} KB`;
  }

  if (value < 1024 * 1024 * 1024) {
    return `${(
      value /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    value /
    (1024 * 1024 * 1024)
  ).toFixed(1)} GB`;
};

const formatDimensions = (
  width,
  height,
  type
) => {
  if (
    Number.isFinite(Number(width)) &&
    Number.isFinite(Number(height)) &&
    Number(width) > 0 &&
    Number(height) > 0
  ) {
    return `${Number(width)} × ${Number(
      height
    )}`;
  }

  if (type === "document") {
    return "Document";
  }

  return "";
};

const escapeRegExp = (value = "") =>
  value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

const serializeMedia = (media) => {
  const item =
    typeof media.toObject === "function"
      ? media.toObject()
      : media;

  return {
    id: String(item._id),

    title: item.title || "",

    originalName:
      item.originalName || "",

    type: item.type || "document",

    mimeType:
      item.mimeType ||
      "application/octet-stream",

    url: item.url || "",

    blobPathname:
      item.blobPathname || "",

    storageProvider:
      item.storageProvider || "",

    alt: item.alt || "",

    caption: item.caption || "",

    tags: Array.isArray(item.tags)
      ? item.tags
      : [],

    sizeBytes:
      Number(item.sizeBytes) || 0,

    size:
      item.size ||
      formatFileSize(item.sizeBytes),

    width:
      item.width ?? null,

    height:
      item.height ?? null,

    dimensions:
      item.dimensions ||
      formatDimensions(
        item.width,
        item.height,
        item.type
      ),

    uploadedAt:
      item.createdAt || null,

    createdAt:
      item.createdAt || null,

    updatedAt:
      item.updatedAt || null,
  };
};

/*
|--------------------------------------------------------------------------
| GET /api/media
|--------------------------------------------------------------------------
| Get all saved media.
|--------------------------------------------------------------------------
*/

const getMedia = async (
  req,
  res,
  next
) => {
  try {
    const {
      type = "all",
      search = "",
    } = req.query;

    const filter = {};

    if (
      ["image", "video", "document"].includes(
        type
      )
    ) {
      filter.type = type;
    }

    const normalizedSearch = String(
      search || ""
    ).trim();

    if (normalizedSearch) {
      const expression = new RegExp(
        escapeRegExp(normalizedSearch),
        "i"
      );

      filter.$or = [
        {
          title: expression,
        },
        {
          originalName: expression,
        },
        {
          alt: expression,
        },
        {
          caption: expression,
        },
        {
          tags: expression,
        },
      ];
    }

    const media = await Media.find(filter)
      .sort({
        createdAt: -1,
      })
      .limit(500);

    const items = media.map(
      serializeMedia
    );

    res.status(200).json({
      success: true,

      count: items.length,

      items,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/media/:mediaId
|--------------------------------------------------------------------------
*/

const getMediaItem = async (
  req,
  res,
  next
) => {
  try {
    const media =
      await Media.findById(
        req.params.mediaId
      );

    if (!media) {
      return res.status(404).json({
        success: false,
        message:
          "Media item not found.",
      });
    }

    res.status(200).json({
      success: true,
      item: serializeMedia(media),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/media
|--------------------------------------------------------------------------
| Store metadata after the browser successfully uploads a file to
| Vercel Blob.
|--------------------------------------------------------------------------
*/

const createMedia = async (
  req,
  res,
  next
) => {
  try {
    const {
      title,
      originalName,
      type,
      mimeType,
      url,
      blobPathname,
      storageProvider,
      alt,
      caption,
      tags,
      sizeBytes,
      size,
      width,
      height,
      dimensions,
    } = req.body;

    if (
      !url ||
      !String(url).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Media URL is required.",
      });
    }

    const normalizedMimeType =
      String(
        mimeType ||
          "application/octet-stream"
      ).trim();

    const normalizedType =
      ["image", "video", "document"].includes(
        type
      )
        ? type
        : getMediaType(
            normalizedMimeType
          );

    const normalizedSizeBytes =
      Number.isFinite(
        Number(sizeBytes)
      )
        ? Number(sizeBytes)
        : 0;

    const normalizedWidth =
      Number.isFinite(Number(width)) &&
      Number(width) > 0
        ? Number(width)
        : null;

    const normalizedHeight =
      Number.isFinite(Number(height)) &&
      Number(height) > 0
        ? Number(height)
        : null;

    const media = await Media.create({
      title:
        String(
          title ||
            originalName ||
            "Untitled Media"
        ).trim(),

      originalName:
        String(
          originalName || ""
        ).trim(),

      type:
        normalizedType,

      mimeType:
        normalizedMimeType,

      url:
        String(url).trim(),

      blobPathname:
        String(
          blobPathname || ""
        ).trim(),

      storageProvider:
        String(
          storageProvider ||
            "vercel-blob"
        ).trim(),

      alt:
        String(alt || "").trim(),

      caption:
        String(
          caption || ""
        ).trim(),

      tags:
        normalizeTags(tags),

      sizeBytes:
        normalizedSizeBytes,

      size:
        String(
          size ||
            formatFileSize(
              normalizedSizeBytes
            )
        ).trim(),

      width:
        normalizedWidth,

      height:
        normalizedHeight,

      dimensions:
        String(
          dimensions ||
            formatDimensions(
              normalizedWidth,
              normalizedHeight,
              normalizedType
            )
        ).trim(),

      uploadedBy:
        req.admin?._id || null,
    });

    await logActivity({
      type: "media",
      action: "uploaded",
      title: `Uploaded ${media.title}`,
      description: `${media.type} added to the Media Library.`,
      entityId: media._id,
      entityType: "Media",
      metadata: {
        mimeType: media.mimeType,
        sizeBytes: media.sizeBytes,
        url: media.url,
      },
      admin: req.admin,
    });

    res.status(201).json({
      success: true,

      message:
        "Media saved successfully.",

      item:
        serializeMedia(media),
    });
  } catch (error) {
    if (
      error.name ===
      "ValidationError"
    ) {
      const firstError =
        Object.values(
          error.errors || {}
        )[0];

      return res.status(400).json({
        success: false,
        message:
          firstError?.message ||
          "Please check the media information.",
      });
    }

    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/media/:mediaId
|--------------------------------------------------------------------------
| Edit media title, alt text, caption and tags.
|--------------------------------------------------------------------------
*/

const updateMedia = async (
  req,
  res,
  next
) => {
  try {
    const media =
      await Media.findById(
        req.params.mediaId
      );

    if (!media) {
      return res.status(404).json({
        success: false,
        message:
          "Media item not found.",
      });
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "title"
      )
    ) {
      const nextTitle = String(
        req.body.title || ""
      ).trim();

      if (!nextTitle) {
        return res.status(400).json({
          success: false,
          message:
            "Media title cannot be empty.",
        });
      }

      media.title = nextTitle;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "alt"
      )
    ) {
      media.alt = String(
        req.body.alt || ""
      ).trim();
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "caption"
      )
    ) {
      media.caption = String(
        req.body.caption || ""
      ).trim();
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "tags"
      )
    ) {
      media.tags = normalizeTags(
        req.body.tags
      );
    }

    await media.save();

    await logActivity({
      type: "media",
      action: "updated",
      title: `Updated ${media.title}`,
      description: "Media details were updated.",
      entityId: media._id,
      entityType: "Media",
      admin: req.admin,
    });

    res.status(200).json({
      success: true,

      message:
        "Media details updated successfully.",

      item:
        serializeMedia(media),
    });
  } catch (error) {
    if (
      error.name ===
      "CastError"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Media item not found.",
      });
    }

    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/media/:mediaId
|--------------------------------------------------------------------------
| Delete the Blob file first, then remove its MongoDB record.
|--------------------------------------------------------------------------
*/

const deleteMedia = async (
  req,
  res,
  next
) => {
  try {
    const media =
      await Media.findById(
        req.params.mediaId
      );

    if (!media) {
      return res.status(404).json({
        success: false,
        message:
          "Media item not found.",
      });
    }

    /*
     * Protect live project images from accidental deletion.
     * A professional CMS should not allow an asset to be
     * removed while published/project content still uses it.
     */
    const usedByProjects =
      media.url
        ? await Project.find({
            image: media.url,
          })
            .select(
              "title slug status"
            )
            .lean()
        : [];

    if (
      usedByProjects.length >
      0
    ) {
      return res.status(409).json({
        success: false,
        code:
          "MEDIA_IN_USE",
        message:
          `This image is currently used by ${usedByProjects.length} project${usedByProjects.length === 1 ? "" : "s"}. Replace or remove it from the project first, then delete it from Media Library.`,
        usedBy:
          usedByProjects.map(
            (project) => ({
              id:
                String(
                  project._id
                ),
              title:
                project.title,
              slug:
                project.slug,
              status:
                project.status,
            })
          ),
      });
    }

    const isVercelBlob =
      (
        media.storageProvider ===
          "vercel-blob" ||
        /blob\.vercel-storage\.com/i.test(
          String(media.url || "")
        )
      ) &&
      Boolean(
        media.url ||
          media.blobPathname
      );

    if (isVercelBlob) {
      const blobToken =
        process.env
          .BLOB_READ_WRITE_TOKEN;

      if (!blobToken) {
        return res.status(500).json({
          success: false,
          message:
            "Media storage is not configured for deletion. BLOB_READ_WRITE_TOKEN is missing on the backend.",
        });
      }

      try {
        const {
          del,
        } = await import(
          "@vercel/blob"
        );

        await del(
          media.url ||
            media.blobPathname,
          {
            token:
              blobToken,
          }
        );
      } catch (blobError) {
        console.error(
          "Vercel Blob delete failed:",
          blobError
        );

        return res.status(502).json({
          success: false,
          message:
            "The file could not be removed from Vercel Blob. The Media Library record was kept so no data is lost.",
        });
      }
    }

    await media.deleteOne();

    await logActivity({
      type: "media",
      action: "deleted",
      title:
        `Deleted ${media.title}`,
      description:
        "Media item was permanently deleted.",
      entityId:
        media._id,
      entityType:
        "Media",
      metadata: {
        mimeType:
          media.mimeType,
        url:
          media.url,
      },
      admin:
        req.admin,
    });

    res.status(200).json({
      success: true,
      message:
        "Media deleted successfully.",
      deletedId:
        String(media._id),
    });
  } catch (error) {
    if (
      error.name ===
      "CastError"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Media item not found.",
      });
    }

    next(error);
  }
};

module.exports = {
  getMedia,
  getMediaItem,
  createMedia,
  updateMedia,
  deleteMedia,
};
