import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  Image as ImageIcon,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import {
  fetchMediaItems,
} from "./mediaLibraryClient";

import "./MediaPickerModal.css";

export default function MediaPickerModal({
  open,
  currentUrl = "",
  title = "Choose project image",
  description = "Select an existing image already stored in your Media Library.",
  onClose,
  onSelect,
}) {
  const [items, setItems] =
    useState([]);

  const [query, setQuery] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadMedia = async () => {
    try {
      setLoading(true);
      setError("");

      const nextItems =
        await fetchMediaItems({
          type: "image",
        });

      setItems(nextItems);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to load Media Library."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadMedia();
      setQuery("");
    }
  }, [open]);

  const filteredItems =
    useMemo(() => {
      const normalized =
        query
          .trim()
          .toLowerCase();

      if (!normalized) {
        return items;
      }

      return items.filter(
        (item) =>
          [
            item.title,
            item.originalName,
            item.alt,
            ...(item.tags || []),
          ]
            .join(" ")
            .toLowerCase()
            .includes(
              normalized
            )
      );
    }, [items, query]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="cms-media-picker__overlay"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="cms-media-picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-picker-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <header>
          <div>
            <span>
              Media Library
            </span>

            <h2 id="media-picker-title">
              {title}
            </h2>

            <p>
              {description}
            </p>
          </div>

          <button
            type="button"
            className="cms-media-picker__close"
            onClick={onClose}
            aria-label="Close media picker"
          >
            <X size={18} />
          </button>
        </header>

        <div className="cms-media-picker__toolbar">
          <label>
            <Search size={16} />

            <input
              type="search"
              value={query}
              placeholder="Search images..."
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              autoFocus
            />
          </label>

          <button
            type="button"
            onClick={loadMedia}
            disabled={loading}
          >
            <RefreshCw
              size={15}
              className={
                loading
                  ? "is-spinning"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        <div className="cms-media-picker__body">
          {loading && (
            <div className="cms-media-picker__state">
              <RefreshCw
                size={24}
                className="is-spinning"
              />
              <strong>
                Loading images
              </strong>
            </div>
          )}

          {!loading && error && (
            <div className="cms-media-picker__state is-error">
              <X size={24} />
              <strong>
                Media Library
                could not load
              </strong>
              <p>{error}</p>
            </div>
          )}

          {!loading &&
            !error &&
            filteredItems.length ===
              0 && (
              <div className="cms-media-picker__state">
                <ImageIcon
                  size={28}
                />
                <strong>
                  No images found
                </strong>
                <p>
                  Upload a new image
                  from the project form
                  or Media Library.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            filteredItems.length >
              0 && (
              <div className="cms-media-picker__grid">
                {filteredItems.map(
                  (item) => {
                    const selected =
                      item.url ===
                      currentUrl;

                    return (
                      <button
                        type="button"
                        className={`cms-media-picker__item ${
                          selected
                            ? "is-selected"
                            : ""
                        }`}
                        key={item.id}
                        onClick={() => {
                          onSelect(
                            item
                          );
                          onClose();
                        }}
                      >
                        <span className="cms-media-picker__thumb">
                          <img
                            src={
                              item.url
                            }
                            alt={
                              item.alt ||
                              item.title
                            }
                          />

                          {selected && (
                            <i>
                              <Check
                                size={
                                  15
                                }
                              />
                            </i>
                          )}
                        </span>

                        <strong>
                          {item.title}
                        </strong>

                        <small>
                          {item.dimensions ||
                            item.size ||
                            "Image"}
                        </small>
                      </button>
                    );
                  }
                )}
              </div>
            )}
        </div>

        <footer>
          <span>
            {
              filteredItems.length
            }{" "}
            image
            {filteredItems.length ===
            1
              ? ""
              : "s"}
          </span>

          <button
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
        </footer>
      </section>
    </div>
  );
}
