import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Check,
  ExternalLink,
  Monitor,
  MoveHorizontal,
  Palette,
  RotateCcw,
  Save,
  Smartphone,
  Type,
} from "lucide-react";

import {
  applySiteStyles,
  DEFAULT_SITE_STYLES,
  normalizeSiteStyles,
} from "../siteStyles.js";

import "./SiteStylesManager.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const fontOptions = [
  {
    label: "Plus Jakarta Sans",
    value: "'Plus Jakarta Sans', sans-serif",
  },
  {
    label: "Arial",
    value: "Arial, sans-serif",
  },
  {
    label: "Georgia",
    value: "Georgia, serif",
  },
  {
    label: "System Font",
    value: "system-ui, sans-serif",
  },
];

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 2000,
  suffix = "px",
}) {
  return (
    <label className="site-styles__field">
      <span>{label}</span>

      <div className="site-styles__number">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(event) => {
            const nextValue = Number(event.target.value);

            if (Number.isFinite(nextValue)) {
              onChange(nextValue);
            }
          }}
        />

        <small>{suffix}</small>
      </div>
    </label>
  );
}

function ColorField({ label, value, onChange }) {
  const validPickerColor =
    /^#[0-9a-f]{6}$/i.test(value)
      ? value
      : "#000000";

  return (
    <label className="site-styles__field">
      <span>{label}</span>

      <div className="site-styles__color">
        <input
          type="color"
          value={validPickerColor}
          onChange={(event) =>
            onChange(event.target.value.toUpperCase())
          }
        />

        <input
          type="text"
          value={value}
          maxLength={7}
          onChange={(event) =>
            onChange(event.target.value.toUpperCase())
          }
        />
      </div>
    </label>
  );
}

