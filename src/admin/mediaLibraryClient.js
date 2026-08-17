import { upload } from "@vercel/blob/client";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? ""
    : "");

const MAX_UPLOAD_SIZE =
  100 * 1024 * 1024;

const getApiUrl = (path) =>
  `${API_URL}${path}`;

const getFileType = (file) => {
  if (file.type.startsWith("image/")) {
    return "image";
  }

  if (file.type.startsWith("video/")) {
    return "video";
  }

  return "document";
};

const formatFileSize = (bytes) => {
  const value = Number(bytes);

  if (!Number.isFinite(value) || value <= 0) {
    return "Unknown";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${Math.max(
      1,
      Math.round(value / 1024)
    )} KB`;
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

const getTitleFromFilename = (
  filename = ""
) =>
  filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );

const getImageDimensions = (file) =>
  new Promise((resolve) => {
    if (
      !file.type.startsWith("image/")
    ) {
      resolve({
        width: null,
        height: null,
        dimensions: "",
      });
      return;
    }

    const objectUrl =
      URL.createObjectURL(file);

    const image = new Image();

    image.onload = () => {
      const width =
        image.naturalWidth || null;
      const height =
        image.naturalHeight || null;

      URL.revokeObjectURL(objectUrl);

      resolve({
        width,
        height,
        dimensions:
          width && height
            ? `${width} Ã— ${height}`
            : "",
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);

      resolve({
        width: null,
        height: null,
        dimensions: "",
      });
    };

    image.src = objectUrl;
  });

export const normalizeMediaItem = (
  item = {}
) => ({
  id:
    item.id ||
    item._id ||
    "",
  title:
    item.title ||
    "Untitled Media",
  originalName:
    item.originalName ||
    "",
  type:
    item.type ||
    "document",
  mimeType:
    item.mimeType ||
    "application/octet-stream",
  url:
    item.url ||
    "",
  alt:
    item.alt ||
    "",
  caption:
    item.caption ||
    "",
  tags:
    Array.isArray(item.tags)
      ? item.tags
      : [],
  width:
    item.width ??
    null,
  height:
    item.height ??
    null,
  dimensions:
    item.dimensions ||
    "",
  sizeBytes:
    Number(item.sizeBytes) ||
    0,
  size:
    item.size ||
    formatFileSize(
      item.sizeBytes
    ),
  createdAt:
    item.createdAt ||
    item.uploadedAt ||
    null,
  uploadedAt:
    item.uploadedAt ||
    item.createdAt ||
    null,
});

export const fetchMediaItems =
  async ({
    type = "all",
    search = "",
  } = {}) => {
    const params =
      new URLSearchParams();

    if (type !== "all") {
      params.set("type", type);
    }

    if (search.trim()) {
      params.set(
        "search",
        search.trim()
      );
    }

    const suffix =
      params.toString()
        ? `?${params.toString()}`
        : "";

    const response =
      await fetch(
        getApiUrl(
          `/api/media${suffix}`
        ),
        {
          credentials: "include",
        }
      );

    const data =
      await response
        .json()
        .catch(() => ({}));

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
          "Unable to load Media Library."
      );
    }

    return Array.isArray(
      data.items
    )
      ? data.items.map(
          normalizeMediaItem
        )
      : [];
  };

export const uploadMediaFile =
  async (
    file,
    {
      onProgress,
    } = {}
  ) => {
    if (!file) {
      throw new Error(
        "Choose a file to upload."
      );
    }

    if (
      file.size >
      MAX_UPLOAD_SIZE
    ) {
      throw new Error(
        `${file.name} is larger than the 100 MB upload limit.`
      );
    }

    const now =
      new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1
      ).padStart(2, "0");

    const safeName =
      file.name
        .replace(
          /[^\w.\-]+/g,
          "-"
        )
        .replace(
          /-+/g,
          "-"
        );

    const pathname =
      `media/${year}/${month}/${safeName}`;

    const fileType =
      getFileType(file);

    const dimensions =
      await getImageDimensions(
        file
      );

    const blob =
      await upload(
        pathname,
        file,
        {
          access: "public",
          handleUploadUrl:
            getApiUrl(
              "/api/media/upload"
            ),
          multipart:
            file.size >
            5 *
              1024 *
              1024,
          contentType:
            file.type ||
            undefined,
          onUploadProgress(
            progress
          ) {
            if (
              typeof onProgress ===
              "function"
            ) {
              onProgress(
                typeof progress?.percentage ===
                  "number"
                  ? Math.round(
                      progress.percentage
                    )
                  : 0
              );
            }
          },
        }
      );

    const metadataResponse =
      await fetch(
        getApiUrl(
          "/api/media"
        ),
        {
          method: "POST",
          credentials:
            "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body:
            JSON.stringify({
              title:
                getTitleFromFilename(
                  file.name
                ),
              originalName:
                file.name,
              type:
                fileType,
              mimeType:
                file.type ||
                "application/octet-stream",
              url:
                blob.url,
              blobPathname:
                blob.pathname ||
                pathname,
              storageProvider:
                "vercel-blob",
              alt:
                fileType ===
                "image"
                  ? getTitleFromFilename(
                      file.name
                    )
                  : "",
              caption: "",
              tags: [],
              sizeBytes:
                file.size,
              size:
                formatFileSize(
                  file.size
                ),
              width:
                dimensions.width,
              height:
                dimensions.height,
              dimensions:
                dimensions.dimensions,
            }),
        }
      );

    const metadataData =
      await metadataResponse
        .json()
        .catch(() => ({}));

    if (
      !metadataResponse.ok ||
      !metadataData.success
    ) {
      throw new Error(
        metadataData.message ||
          "The file uploaded, but its Media Library record could not be saved."
      );
    }

    const item =
      normalizeMediaItem(
        metadataData.item
      );

    window.dispatchEvent(
      new CustomEvent(
        "portfolio-media-updated",
        {
          detail: {
            items: [item],
            count: 1,
          },
        }
      )
    );

    return item;
  };
