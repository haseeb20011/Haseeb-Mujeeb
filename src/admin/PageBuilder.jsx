import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Eye,
  Image as ImageIcon,
  Layers3,
  Monitor,
  Paintbrush,
  RefreshCcw,
  RotateCcw,
  Save,
  Settings2,
  Smartphone,
  Tablet,
  Type,
} from "lucide-react";

import { getPageSchema } from "./pageSchemas.js";
import MediaPickerModal from "./MediaPickerModal.jsx";
import {
  applyCmsStateToDocument,
  createEmptyCmsEdit,
  getCmsTargets,
} from "../cmsRuntime.js";

import "./PageBuilder.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "" : "http://localhost:5000");

const DEVICE_WIDTH = {
  desktop: "100%",
  tablet: "820px",
  mobile: "390px",
};

const wait = (ms) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

const mergeEdit = (saved, captured, meta) => {
  const empty = createEmptyCmsEdit();
  const savedObject =
    saved && typeof saved === "object" ? saved : {};
  const savedMeta =
    savedObject.meta && typeof savedObject.meta === "object"
      ? savedObject.meta
      : {};

  // Older builder drafts stored an empty string for every possible field.
  // Those placeholders must not hide real text captured from the page.
  // From schema v3 onward, an intentionally-cleared field is recorded in
  // meta.touchedContent, so an explicit blank remains authoritative.
  const touchedContent = new Set(
    Array.isArray(savedMeta.touchedContent)
      ? savedMeta.touchedContent
      : []
  );

  const savedContent = Object.fromEntries(
    Object.entries(savedObject.content || {}).filter(
      ([field, value]) =>
        touchedContent.has(field) ||
        typeof value !== "string" ||
        value.trim() !== ""
    )
  );

  const hasBuilderMetadata =
    savedMeta.kind === "section" || savedMeta.kind === "block";

  const savedStyle =
    hasBuilderMetadata || savedObject?.style?.enabled
      ? savedObject.style || {}
      : {};

  const savedAdvanced =
    hasBuilderMetadata || savedObject?.advanced?.enabled
      ? savedObject.advanced || {}
      : {};

  return {
    ...empty,
    ...captured,
    ...savedObject,
    meta: {
      ...(captured?.meta || {}),
      ...savedMeta,
      ...meta,
      touchedContent: Array.from(touchedContent),
      schemaVersion: 3,
    },
    content: {
      ...empty.content,
      ...(captured?.content || {}),
      ...savedContent,
    },
    style: {
      ...empty.style,
      ...(captured?.style || {}),
      ...savedStyle,
    },
    advanced: {
      ...empty.advanced,
      ...(captured?.advanced || {}),
      ...savedAdvanced,
    },
  };
};

const formatSaveTime = () =>
  new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());