export default function SiteStylesManager() {
  const iframeRef = useRef(null);

  const [styles, setStyles] = useState({
    ...DEFAULT_SITE_STYLES,
  });

  const [publishedStyles, setPublishedStyles] =
    useState({
      ...DEFAULT_SITE_STYLES,
    });

  const [previewDevice, setPreviewDevice] =
    useState("desktop");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const hasUnsavedChanges =
    JSON.stringify(styles) !==
    JSON.stringify(publishedStyles);

  const applyPreviewStyles = useCallback(() => {
    const previewDocument =
      iframeRef.current?.contentDocument;

    if (!previewDocument) {
      return;
    }

    applySiteStyles(styles, previewDocument);
  }, [styles]);

  useEffect(() => {
    let active = true;

    const loadStyles = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/api/site-config`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const result = await response
          .json()
          .catch(() => ({}));

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Unable to load site styles."
          );
        }

        if (!active) {
          return;
        }

        const savedStyles = normalizeSiteStyles(
          result.config?.siteStyles || {}
        );

        setStyles(savedStyles);
        setPublishedStyles(savedStyles);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load site styles."
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadStyles();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    applyPreviewStyles();
  }, [applyPreviewStyles]);

  const updateStyle = (key, value) => {
    setStyles((current) => ({
      ...current,
      [key]: value,
    }));

    setMessage("");
    setError("");
  };

  const handlePublish = async () => {
    if (isSaving || !hasUnsavedChanges) {
      return;
    }

    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const normalizedStyles =
        normalizeSiteStyles(styles);

      const response = await fetch(
        `${API_URL}/api/site-config/styles`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            siteStyles: normalizedStyles,
          }),
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to publish site styles."
        );
      }

      const savedStyles = normalizeSiteStyles(
        result.siteStyles || normalizedStyles
      );

      setStyles(savedStyles);
      setPublishedStyles(savedStyles);

      setMessage(
        "Styles published successfully and saved to MongoDB."
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to publish site styles."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setStyles({
      ...publishedStyles,
    });

    setError("");
    setMessage(
      "Unpublished changes were discarded."
    );
  };

  const handleRestoreOriginal = () => {
    const confirmed = window.confirm(
      "Load the original website design into the preview?"
    );

    if (!confirmed) {
      return;
    }

    setStyles({
      ...DEFAULT_SITE_STYLES,
    });

    setError("");
    setMessage(
      "Original design loaded in preview. Click Publish Styles to save it."
    );
  };

  return (
    <section className="site-styles">
      <header className="site-styles__header">
        <div>
          <span className="site-styles__eyebrow">
            Website design
          </span>

          <h1>Site Styles</h1>

          <p>
            Preview changes on the real website before
            publishing them.
          </p>
        </div>

        <div className="site-styles__actions">
          <button
            type="button"
            className="site-styles__reset"
            onClick={handleDiscardChanges}
            disabled={
              isLoading ||
              isSaving ||
              !hasUnsavedChanges
            }
          >
            <RotateCcw size={16} />
            Discard Changes
          </button>

          <button
            type="button"
            className="site-styles__save"
            onClick={handlePublish}
            disabled={
              isLoading ||
              isSaving ||
              !hasUnsavedChanges
            }
          >
            <Save size={16} />
            {isSaving
              ? "Publishing..."
              : "Publish Styles"}
          </button>
        </div>
      </header>

      {isLoading && (
        <div className="site-styles__message">
          Loading saved site styles...
        </div>
      )}

      {error && (
        <div className="site-styles__unsaved">
          {error}
        </div>
      )}

      {message && (
        <div className="site-styles__message">
          <Check size={16} />
          {message}
        </div>
      )}

      {hasUnsavedChanges && !isLoading && (
        <div className="site-styles__unsaved">
          You have unpublished style changes.
        </div>
      )}

      <div className="site-styles__layout">
        <div className="site-styles__settings">
          <article className="site-styles__panel">
            <header>
              <span className="site-styles__panel-icon">
                <Type size={19} />
              </span>

              <div>
                <h2>Typography</h2>
                <p>
                  Global heading and body styles.
                </p>
              </div>
            </header>

            <div className="site-styles__grid">
              <label className="site-styles__field">
                <span>Heading font</span>

                <select
                  value={styles.headingFont}
                  onChange={(event) =>
                    updateStyle(
                      "headingFont",
                      event.target.value
                    )
                  }
                >
                  {fontOptions.map((font) => (
                    <option
                      value={font.value}
                      key={font.label}
                    >
                      {font.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="site-styles__field">
                <span>Body font</span>

                <select
                  value={styles.bodyFont}
                  onChange={(event) =>
                    updateStyle(
                      "bodyFont",
                      event.target.value
                    )
                  }
                >
                  {fontOptions.map((font) => (
                    <option
                      value={font.value}
                      key={font.label}
                    >
                      {font.label}
                    </option>
                  ))}
                </select>
              </label>

              <NumberField
                label="H1 desktop size"
                value={styles.h1Desktop}
                min={20}
                max={120}
                onChange={(value) =>
                  updateStyle("h1Desktop", value)
                }
              />

              <NumberField
                label="H1 mobile size"
                value={styles.h1Mobile}
                min={20}
                max={80}
                onChange={(value) =>
                  updateStyle("h1Mobile", value)
                }
              />

              <NumberField
                label="H2 desktop size"
                value={styles.h2Desktop}
                min={18}
                max={100}
                onChange={(value) =>
                  updateStyle("h2Desktop", value)
                }
              />

              <NumberField
                label="H2 mobile size"
                value={styles.h2Mobile}
                min={18}
                max={70}
                onChange={(value) =>
                  updateStyle("h2Mobile", value)
                }
              />

              <NumberField
                label="Body desktop size"
                value={styles.bodyDesktop}
                min={12}
                max={30}
                onChange={(value) =>
                  updateStyle("bodyDesktop", value)
                }
              />

              <NumberField
                label="Body mobile size"
                value={styles.bodyMobile}
                min={12}
                max={26}
                onChange={(value) =>
                  updateStyle("bodyMobile", value)
                }
              />
            </div>
          </article>

          <article className="site-styles__panel">
            <header>
              <span className="site-styles__panel-icon">
                <Palette size={19} />
              </span>

              <div>
                <h2>Colors</h2>
                <p>
                  Main colors used across the website.
                </p>
              </div>
            </header>

            <div className="site-styles__grid">
              <ColorField
                label="Primary color"
                value={styles.primaryColor}
                onChange={(value) =>
                  updateStyle("primaryColor", value)
                }
              />

              <ColorField
                label="Accent color"
                value={styles.accentColor}
                onChange={(value) =>
                  updateStyle("accentColor", value)
                }
              />

              <ColorField
                label="Highlight color"
                value={styles.highlightColor}
                onChange={(value) =>
                  updateStyle("highlightColor", value)
                }
              />

              <ColorField
                label="Dark background"
                value={styles.darkBackground}
                onChange={(value) =>
                  updateStyle("darkBackground", value)
                }
              />

              <ColorField
                label="Light background"
                value={styles.lightBackground}
                onChange={(value) =>
                  updateStyle("lightBackground", value)
                }
              />

              <ColorField
                label="Heading color"
                value={styles.headingColor}
                onChange={(value) =>
                  updateStyle("headingColor", value)
                }
              />

              <ColorField
                label="Body text color"
                value={styles.bodyColor}
                onChange={(value) =>
                  updateStyle("bodyColor", value)
                }
              />
            </div>
          </article>

          <article className="site-styles__panel">
            <header>
              <span className="site-styles__panel-icon">
                <MoveHorizontal size={19} />
              </span>

              <div>
                <h2>Layout</h2>
                <p>
                  Website width and common spacing.
                </p>
              </div>
            </header>

            <div className="site-styles__grid">
              <NumberField
                label="Content width"
                value={styles.contentWidth}
                min={800}
                max={1800}
                onChange={(value) =>
                  updateStyle("contentWidth", value)
                }
              />

              <NumberField
                label="Desktop section spacing"
                value={styles.sectionSpacingDesktop}
                min={20}
                max={200}
                onChange={(value) =>
                  updateStyle(
                    "sectionSpacingDesktop",
                    value
                  )
                }
              />

              <NumberField
                label="Mobile section spacing"
                value={styles.sectionSpacingMobile}
                min={20}
                max={140}
                onChange={(value) =>
                  updateStyle(
                    "sectionSpacingMobile",
                    value
                  )
                }
              />

              <NumberField
                label="Desktop column gap"
                value={styles.columnGapDesktop}
                min={0}
                max={150}
                onChange={(value) =>
                  updateStyle(
                    "columnGapDesktop",
                    value
                  )
                }
              />

              <NumberField
                label="Mobile column gap"
                value={styles.columnGapMobile}
                min={0}
                max={100}
                onChange={(value) =>
                  updateStyle(
                    "columnGapMobile",
                    value
                  )
                }
              />
            </div>
          </article>

          <button
            type="button"
            className="site-styles__original"
            onClick={handleRestoreOriginal}
            disabled={isLoading || isSaving}
          >
            <RotateCcw size={15} />
            Restore Original Website Design
          </button>
        </div>

        <aside className="site-styles__preview">
          <header className="site-styles__preview-toolbar">
            <div>
              <strong>Live Website Preview</strong>
              <span>
                Changes are temporary until published.
              </span>
            </div>

            <div className="site-styles__device-switcher">
              <button
                type="button"
                className={
                  previewDevice === "desktop"
                    ? "is-active"
                    : ""
                }
                onClick={() =>
                  setPreviewDevice("desktop")
                }
              >
                <Monitor size={16} />
                Desktop
              </button>

              <button
                type="button"
                className={
                  previewDevice === "mobile"
                    ? "is-active"
                    : ""
                }
                onClick={() =>
                  setPreviewDevice("mobile")
                }
              >
                <Smartphone size={16} />
                Mobile
              </button>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              title="Open website in new tab"
            >
              <ExternalLink size={17} />
            </a>
          </header>

          <div className="site-styles__preview-viewport">
            <div
              className={`site-styles__frame-shell site-styles__frame-shell--${previewDevice}`}
            >
              <iframe
                ref={iframeRef}
                src="/"
                title="Live website style preview"
                onLoad={applyPreviewStyles}
              />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}