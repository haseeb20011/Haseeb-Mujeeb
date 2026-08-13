import { useEffect, useMemo, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import {
  Check,
  Copy,
  Download,
  File,
  FileText,
  Film,
  Grid3X3,
  Image as ImageIcon,
  Link2,
  List,
  MoreVertical,
  Pencil,
  Search,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import "./MediaLibraryManager.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "" : "");

const MAX_UPLOAD_SIZE = 100 * 1024 * 1024;

const getApiUrl = (path) => `${API_URL}${path}`;

const getFileType = (file) => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
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
    return `${Math.max(1, Math.round(value / 1024))} KB`;
  }

  if (value < 1024 * 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const getTitleFromFilename = (filename = "") =>
  filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const getInitials = (title = "") =>
  title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const formatUploadedAt = (value) => {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getImageDimensions = (file) =>
  new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve({
        width: null,
        height: null,
        dimensions: getFileType(file) === "document" ? "Document" : "",
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const width = image.naturalWidth || null;
      const height = image.naturalHeight || null;

      URL.revokeObjectURL(objectUrl);

      resolve({
        width,
        height,
        dimensions:
          width && height ? `${width} × ${height}` : "",
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

const normalizeMediaItem = (item) => ({
  id: item.id || item._id || "",
  title: item.title || "Untitled Media",
  originalName: item.originalName || "",
  type: item.type || "document",
  mimeType: item.mimeType || "application/octet-stream",
  url: item.url || "",
  blobPathname: item.blobPathname || "",
  storageProvider: item.storageProvider || "",
  alt: item.alt || "",
  caption: item.caption || "",
  tags: Array.isArray(item.tags) ? item.tags : [],
  sizeBytes: Number(item.sizeBytes) || 0,
  size: item.size || formatFileSize(item.sizeBytes),
  width: item.width ?? null,
  height: item.height ?? null,
  dimensions:
    item.dimensions ||
    (item.width && item.height
      ? `${item.width} × ${item.height}`
      : item.type === "document"
        ? "Document"
        : ""),
  uploadedAt: item.uploadedAt || item.createdAt || null,
  createdAt: item.createdAt || item.uploadedAt || null,
  updatedAt: item.updatedAt || null,
});

export default function MediaLibraryManager() {
  const uploadInputRef = useRef(null);

  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [editForm, setEditForm] = useState({
    title: "",
    alt: "",
    caption: "",
    tags: "",
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showNotice = (message) => {
    setNotice(message);
    setErrorMessage("");

    window.setTimeout(() => {
      setNotice("");
    }, 3000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setNotice("");
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(getApiUrl("/api/media"), {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load media.");
      }

      const nextItems = Array.isArray(data.items)
        ? data.items.map(normalizeMediaItem)
        : [];

      setItems(nextItems);

      setSelectedId((current) => {
        if (
          current &&
          nextItems.some((item) => item.id === current)
        ) {
          return current;
        }

        return nextItems[0]?.id || null;
      });
    } catch (error) {
      console.error("Load media failed:", error);
      showError(error.message || "Unable to load Media Library.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const counts = useMemo(
    () => ({
      all: items.length,
      image: items.filter((item) => item.type === "image").length,
      video: items.filter((item) => item.type === "video").length,
      document: items.filter((item) => item.type === "document").length,
    }),
    [items]
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const nextItems = items.filter((item) => {
      const matchesType =
        typeFilter === "all" || item.type === typeFilter;

      const searchable = [
        item.title,
        item.originalName,
        item.alt,
        item.caption,
        item.mimeType,
        ...(item.tags || []),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedQuery || searchable.includes(normalizedQuery);

      return matchesType && matchesSearch;
    });

    return [...nextItems].sort((a, b) => {
      if (sortBy === "name") {
        return a.title.localeCompare(b.title);
      }

      if (sortBy === "type") {
        return a.type.localeCompare(b.type);
      }

      const aDate = new Date(a.createdAt || a.uploadedAt || 0).getTime();
      const bDate = new Date(b.createdAt || b.uploadedAt || 0).getTime();

      return bDate - aDate;
    });
  }, [items, query, typeFilter, sortBy]);

  const selectedItem =
    items.find((item) => item.id === selectedId) ||
    filteredItems[0] ||
    null;

  useEffect(() => {
    if (
      selectedItem &&
      !filteredItems.some((item) => item.id === selectedItem.id)
    ) {
      setSelectedId(filteredItems[0]?.id || null);
    }
  }, [filteredItems, selectedItem]);

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    const oversizedFile = files.find(
      (file) => file.size > MAX_UPLOAD_SIZE
    );

    if (oversizedFile) {
      showError(
        `${oversizedFile.name} is larger than the 100 MB upload limit.`
      );
      event.target.value = "";
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setErrorMessage("");

    const createdItems = [];

    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const fileType = getFileType(file);
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");

        const safeName = file.name
          .replace(/[^\w.\-]+/g, "-")
          .replace(/-+/g, "-");

        const pathname = `media/${year}/${month}/${safeName}`;

        const dimensions = await getImageDimensions(file);

        const blob = await upload(pathname, file, {
          access: "public",
          handleUploadUrl: getApiUrl("/api/media/upload"),
          multipart: file.size > 5 * 1024 * 1024,
          contentType: file.type || undefined,
          onUploadProgress(progress) {
            const currentFileProgress =
              typeof progress?.percentage === "number"
                ? progress.percentage
                : 0;

            const overall =
              ((index + currentFileProgress / 100) / files.length) * 100;

            setUploadProgress(Math.round(overall));
          },
        });

        const metadataResponse = await fetch(getApiUrl("/api/media"), {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: getTitleFromFilename(file.name),
            originalName: file.name,
            type: fileType,
            mimeType: file.type || "application/octet-stream",
            url: blob.url,
            blobPathname: blob.pathname || pathname,
            storageProvider: "vercel-blob",
            alt:
              fileType === "image"
                ? getTitleFromFilename(file.name)
                : "",
            caption: "",
            tags: [],
            sizeBytes: file.size,
            size: formatFileSize(file.size),
            width: dimensions.width,
            height: dimensions.height,
            dimensions: dimensions.dimensions,
          }),
        });

        const metadataData = await metadataResponse
          .json()
          .catch(() => ({}));

        if (!metadataResponse.ok || !metadataData.success) {
          throw new Error(
            metadataData.message ||
              `The file uploaded, but its database record could not be saved.`
          );
        }

        createdItems.push(normalizeMediaItem(metadataData.item));
      }

      if (createdItems.length > 0) {
        setItems((current) => [
          ...createdItems,
          ...current.filter(
            (existing) =>
              !createdItems.some(
                (created) => created.id === existing.id
              )
          ),
        ]);

        setSelectedId(createdItems[0].id);

        window.dispatchEvent(
          new CustomEvent("portfolio-media-updated", {
            detail: {
              items: createdItems,
              count: createdItems.length,
            },
          })
        );

        showNotice(
          `${createdItems.length} media item${
            createdItems.length === 1 ? "" : "s"
          } uploaded successfully.`
        );
      }
    } catch (error) {
      console.error("Media upload failed:", error);
      showError(error.message || "Media upload failed.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      event.target.value = "";
    }
  };

  const openEditModal = (item) => {
    setEditingId(item.id);

    setEditForm({
      title: item.title,
      alt: item.alt || "",
      caption: item.caption || "",
      tags: (item.tags || []).join(", "),
    });
  };

  const closeEditModal = () => {
    setEditingId(null);

    setEditForm({
      title: "",
      alt: "",
      caption: "",
      tags: "",
    });
  };

  const handleSaveDetails = async (event) => {
    event.preventDefault();

    const item = items.find((mediaItem) => mediaItem.id === editingId);

    if (!item) return;

    try {
      const response = await fetch(
        getApiUrl(`/api/media/${editingId}`),
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editForm.title.trim() || item.title,
            alt: editForm.alt.trim(),
            caption: editForm.caption.trim(),
            tags: editForm.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update media details."
        );
      }

      const updatedItem = normalizeMediaItem(data.item);

      setItems((current) =>
        current.map((mediaItem) =>
          mediaItem.id === updatedItem.id ? updatedItem : mediaItem
        )
      );

      closeEditModal();
      showNotice("Media details updated.");
    } catch (error) {
      console.error("Update media failed:", error);
      showError(error.message || "Unable to update media details.");
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete "${item.title}" permanently?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        getApiUrl(`/api/media/${item.id}`),
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete media.");
      }

      const remainingItems = items.filter(
        (mediaItem) => mediaItem.id !== item.id
      );

      setItems(remainingItems);
      setSelectedId(remainingItems[0]?.id || null);

      window.dispatchEvent(
        new CustomEvent("portfolio-media-updated", {
          detail: {
            deletedId: item.id,
            count: remainingItems.length,
          },
        })
      );

      showNotice("Media item deleted.");
    } catch (error) {
      console.error("Delete media failed:", error);
      showError(error.message || "Unable to delete media.");
    }
  };

  const handleCopyUrl = async (item) => {
    if (!item.url) {
      showError("This media item does not have a public URL.");
      return;
    }

    try {
      await navigator.clipboard.writeText(item.url);
      showNotice("Media URL copied.");
    } catch {
      showError("Copy was blocked by the browser.");
    }
  };

  const filterOptions = [
    {
      id: "all",
      label: "All media",
      icon: Grid3X3,
      count: counts.all,
    },
    {
      id: "image",
      label: "Images",
      icon: ImageIcon,
      count: counts.image,
    },
    {
      id: "video",
      label: "Videos",
      icon: Film,
      count: counts.video,
    },
    {
      id: "document",
      label: "Documents",
      icon: FileText,
      count: counts.document,
    },
  ];

  return (
    <section className="cms-media">
      <header className="cms-media__header">
        <div>
          <span className="cms-media__eyebrow">Website assets</span>
          <h1>Media Library</h1>

          <p>
            Upload, organize, edit, and reuse images, videos, and
            documents across your portfolio.
          </p>
        </div>

        <button
          type="button"
          className="cms-media__upload-button"
          onClick={() => uploadInputRef.current?.click()}
          disabled={uploading}
        >
          <UploadCloud size={17} />

          {uploading
            ? `Uploading${uploadProgress ? ` ${uploadProgress}%` : "..."}`
            : "Upload media"}
        </button>

        <input
          ref={uploadInputRef}
          className="cms-media__hidden-input"
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
          onChange={handleUpload}
        />
      </header>

      {notice && (
        <div className="cms-media__notice">
          <Check size={15} />
          {notice}
        </div>
      )}

      {errorMessage && (
        <div className="cms-media__notice">
          <X size={15} />
          {errorMessage}
        </div>
      )}

      <section className="cms-media__summary">
        <article className="cms-media__summary-intro">
          <span>
            <Sparkles size={16} />
            Asset manager
          </span>

          <strong>
            Keep every visual asset organized and ready for the page
            builder.
          </strong>

          <p>
            Files are stored permanently in Vercel Blob and their
            details are managed in MongoDB.
          </p>
        </article>

        <MediaStat
          label="All media"
          value={counts.all}
          icon={Grid3X3}
          tone="purple"
        />

        <MediaStat
          label="Images"
          value={counts.image}
          icon={ImageIcon}
          tone="green"
        />

        <MediaStat
          label="Videos"
          value={counts.video}
          icon={Film}
          tone="orange"
        />

        <MediaStat
          label="Documents"
          value={counts.document}
          icon={FileText}
          tone="blue"
        />
      </section>

      <section className="cms-media__workspace">
        <aside className="cms-media__sidebar">
          <div className="cms-media__sidebar-heading">
            <span>
              <File size={16} />
            </span>

            <div>
              <strong>Library</strong>
              <small>{items.length} assets</small>
            </div>
          </div>

          <nav>
            {filterOptions.map((option) => {
              const OptionIcon = option.icon;

              return (
                <button
                  type="button"
                  key={option.id}
                  className={
                    typeFilter === option.id ? "is-active" : ""
                  }
                  onClick={() => setTypeFilter(option.id)}
                >
                  <OptionIcon size={16} />
                  <span>{option.label}</span>
                  <strong>{option.count}</strong>
                </button>
              );
            })}
          </nav>

          <div className="cms-media__upload-note">
            <UploadCloud size={17} />

            <div>
              <strong>Permanent storage</strong>

              <span>
                Vercel Blob is connected. Uploads are saved outside the
                browser and remain available after deployment.
              </span>
            </div>
          </div>
        </aside>

        <div className="cms-media__library">
          <header className="cms-media__toolbar">
            <label className="cms-media__search">
              <Search size={15} />

              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search media, tags, or file type..."
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </label>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Sort media"
            >
              <option value="newest">Newest first</option>
              <option value="name">Name A–Z</option>
              <option value="type">File type</option>
            </select>

            <div className="cms-media__view-toggle">
              <button
                type="button"
                className={viewMode === "grid" ? "is-active" : ""}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <Grid3X3 size={15} />
              </button>

              <button
                type="button"
                className={viewMode === "list" ? "is-active" : ""}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <List size={15} />
              </button>
            </div>
          </header>

          {loading ? (
            <div className="cms-media__empty">
              <span>
                <UploadCloud size={24} />
              </span>
              <strong>Loading media...</strong>
            </div>
          ) : (
            <div className={`cms-media__items is-${viewMode}`}>
              {filteredItems.map((item) => (
                <article
                  className={`cms-media-card ${
                    selectedItem?.id === item.id ? "is-selected" : ""
                  }`}
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                >
                  <div className="cms-media-card__preview">
                    {item.type === "image" && item.url ? (
                      <img
                        src={item.url}
                        alt={item.alt || item.title}
                      />
                    ) : item.type === "video" && item.url ? (
                      <video
                        src={item.url}
                        muted
                        preload="metadata"
                      />
                    ) : (
                      <div className="cms-media-card__fallback is-purple">
                        {item.type === "image" && (
                          <ImageIcon size={28} />
                        )}

                        {item.type === "video" && <Film size={28} />}

                        {item.type === "document" && (
                          <FileText size={28} />
                        )}

                        <span>{getInitials(item.title)}</span>
                      </div>
                    )}

                    <span className="cms-media-card__type">
                      {item.type}
                    </span>
                  </div>

                  <div className="cms-media-card__body">
                    <div>
                      <strong>{item.title}</strong>

                      <span>
                        {item.size} · {formatUploadedAt(item.uploadedAt)}
                      </span>
                    </div>

                    <button
                      type="button"
                      aria-label={`More options for ${item.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditModal(item);
                      }}
                    >
                      <MoreVertical size={15} />
                    </button>
                  </div>
                </article>
              ))}

              {filteredItems.length === 0 && (
                <div className="cms-media__empty">
                  <span>
                    <Search size={24} />
                  </span>

                  <strong>No media found</strong>

                  <p>
                    Upload your first file or change the current filters.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setTypeFilter("all");
                    }}
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="cms-media__inspector">
          {selectedItem ? (
            <>
              <header>
                <div>
                  <span>Selected asset</span>
                  <h2>{selectedItem.title}</h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  aria-label="Close inspector"
                >
                  <X size={16} />
                </button>
              </header>

              <div className="cms-media__inspector-preview">
                {selectedItem.type === "image" && selectedItem.url ? (
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.alt || selectedItem.title}
                  />
                ) : selectedItem.type === "video" &&
                  selectedItem.url ? (
                  <video src={selectedItem.url} controls />
                ) : (
                  <div className="cms-media__inspector-fallback is-purple">
                    {selectedItem.type === "image" && (
                      <ImageIcon size={38} />
                    )}

                    {selectedItem.type === "video" && (
                      <Film size={38} />
                    )}

                    {selectedItem.type === "document" && (
                      <FileText size={38} />
                    )}
                  </div>
                )}
              </div>

              <div className="cms-media__details">
                <DetailRow
                  label="File type"
                  value={selectedItem.mimeType}
                />

                <DetailRow label="Size" value={selectedItem.size} />

                <DetailRow
                  label="Dimensions"
                  value={selectedItem.dimensions || "—"}
                />

                <DetailRow
                  label="Uploaded"
                  value={formatUploadedAt(selectedItem.uploadedAt)}
                />

                {selectedItem.alt && (
                  <DetailRow
                    label="Alt text"
                    value={selectedItem.alt}
                  />
                )}

                {selectedItem.caption && (
                  <DetailRow
                    label="Caption"
                    value={selectedItem.caption}
                  />
                )}
              </div>

              <div className="cms-media__tags">
                {(selectedItem.tags || []).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              <div className="cms-media__inspector-actions">
                <button
                  type="button"
                  className="is-primary"
                  onClick={() => openEditModal(selectedItem)}
                >
                  <Pencil size={14} />
                  Edit details
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyUrl(selectedItem)}
                  title="Copy media URL"
                >
                  <Copy size={14} />
                </button>

                {selectedItem.url && (
                  <a
                    href={selectedItem.url}
                    target="_blank"
                    rel="noreferrer"
                    title="Open media"
                  >
                    <Download size={14} />
                  </a>
                )}

                <button
                  type="button"
                  className="is-delete"
                  onClick={() => handleDelete(selectedItem)}
                  title="Delete media"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </>
          ) : (
            <div className="cms-media__inspector-empty">
              <span>
                <ImageIcon size={28} />
              </span>

              <strong>Select an asset</strong>

              <p>
                Choose a media item to view and edit its details.
              </p>
            </div>
          )}
        </aside>
      </section>

      {editingId && (
        <div
          className="cms-media__modal-overlay"
          onMouseDown={closeEditModal}
          role="presentation"
        >
          <section
            className="cms-media__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="media-edit-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span>
                  <Link2 size={17} />
                </span>

                <div>
                  <small>Media asset</small>

                  <h2 id="media-edit-title">
                    Edit media details
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </header>

            <form onSubmit={handleSaveDetails}>
              <label>
                <span>Title</span>

                <input
                  type="text"
                  value={editForm.title}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label>
                <span>Alt text</span>

                <input
                  type="text"
                  value={editForm.alt}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      alt: event.target.value,
                    }))
                  }
                  placeholder="Describe the image for accessibility"
                />
              </label>

              <label>
                <span>Caption</span>

                <textarea
                  rows={3}
                  value={editForm.caption}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      caption: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                <span>Tags</span>

                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      tags: event.target.value,
                    }))
                  }
                  placeholder="portfolio, website, featured"
                />
              </label>

              <footer>
                <button
                  type="button"
                  className="cms-media__cancel"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="cms-media__save"
                >
                  <Check size={15} />
                  Save details
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

function MediaStat({ label, value, icon: Icon, tone }) {
  return (
    <article className={`cms-media__stat is-${tone}`}>
      <span>
        <Icon size={19} />
      </span>

      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <p>Available assets</p>
      </div>
    </article>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="cms-media__detail-row">
      <span>{label}</span>
      <strong title={String(value || "")}>{value || "—"}</strong>
    </div>
  );
}