export default function PageBuilder({ page, onBack }) {
  const iframeRef = useRef(null);
  const iframeDocumentRef = useRef(null);
  const targetElementsRef = useRef(new Map());
  const targetInfoRef = useRef(new Map());
  const clickCleanupRef = useRef(null);
  const draftRef = useRef({});
  const pageContentRef = useRef(page.content || {});
  const savedDraftRef = useRef(
    page.content?.builderDraft ||
      page.content?.builderPublished ||
      {}
  );
  const initialHydrationRef = useRef(false);

  const pageKey =
    page.key || (page.id === "portfolio" ? "projects" : page.id);

  const [draft, setDraft] = useState(
    page.content?.builderDraft ||
      page.content?.builderPublished ||
      {}
  );
  const [navigator, setNavigator] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [tab, setTab] = useState("content");
  const [device, setDevice] = useState("desktop");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("neutral");
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState("");
  const [mediaOpen, setMediaOpen] = useState(false);

  const hasUnsavedChanges = useMemo(
    () =>
      JSON.stringify(draft) !==
      JSON.stringify(savedDraftRef.current || {}),
    [draft]
  );

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const setNotice = (text, tone = "neutral") => {
    setMessage(text);
    setMessageTone(tone);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`${API_URL}/api/site-config`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.success === false) {
          throw new Error(
            data.message || "Page builder data could not be loaded."
          );
        }

        const savedPage = (data.config?.pages || []).find(
          (item) => String(item.key) === String(pageKey)
        );

        if (!savedPage) {
          throw new Error(
            "This page could not be found in the CMS database."
          );
        }

        const content =
          savedPage.content &&
          typeof savedPage.content === "object"
            ? savedPage.content
            : {};

        const savedDraft =
          content.builderDraft ||
          content.builderPublished ||
          {};

        if (!cancelled) {
          pageContentRef.current = content;
          savedDraftRef.current = savedDraft;
          draftRef.current = savedDraft;
          initialHydrationRef.current = false;
          setDraft(savedDraft);
          setNotice("");
        }
      } catch (error) {
        if (!cancelled) {
          setNotice(
            error instanceof Error
              ? error.message
              : "Page builder data could not be loaded.",
            "error"
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [pageKey]);

  const selectedTarget =
    targetInfoRef.current.get(selectedKey) || null;

  const selectedEdit = selectedKey
    ? draft[selectedKey] || createEmptyCmsEdit()
    : createEmptyCmsEdit();

  const updateSelected = (area, field, value) => {
    if (!selectedKey) return;

    setDraft((current) => {
      const currentEdit =
        current[selectedKey] || createEmptyCmsEdit();

      return {
        ...current,
        [selectedKey]: {
          ...currentEdit,
          meta:
            area === "content"
              ? {
                  ...(currentEdit.meta || {}),
                  touchedContent: Array.from(
                    new Set([
                      ...(Array.isArray(
                        currentEdit.meta?.touchedContent
                      )
                        ? currentEdit.meta.touchedContent
                        : []),
                      field,
                    ])
                  ),
                  schemaVersion: 3,
                }
              : currentEdit.meta,
          [area]: {
            ...currentEdit[area],
            [field]: value,
          },
        },
      };
    });

    setNotice("");
  };

  const applyDraft = useCallback(
    (nextDraft = draftRef.current) => {
      const doc = iframeDocumentRef.current;
      if (!doc) return;

      applyCmsStateToDocument(doc, nextDraft, device);

      doc
        .querySelectorAll("[data-cms-selected='true']")
        .forEach((node) => {
          node.dataset.cmsSelected = "false";
        });

      const selectedElement =
        targetElementsRef.current.get(selectedKey);

      if (selectedElement) {
        selectedElement.dataset.cmsSelected = "true";
      }
    },
    [device, selectedKey]
  );

  useEffect(() => {
    applyDraft(draft);
  }, [draft, device, applyDraft]);

  const selectTarget = useCallback(
    (key, shouldScroll = true) => {
      const doc = iframeDocumentRef.current;
      if (!doc) return;

      doc
        .querySelectorAll("[data-cms-selected='true']")
        .forEach((node) => {
          node.dataset.cmsSelected = "false";
        });

      const element = targetElementsRef.current.get(key);

      if (element) {
        element.dataset.cmsSelected = "true";

        if (shouldScroll) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }

      setSelectedKey(key);
      setTab("content");
    },
    []
  );

  const buildNavigator = useCallback(
    async (doc) => {
      const schema = getPageSchema(page);
      let discovered = [];

      for (let attempt = 0; attempt < 50; attempt += 1) {
        discovered = getCmsTargets(doc, schema);

        if (discovered.length > 0) break;
        await wait(100);
      }

      if (discovered.length === 0) {
        throw new Error(
          "No editable page sections were found in the live preview."
        );
      }

      targetElementsRef.current.clear();
      targetInfoRef.current.clear();

      doc.querySelectorAll("[data-cms-target-key]").forEach((node) => {
        delete node.dataset.cmsTargetKey;
        delete node.dataset.cmsTargetLabel;
        delete node.dataset.cmsSelected;
      });

      const grouped = [];
      const nextDraft = {
        ...draftRef.current,
      };

      discovered.forEach((target) => {
        targetElementsRef.current.set(
          target.key,
          target.element
        );
        targetInfoRef.current.set(target.key, target);

        target.element.dataset.cmsTargetKey = target.key;
        target.element.dataset.cmsTargetLabel = target.label;
        target.element.dataset.cmsSelected = "false";

        nextDraft[target.key] = mergeEdit(
          nextDraft[target.key],
          target.captured,
          target.meta
        );

        if (target.kind === "section") {
          grouped.push({
            key: target.key,
            label: target.label,
            children: [],
          });
        } else {
          const parent = grouped.find(
            (item) => item.key === target.parentKey
          );

          if (parent) {
            parent.children.push({
              key: target.key,
              label: target.label,
            });
          }
        }
      });

      draftRef.current = nextDraft;
      setDraft(nextDraft);
      setNavigator(grouped);

      // Hydration/migration is a clean baseline, not a user edit. This also
      // upgrades legacy drafts in memory without showing a false unsaved state.
      if (!initialHydrationRef.current) {
        savedDraftRef.current = nextDraft;
        initialHydrationRef.current = true;
      }

      const nextSelected =
        selectedKey &&
        targetInfoRef.current.has(selectedKey)
          ? selectedKey
          : grouped[0]?.key;

      if (nextSelected) {
        window.setTimeout(
          () => selectTarget(nextSelected, false),
          60
        );
      }

      return nextDraft;
    },
    [page, selectTarget, selectedKey]
  );

  const preparePreview = useCallback(async () => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;

    if (!doc) {
      setReady(false);
      return;
    }

    iframeDocumentRef.current = doc;
    clickCleanupRef.current?.();

    try {
      let editorStyle = doc.getElementById(
        "haseeb-cms-builder-preview-style"
      );

      if (!editorStyle) {
        editorStyle = doc.createElement("style");
        editorStyle.id =
          "haseeb-cms-builder-preview-style";
        editorStyle.textContent = `
          [data-cms-target-key] {
            position: relative !important;
            outline: 2px solid transparent !important;
            outline-offset: -2px !important;
          }
          [data-cms-target-key]:hover {
            outline-color: rgba(124, 58, 237, .72) !important;
            cursor: pointer !important;
          }
          [data-cms-selected="true"] {
            outline: 3px solid #7c3aed !important;
            outline-offset: -3px !important;
          }
          [data-cms-selected="true"]::before {
            content: attr(data-cms-target-label);
            position: absolute !important;
            z-index: 99999 !important;
            top: 10px !important;
            left: 10px !important;
            display: inline-flex !important;
            align-items: center !important;
            min-height: 28px !important;
            padding: 0 10px !important;
            border-radius: 8px !important;
            color: #ffffff !important;
            background: #7c3aed !important;
            box-shadow: 0 8px 22px rgba(39, 24, 97, .24) !important;
            font: 700 11px/1 Arial, sans-serif !important;
            pointer-events: none !important;
          }
          a, button, input, textarea, select {
            pointer-events: none !important;
          }
        `;
        doc.head.appendChild(editorStyle);
      }

      const nextDraft = await buildNavigator(doc);
      applyCmsStateToDocument(doc, nextDraft, device);

      const clickHandler = (event) => {
        const ElementCtor = doc.defaultView?.Element;
        const target =
          ElementCtor &&
          event.target instanceof ElementCtor
            ? event.target
            : event.target?.parentElement;

        const editable = target?.closest(
          "[data-cms-target-key]"
        );

        if (!editable) return;

        event.preventDefault();
        event.stopPropagation();

        selectTarget(
          editable.dataset.cmsTargetKey,
          false
        );
      };

      doc.addEventListener(
        "pointerdown",
        clickHandler,
        true
      );
      doc.addEventListener("click", clickHandler, true);

      clickCleanupRef.current = () => {
        doc.removeEventListener(
          "pointerdown",
          clickHandler,
          true
        );
        doc.removeEventListener(
          "click",
          clickHandler,
          true
        );
      };

      setReady(true);
      setNotice("");
    } catch (error) {
      setReady(false);
      setNotice(
        error instanceof Error
          ? error.message
          : "The page preview could not be prepared.",
        "error"
      );
    }
  }, [buildNavigator, device, selectTarget]);

  useEffect(
    () => () => {
      clickCleanupRef.current?.();
    },
    []
  );

  const savePageContent = async (
    nextContent,
    extra = {}
  ) => {
    const response = await fetch(
      `${API_URL}/api/site-config/pages/${encodeURIComponent(
        pageKey
      )}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          content: nextContent,
          ...extra,
        }),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      throw new Error(
        data.message ||
          "Page builder changes could not be saved."
      );
    }

    return data.page;
  };

  const saveDraft = async () => {
    if (isSaving || isLoading) return;

    setIsSaving(true);
    setNotice("Saving draft...");

    try {
      const nextContent = {
        ...pageContentRef.current,
        builderDraft: draft,
      };

      await savePageContent(nextContent);

      pageContentRef.current = nextContent;
      savedDraftRef.current = draft;
      setLastSavedAt(formatSaveTime());

      setNotice(
        "Draft saved. The live website has not changed.",
        "success"
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Draft could not be saved.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const publish = async () => {
    if (isSaving || isLoading) return;

    setIsSaving(true);
    setNotice("Publishing page...");

    try {
      const nextContent = {
        ...pageContentRef.current,
        builderDraft: draft,
        builderPublished: draft,
      };

      await savePageContent(nextContent, {
        status: "published",
      });

      pageContentRef.current = nextContent;
      savedDraftRef.current = draft;
      setLastSavedAt(formatSaveTime());

      setNotice(
        "Published successfully. The live page now uses these settings.",
        "success"
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Page could not be published.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const discard = () => {
    const stored = savedDraftRef.current || {};
    draftRef.current = stored;
    setDraft(stored);
    setNotice("Unsaved changes discarded.");
    applyCmsStateToDocument(
      iframeDocumentRef.current,
      stored,
      device
    );
  };

  const imageUrl =
    selectedEdit.content?.imageUrl || "";

  return (
    <section className="pb-shell">
      <header className="pb-topbar">
        <div className="pb-topbar__left">
          <button
            type="button"
            className="pb-back"
            onClick={onBack}
          >
            <ArrowLeft size={16} />
            Pages
          </button>

          <div className="pb-page-title">
            <span>Theme editor</span>
            <h1>{page.title}</h1>
            <p>{page.slug}</p>
          </div>
        </div>

        <div className="pb-topbar__right">
          <span
            className={`pb-save-state ${
              hasUnsavedChanges
                ? "is-unsaved"
                : "is-saved"
            }`}
          >
            <i />
            {hasUnsavedChanges
              ? "Unsaved changes"
              : lastSavedAt
                ? `Saved ${lastSavedAt}`
                : "All changes saved"}
          </span>

          <button
            type="button"
            className="pb-action"
            onClick={discard}
            disabled={
              isLoading ||
              isSaving ||
              !hasUnsavedChanges
            }
          >
            <RotateCcw size={15} />
            Discard
          </button>

          <button
            type="button"
            className="pb-action"
            onClick={saveDraft}
            disabled={
              isLoading ||
              isSaving ||
              !hasUnsavedChanges
            }
          >
            <Save size={15} />
            {isSaving ? "Working..." : "Save draft"}
          </button>

          <button
            type="button"
            className="pb-publish"
            onClick={publish}
            disabled={isLoading || isSaving}
          >
            <Check size={15} />
            {isSaving ? "Working..." : "Publish"}
          </button>
        </div>
      </header>

      {message && (
        <div
          className={`pb-notice is-${messageTone}`}
          role={messageTone === "error" ? "alert" : "status"}
        >
          {message}
        </div>
      )}

      <div className="pb-workspace">
        <aside className="pb-sidebar">
          <div className="pb-sidebar__header">
            <div>
              <span>Page structure</span>
              <strong>
                {navigator.length} sections
              </strong>
            </div>

            <Layers3 size={18} />
          </div>

          <div className="pb-nav">
            {navigator.map((section, index) => (
              <div
                className="pb-nav__section"
                key={section.key}
              >
                <button
                  type="button"
                  className={`pb-nav__row ${
                    selectedKey === section.key
                      ? "is-active"
                      : ""
                  }`}
                  onClick={() =>
                    selectTarget(section.key)
                  }
                >
                  <span className="pb-nav__index">
                    {index + 1}
                  </span>
                  <strong>{section.label}</strong>
                  <ChevronRight size={14} />
                </button>

                {section.children.length > 0 && (
                  <div className="pb-nav__children">
                    {section.children.map(
                      (child) => (
                        <button
                          type="button"
                          key={child.key}
                          className={
                            selectedKey === child.key
                              ? "is-active"
                              : ""
                          }
                          onClick={() =>
                            selectTarget(child.key)
                          }
                        >
                          <span />
                          {child.label}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pb-editor">
            <div className="pb-editor__heading">
              <div>
                <span>
                  {selectedTarget?.kind === "block"
                    ? "Block"
                    : "Section"}
                </span>
                <strong>
                  {selectedTarget?.label ||
                    "Select a section"}
                </strong>
              </div>
              <Eye size={16} />
            </div>

            <div className="pb-tabs">
              {[
                ["content", Type, "Content"],
                ["style", Paintbrush, "Style"],
                ["advanced", Settings2, "Advanced"],
              ].map(([value, Icon, label]) => (
                <button
                  type="button"
                  key={value}
                  className={
                    tab === value ? "is-active" : ""
                  }
                  onClick={() => setTab(value)}
                  disabled={!selectedTarget}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            <div className="pb-controls">
              {!selectedTarget && (
                <div className="pb-empty">
                  Select a section from the list or click
                  directly in the live preview.
                </div>
              )}

              {selectedTarget && tab === "content" && (
                <>
                  {selectedTarget.capabilities.eyebrow && (
                    <Field
                      label="Eyebrow / label"
                      value={selectedEdit.content.eyebrow}
                      onChange={(value) =>
                        updateSelected(
                          "content",
                          "eyebrow",
                          value
                        )
                      }
                    />
                  )}

                  {selectedTarget.capabilities.heading && (
                    <Area
                      label="Heading"
                      value={selectedEdit.content.heading}
                      rows={3}
                      onChange={(value) =>
                        updateSelected(
                          "content",
                          "heading",
                          value
                        )
                      }
                    />
                  )}

                  {selectedTarget.capabilities.description && (
                    <Area
                      label="Description"
                      value={
                        selectedEdit.content.description
                      }
                      rows={5}
                      onChange={(value) =>
                        updateSelected(
                          "content",
                          "description",
                          value
                        )
                      }
                    />
                  )}

                  {selectedTarget.capabilities.primaryButton && (
                    <>
                      <Field
                        label="Primary button text"
                        value={
                          selectedEdit.content.primaryButton
                        }
                        onChange={(value) =>
                          updateSelected(
                            "content",
                            "primaryButton",
                            value
                          )
                        }
                      />
                      {selectedTarget.capabilities
                        .primaryButtonUrl && (
                        <Field
                          label="Primary button link"
                          value={
                            selectedEdit.content
                              .primaryButtonUrl
                          }
                          placeholder="/contact or https://..."
                          onChange={(value) =>
                            updateSelected(
                              "content",
                              "primaryButtonUrl",
                              value
                            )
                          }
                        />
                      )}
                    </>
                  )}

                  {selectedTarget.capabilities.secondaryButton && (
                    <>
                      <Field
                        label="Secondary button text"
                        value={
                          selectedEdit.content.secondaryButton
                        }
                        onChange={(value) =>
                          updateSelected(
                            "content",
                            "secondaryButton",
                            value
                          )
                        }
                      />
                      {selectedTarget.capabilities
                        .secondaryButtonUrl && (
                        <Field
                          label="Secondary button link"
                          value={
                            selectedEdit.content
                              .secondaryButtonUrl
                          }
                          placeholder="/projects or https://..."
                          onChange={(value) =>
                            updateSelected(
                              "content",
                              "secondaryButtonUrl",
                              value
                            )
                          }
                        />
                      )}
                    </>
                  )}

                  {selectedTarget.capabilities.image && (
                    <div className="pb-image-field">
                      <span>Image</span>

                      <button
                        type="button"
                        className="pb-image-preview"
                        onClick={() => setMediaOpen(true)}
                      >
                        {imageUrl ? (
                          <img src={imageUrl} alt="" />
                        ) : (
                          <ImageIcon size={24} />
                        )}
                        <strong>
                          Choose from Media Library
                        </strong>
                      </button>

                      <Field
                        label="Alt text"
                        value={selectedEdit.content.imageAlt}
                        onChange={(value) =>
                          updateSelected(
                            "content",
                            "imageAlt",
                            value
                          )
                        }
                      />
                    </div>
                  )}
                </>
              )}

              {selectedTarget && tab === "style" && (
                <>
                  <Toggle
                    label="Enable custom section styles"
                    note="Keep this off to preserve the original website design."
                    checked={selectedEdit.style.enabled}
                    onChange={(value) =>
                      updateSelected(
                        "style",
                        "enabled",
                        value
                      )
                    }
                  />

                  <ColorField
                    label="Background"
                    value={selectedEdit.style.background}
                    disabled={!selectedEdit.style.enabled}
                    onChange={(value) =>
                      updateSelected(
                        "style",
                        "background",
                        value
                      )
                    }
                  />

                  <ColorField
                    label="Text color"
                    value={selectedEdit.style.text}
                    disabled={!selectedEdit.style.enabled}
                    onChange={(value) =>
                      updateSelected(
                        "style",
                        "text",
                        value
                      )
                    }
                  />

                  <ColorField
                    label="Heading color"
                    value={selectedEdit.style.heading}
                    disabled={!selectedEdit.style.enabled}
                    onChange={(value) =>
                      updateSelected(
                        "style",
                        "heading",
                        value
                      )
                    }
                  />

                  <label className="pb-field">
                    <span>Text alignment</span>
                    <select
                      value={selectedEdit.style.align}
                      disabled={!selectedEdit.style.enabled}
                      onChange={(event) =>
                        updateSelected(
                          "style",
                          "align",
                          event.target.value
                        )
                      }
                    >
                      <option value="">
                        Keep current
                      </option>
                      <option value="left">Left</option>
                      <option value="center">
                        Center
                      </option>
                      <option value="right">Right</option>
                    </select>
                  </label>
                </>
              )}

              {selectedTarget && tab === "advanced" && (
                <>
                  <Toggle
                    label="Enable advanced controls"
                    note="Responsive spacing and visibility controls."
                    checked={selectedEdit.advanced.enabled}
                    onChange={(value) =>
                      updateSelected(
                        "advanced",
                        "enabled",
                        value
                      )
                    }
                  />

                  <NumberField
                    label="Desktop top padding"
                    value={
                      selectedEdit.advanced.desktopTop
                    }
                    disabled={!selectedEdit.advanced.enabled}
                    onChange={(value) =>
                      updateSelected(
                        "advanced",
                        "desktopTop",
                        value
                      )
                    }
                  />

                  <NumberField
                    label="Desktop bottom padding"
                    value={
                      selectedEdit.advanced.desktopBottom
                    }
                    disabled={!selectedEdit.advanced.enabled}
                    onChange={(value) =>
                      updateSelected(
                        "advanced",
                        "desktopBottom",
                        value
                      )
                    }
                  />

                  <NumberField
                    label="Mobile top padding"
                    value={selectedEdit.advanced.mobileTop}
                    disabled={!selectedEdit.advanced.enabled}
                    onChange={(value) =>
                      updateSelected(
                        "advanced",
                        "mobileTop",
                        value
                      )
                    }
                  />

                  <NumberField
                    label="Mobile bottom padding"
                    value={
                      selectedEdit.advanced.mobileBottom
                    }
                    disabled={!selectedEdit.advanced.enabled}
                    onChange={(value) =>
                      updateSelected(
                        "advanced",
                        "mobileBottom",
                        value
                      )
                    }
                  />

                  {[
                    ["hideDesktop", "Hide on desktop"],
                    ["hideTablet", "Hide on tablet"],
                    ["hideMobile", "Hide on mobile"],
                  ].map(([field, label]) => (
                    <Toggle
                      key={field}
                      label={label}
                      checked={
                        selectedEdit.advanced[field]
                      }
                      disabled={
                        !selectedEdit.advanced.enabled
                      }
                      onChange={(value) =>
                        updateSelected(
                          "advanced",
                          field,
                          value
                        )
                      }
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </aside>

        <main className="pb-canvas">
          <header className="pb-canvas__toolbar">
            <div className="pb-devices">
              {[
                ["desktop", Monitor, "Desktop"],
                ["tablet", Tablet, "Tablet"],
                ["mobile", Smartphone, "Mobile"],
              ].map(([value, Icon, label]) => (
                <button
                  type="button"
                  key={value}
                  className={
                    device === value ? "is-active" : ""
                  }
                  onClick={() => setDevice(value)}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            <div className="pb-preview-status">
              <span
                className={
                  ready ? "is-ready" : "is-loading"
                }
              >
                <i />
                {ready
                  ? "Live preview ready"
                  : "Preparing preview"}
              </span>

              <button
                type="button"
                onClick={() => {
                  setReady(false);
                  iframeRef.current?.contentWindow?.location.reload();
                }}
              >
                <RefreshCcw size={14} />
                Reload
              </button>
            </div>
          </header>

          <div className="pb-stage">
            <div
              className={`pb-frame is-${device}`}
              style={{ width: DEVICE_WIDTH[device] }}
            >
              {isLoading ? (
                <div className="pb-frame__loading">
                  Loading page content…
                </div>
              ) : (
                <iframe
                  ref={iframeRef}
                  src={`${page.slug}?cmsPreview=1&cmsBuilder=1`}
                  title={`${page.title} visual editor`}
                  onLoad={preparePreview}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      <MediaPickerModal
        open={mediaOpen}
        currentUrl={imageUrl}
        title="Choose page image"
        description="Select an image already stored in your Media Library."
        onClose={() => setMediaOpen(false)}
        onSelect={(item) => {
          updateSelected(
            "content",
            "imageUrl",
            item.url
          );

          if (!selectedEdit.content.imageAlt) {
            updateSelected(
              "content",
              "imageAlt",
              item.alt || item.title || ""
            );
          }
        }}
      />
    </section>
  );
}

function Field({
  label,
  value = "",
  placeholder = "",
  onChange,
}) {
  return (
    <label className="pb-field">
      <span>{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </label>
  );
}

function Area({
  label,
  value = "",
  rows = 4,
  onChange,
}) {
  return (
    <label className="pb-field">
      <span>{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </label>
  );
}

function NumberField({
  label,
  value = "",
  disabled = false,
  onChange,
}) {
  return (
    <label className="pb-field">
      <span>{label}</span>
      <div className="pb-number">
        <input
          type="number"
          min="0"
          max="400"
          value={value}
          disabled={disabled}
          placeholder="Keep current"
          onChange={(event) =>
            onChange(event.target.value)
          }
        />
        <small>px</small>
      </div>
    </label>
  );
}

function Toggle({
  label,
  note = "",
  checked = false,
  disabled = false,
  onChange,
}) {
  return (
    <label
      className={`pb-toggle ${
        disabled ? "is-disabled" : ""
      }`}
    >
      <span>
        <strong>{label}</strong>
        {note && <small>{note}</small>}
      </span>

      <input
        type="checkbox"
        checked={Boolean(checked)}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.checked)
        }
      />
    </label>
  );
}

function ColorField({
  label,
  value = "",
  disabled = false,
  onChange,
}) {
  const validColor =
    /^#[0-9a-f]{6}$/i.test(value)
      ? value
      : "#000000";

  return (
    <label className="pb-field">
      <span>{label}</span>
      <div className="pb-color">
        <input
          type="color"
          value={validColor}
          disabled={disabled}
          onChange={(event) =>
            onChange(
              event.target.value.toUpperCase()
            )
          }
        />
        <input
          value={value}
          disabled={disabled}
          placeholder="Keep current"
          onChange={(event) =>
            onChange(
              event.target.value.toUpperCase()
            )
          }
        />
      </div>
    </label>
  );
}
