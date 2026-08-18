import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Eye,
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

import "./PageBuilder.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "" : "http://localhost:5000");

const slugify = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const sectionLabel = (element, index) => {
  const classes = Array.from(element.classList);
  const known = [
    ["hero", "Hero"],
    ["masthead", "Page Header"],
    ["about-profile", "About Profile"],
    ["about-values", "Values"],
    ["about-journey", "Journey"],
    ["about-principles", "Principles"],
    ["about-details", "About Details"],
    ["about-final-cta", "Final Call to Action"],
    ["about", "About"],
    ["projects-page", "Projects Archive"],
    ["projects", "Featured Projects"],
    ["delivery", "Delivery Standards"],
    ["process", "Process"],
    ["opportunity", "Contact & Opportunities"],
    ["cta-banner", "Call to Action"],
    ["contact", "Contact"],
  ];

  for (const [className, label] of known) {
    if (classes.includes(className)) return label;
  }

  return (
    element.querySelector("h1, h2, h3")?.textContent?.trim().slice(0, 48) ||
    `Section ${index + 1}`
  );
};

const sectionKey = (element, index) => {
  if (element.id) return element.id;
  const usefulClass = Array.from(element.classList).find(
    (name) => !["sec", "rv", "rv--in"].includes(name)
  );
  return `${usefulClass || "section"}-${index}-${slugify(
    sectionLabel(element, index)
  )}`;
};

const targetsFor = (section) => {
  const buttons = Array.from(
    section.querySelectorAll("button.btn, a.btn, .nav-cta")
  );

  return {
    eyebrow: section.querySelector(
      ".hi-badge, .eyebrow2, .crumb, [class*='eyebrow']"
    ),
    heading: section.querySelector("h1, h2"),
    description: section.querySelector(
      "p.lead, .sec-head p, .about-copy p, .opportunity-copy p, .masthead p, p"
    ),
    primaryButton: buttons[0] || null,
    secondaryButton: buttons[1] || null,
  };
};

const emptyEdit = () => ({
  content: {
    eyebrow: "",
    heading: "",
    description: "",
    primaryButton: "",
    secondaryButton: "",
  },
  style: {
    enabled: false,
    background: "",
    text: "",
    heading: "",
    align: "",
  },
  advanced: {
    enabled: false,
    desktopTop: "",
    desktopBottom: "",
    mobileTop: "",
    mobileBottom: "",
    hideDesktop: false,
    hideTablet: false,
    hideMobile: false,
  },
});

const captureEdit = (section) => {
  const targets = targetsFor(section);
  const edit = emptyEdit();

  Object.keys(edit.content).forEach((field) => {
    edit.content[field] = targets[field]?.textContent?.trim() || "";
  });

  return edit;
};

export default function PageBuilder({ page, onBack }) {
  const iframeRef = useRef(null);
  const iframeDocumentRef = useRef(null);
  const elementsRef = useRef(new Map());
  const observerRef = useRef(null);
  const applyingRef = useRef(false);
  const draftRef = useRef({});
  const clickCleanupRef = useRef(null);
  const pageContentRef = useRef(page.content || {});
  const lastSavedDraftRef = useRef(
    page.content?.builderDraft || page.content?.builderPublished || {}
  );

  const pageKey =
    page.key || (page.id === "portfolio" ? "projects" : page.id);

  const initialDraft = useMemo(
    () => page.content?.builderDraft || page.content?.builderPublished || {},
    [page.content]
  );

  const [draft, setDraft] = useState(initialDraft);
  const [sections, setSections] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [tab, setTab] = useState("content");
  const [device, setDevice] = useState("desktop");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    let cancelled = false;

    const loadPageBuilderData = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`${API_URL}/api/site-config`, {
          credentials: "include",
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.success === false) {
          throw new Error(data.message || "Page builder data could not be loaded.");
        }

        const savedPage = (data.config?.pages || []).find(
          (item) => String(item.key) === String(pageKey)
        );

        if (!savedPage) {
          throw new Error("This page was not found in the CMS database.");
        }

        const content =
          savedPage.content && typeof savedPage.content === "object"
            ? savedPage.content
            : {};

        const savedDraft =
          content.builderDraft || content.builderPublished || {};

        if (!cancelled) {
          pageContentRef.current = content;
          lastSavedDraftRef.current = savedDraft;
          draftRef.current = savedDraft;
          setDraft(savedDraft);
          setMessage("");
        }
      } catch (error) {
        console.error("Failed to load page builder data:", error);

        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Page builder data could not be loaded."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadPageBuilderData();

    return () => {
      cancelled = true;
    };
  }, [pageKey]);

  const selected = sections.find((item) => item.key === selectedKey);
  const selectedEdit = selectedKey
    ? draft[selectedKey] || emptyEdit()
    : emptyEdit();

  const changeSelected = (area, field, value) => {
    if (!selectedKey) return;

    setDraft((current) => {
      const currentEdit = current[selectedKey] || emptyEdit();
      return {
        ...current,
        [selectedKey]: {
          ...currentEdit,
          [area]: {
            ...currentEdit[area],
            [field]: value,
          },
        },
      };
    });

    setMessage("");
  };

  const applyDraft = useCallback(
    (value = draftRef.current) => {
      if (!iframeDocumentRef.current || applyingRef.current) return;

      applyingRef.current = true;

      try {
        elementsRef.current.forEach((section, key) => {
          const edit = value[key];
          if (!edit) return;

          const targets = targetsFor(section);
          Object.entries(edit.content || {}).forEach(([field, text]) => {
            if (targets[field]) targets[field].textContent = text;
          });

          section.style.removeProperty("background-color");
          section.style.removeProperty("color");
          section.style.removeProperty("text-align");
          section.style.removeProperty("padding-top");
          section.style.removeProperty("padding-bottom");

          const heading = section.querySelector("h1, h2");
          heading?.style.removeProperty("color");

          if (edit.style?.enabled) {
            if (edit.style.background)
              section.style.backgroundColor = edit.style.background;
            if (edit.style.text) section.style.color = edit.style.text;
            if (edit.style.heading && heading)
              heading.style.color = edit.style.heading;
            if (edit.style.align) section.style.textAlign = edit.style.align;
          }

          if (edit.advanced?.enabled) {
            const mobile = device === "mobile";
            const top = mobile
              ? edit.advanced.mobileTop
              : edit.advanced.desktopTop;
            const bottom = mobile
              ? edit.advanced.mobileBottom
              : edit.advanced.desktopBottom;

            if (top !== "") section.style.paddingTop = `${Number(top)}px`;
            if (bottom !== "")
              section.style.paddingBottom = `${Number(bottom)}px`;
          }

          const hidden =
            (device === "desktop" && edit.advanced?.hideDesktop) ||
            (device === "tablet" && edit.advanced?.hideTablet) ||
            (device === "mobile" && edit.advanced?.hideMobile);

          section.dataset.cmsHidden = hidden ? "true" : "false";
        });
      } finally {
        applyingRef.current = false;
      }
    },
    [device]
  );

  useEffect(() => {
    applyDraft(draft);
  }, [draft, device, applyDraft]);

  const selectSection = useCallback((key, scroll = true) => {
    const doc = iframeDocumentRef.current;
    if (!doc) return;

    doc.querySelectorAll("[data-cms-selected='true']").forEach((node) => {
      node.dataset.cmsSelected = "false";
    });

    const element = elementsRef.current.get(key);
    if (element) {
      element.dataset.cmsSelected = "true";
      if (scroll) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    setSelectedKey(key);
  }, []);

  const preparePreview = useCallback(async () => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;

    if (!doc) {
      setReady(false);
      return;
    }

    iframeDocumentRef.current = doc;
    observerRef.current?.disconnect();
    clickCleanupRef.current?.();

    /*
     * The iframe load event can fire before React has finished
     * rendering App.jsx. Wait until the real page sections exist
     * before setting up the editor.
     */
    let pageSections = [];

    for (let attempt = 0; attempt < 60; attempt += 1) {
      pageSections = Array.from(
        doc.querySelectorAll(
          "main#main-content.main-content > section, main.main-content > section"
        )
      );

      if (pageSections.length > 0) {
        break;
      }

      await new Promise((resolve) =>
        window.setTimeout(resolve, 100)
      );
    }

    if (pageSections.length === 0) {
      setReady(false);
      setMessage(
        "The real page loaded, but its editable sections were not found. Press Reload once."
      );
      return;
    }

    let style = doc.getElementById(
      "portfolio-cms-editor-style"
    );

    if (!style) {
      style = doc.createElement("style");
      style.id = "portfolio-cms-editor-style";

      style.textContent = `
        main.main-content > section[data-cms-section='true'] {
          position: relative !important;
          outline: 2px solid transparent !important;
          outline-offset: -2px !important;
        }

        main.main-content > section[data-cms-section='true']:hover {
          outline-color: rgba(37, 99, 235, .72) !important;
          cursor: pointer !important;
        }

        main.main-content > section[data-cms-selected='true'] {
          outline: 3px solid #2563eb !important;
          outline-offset: -3px !important;
        }

        main.main-content > section[data-cms-selected='true']::before {
          content: attr(data-cms-label);
          position: absolute;
          z-index: 99999;
          top: 10px;
          left: 10px;
          padding: 6px 10px;
          border-radius: 6px;
          color: white;
          background: #2563eb;
          font: 700 11px/1 Arial, sans-serif;
          pointer-events: none;
        }

        main.main-content > section[data-cms-hidden='true'] {
          display: none !important;
        }

        a,
        button,
        input,
        textarea,
        select {
          pointer-events: none !important;
        }
      `;

      doc.head.appendChild(style);
    }

    elementsRef.current.clear();

    const found = pageSections.map((element, index) => {
      const key = sectionKey(element, index);
      const label = sectionLabel(element, index);

      element.dataset.cmsSection = "true";
      element.dataset.cmsSelected = "false";
      element.dataset.cmsSectionKey = key;
      element.dataset.cmsLabel = label;

      elementsRef.current.set(key, element);

      return {
        key,
        label,
      };
    });

    const nextDraft = {
      ...draftRef.current,
    };

    found.forEach(({ key }) => {
      if (!nextDraft[key]) {
        nextDraft[key] = captureEdit(
          elementsRef.current.get(key)
        );
      }
    });

    draftRef.current = nextDraft;
    setDraft(nextDraft);
    setSections(found);
    setReady(true);
    setMessage("");

    const clickHandler = (event) => {
      const EventElement =
        doc.defaultView?.Element;

      const target =
        EventElement &&
        event.target instanceof EventElement
          ? event.target
          : event.target?.parentElement;

      const section = target?.closest(
        "main.main-content > section[data-cms-section='true']"
      );

      if (!section) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      selectSection(
        section.dataset.cmsSectionKey,
        false
      );
    };

    doc.addEventListener(
      "pointerdown",
      clickHandler,
      true
    );

    doc.addEventListener(
      "click",
      clickHandler,
      true
    );

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

    let scheduled = false;

    observerRef.current = new MutationObserver(() => {
      if (applyingRef.current || scheduled) {
        return;
      }

      scheduled = true;

      window.requestAnimationFrame(() => {
        scheduled = false;
        applyDraft();
      });
    });

    observerRef.current.observe(doc.body, {
      subtree: true,
      childList: true,
      characterData: true,
    });

    applyDraft(nextDraft);

    const firstKey =
      selectedKey || found[0]?.key;

    if (firstKey) {
      window.setTimeout(() => {
        selectSection(firstKey, false);
      }, 80);
    }
  }, [applyDraft, selectSection, selectedKey]);

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
      clickCleanupRef.current?.();
    },
    []
  );

  const savePageContent = async (nextContent, extra = {}) => {
    const response = await fetch(
      `${API_URL}/api/site-config/pages/${encodeURIComponent(pageKey)}`,
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
      throw new Error(data.message || "Page builder changes could not be saved.");
    }

    return data.page;
  };

  const saveDraft = async () => {
    if (isSaving || isLoading) return;

    setIsSaving(true);
    setMessage("Saving draft...");

    try {
      const nextContent = {
        ...pageContentRef.current,
        builderDraft: draft,
      };

      await savePageContent(nextContent);

      pageContentRef.current = nextContent;
      lastSavedDraftRef.current = draft;

      setMessage(
        "Draft saved to MongoDB. The public website has not changed."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Draft could not be saved."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const publish = async () => {
    if (isSaving || isLoading) return;

    setIsSaving(true);
    setMessage("Publishing changes...");

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
      lastSavedDraftRef.current = draft;

      window.dispatchEvent(
        new CustomEvent("portfolio-cms:page-published", {
          detail: {
            pageKey,
            content: nextContent,
          },
        })
      );

      setMessage(
        "Published successfully. These changes are now stored as the live page version."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Page could not be published."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const discard = () => {
    const stored = lastSavedDraftRef.current || {};
    draftRef.current = stored;
    setDraft(stored);
    setMessage("Unsaved preview changes discarded.");
    iframeRef.current?.contentWindow?.location.reload();
  };

  return (
    <section className="elementor-builder">
      <header className="elementor-builder__header">
        <div className="elementor-builder__title">
          <button type="button" onClick={onBack}>
            <ArrowLeft size={16} /> Pages
          </button>
          <div>
            <span>Visual page builder</span>
            <h1>{page.title}</h1>
            <p>
              Editing the real page at <strong>{page.slug}</strong>
            </p>
          </div>
        </div>

        <div className="elementor-builder__actions">
          <button type="button" onClick={discard} disabled={isSaving || isLoading}>
            <RotateCcw size={15} /> Discard
          </button>
          <button type="button" onClick={saveDraft} disabled={isSaving || isLoading}>
            <Save size={15} /> {isSaving ? "Saving..." : "Save Draft"}
          </button>
          <button type="button" className="is-publish" onClick={publish} disabled={isSaving || isLoading}>
            {isSaving ? "Working..." : "Publish"}
          </button>
        </div>
      </header>

      {message && <div className="elementor-builder__notice">{message}</div>}

      <div className="elementor-builder__workspace">
        <aside className="elementor-builder__panel">
          <div className="elementor-builder__panel-heading">
            <Eye size={17} />
            <div>
              <strong>{selected?.label || "Select a section"}</strong>
              <span>Click a real section in the preview</span>
            </div>
          </div>

          <div className="elementor-builder__tabs">
            {[
              ["content", Type, "Content"],
              ["style", Paintbrush, "Style"],
              ["advanced", Settings2, "Advanced"],
            ].map(([value, Icon, label]) => (
              <button
                type="button"
                key={value}
                className={tab === value ? "is-active" : ""}
                onClick={() => setTab(value)}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          <div className="elementor-builder__controls">
            {!selected && (
              <div className="elementor-builder__empty">
                Click any section in the actual website preview.
              </div>
            )}

            {selected && tab === "content" && (
              <>
                <Group title="Text content">
                  <Field
                    label="Eyebrow / label"
                    value={selectedEdit.content.eyebrow}
                    onChange={(value) =>
                      changeSelected("content", "eyebrow", value)
                    }
                  />
                  <Area
                    label="Heading"
                    value={selectedEdit.content.heading}
                    rows={4}
                    onChange={(value) =>
                      changeSelected("content", "heading", value)
                    }
                  />
                  <Area
                    label="Description"
                    value={selectedEdit.content.description}
                    rows={7}
                    onChange={(value) =>
                      changeSelected("content", "description", value)
                    }
                  />
                </Group>

                <Group title="Buttons">
                  <Field
                    label="Primary button"
                    value={selectedEdit.content.primaryButton}
                    onChange={(value) =>
                      changeSelected("content", "primaryButton", value)
                    }
                  />
                  <Field
                    label="Secondary button"
                    value={selectedEdit.content.secondaryButton}
                    onChange={(value) =>
                      changeSelected("content", "secondaryButton", value)
                    }
                  />
                </Group>
              </>
            )}

            {selected && tab === "style" && (
              <>
                <Toggle
                  label="Enable style overrides"
                  note="Off preserves every current color and style."
                  checked={selectedEdit.style.enabled}
                  onChange={(value) =>
                    changeSelected("style", "enabled", value)
                  }
                />
                <Group title="Section colors">
                  <Color
                    label="Background"
                    value={selectedEdit.style.background}
                    disabled={!selectedEdit.style.enabled}
                    onChange={(value) =>
                      changeSelected("style", "background", value)
                    }
                  />
                  <Color
                    label="Text"
                    value={selectedEdit.style.text}
                    disabled={!selectedEdit.style.enabled}
                    onChange={(value) =>
                      changeSelected("style", "text", value)
                    }
                  />
                  <Color
                    label="Heading"
                    value={selectedEdit.style.heading}
                    disabled={!selectedEdit.style.enabled}
                    onChange={(value) =>
                      changeSelected("style", "heading", value)
                    }
                  />
                  <label className="elementor-builder__field">
                    <span>Alignment</span>
                    <select
                      value={selectedEdit.style.align}
                      disabled={!selectedEdit.style.enabled}
                      onChange={(event) =>
                        changeSelected("style", "align", event.target.value)
                      }
                    >
                      <option value="">Keep current</option>
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </label>
                </Group>
                <p className="elementor-builder__safe">
                  Nothing changes until this switch is enabled.
                </p>
              </>
            )}

            {selected && tab === "advanced" && (
              <>
                <Toggle
                  label="Enable advanced overrides"
                  note="Off preserves current spacing and visibility."
                  checked={selectedEdit.advanced.enabled}
                  onChange={(value) =>
                    changeSelected("advanced", "enabled", value)
                  }
                />
                <Group title="Desktop spacing">
                  <NumberField
                    label="Top padding"
                    value={selectedEdit.advanced.desktopTop}
                    disabled={!selectedEdit.advanced.enabled}
                    onChange={(value) =>
                      changeSelected("advanced", "desktopTop", value)
                    }
                  />
                  <NumberField
                    label="Bottom padding"
                    value={selectedEdit.advanced.desktopBottom}
                    disabled={!selectedEdit.advanced.enabled}
                    onChange={(value) =>
                      changeSelected("advanced", "desktopBottom", value)
                    }
                  />
                </Group>
                <Group title="Mobile spacing">
                  <NumberField
                    label="Top padding"
                    value={selectedEdit.advanced.mobileTop}
                    disabled={!selectedEdit.advanced.enabled}
                    onChange={(value) =>
                      changeSelected("advanced", "mobileTop", value)
                    }
                  />
                  <NumberField
                    label="Bottom padding"
                    value={selectedEdit.advanced.mobileBottom}
                    disabled={!selectedEdit.advanced.enabled}
                    onChange={(value) =>
                      changeSelected("advanced", "mobileBottom", value)
                    }
                  />
                </Group>
                <Group title="Responsive visibility">
                  {[
                    ["hideDesktop", "Hide on desktop"],
                    ["hideTablet", "Hide on tablet"],
                    ["hideMobile", "Hide on mobile"],
                  ].map(([field, label]) => (
                    <Toggle
                      key={field}
                      label={label}
                      checked={selectedEdit.advanced[field]}
                      disabled={!selectedEdit.advanced.enabled}
                      onChange={(value) =>
                        changeSelected("advanced", field, value)
                      }
                    />
                  ))}
                </Group>
              </>
            )}
          </div>

          <Navigator
            sections={sections}
            selectedKey={selectedKey}
            onSelect={selectSection}
          />
        </aside>

        <main className="elementor-builder__canvas">
          <header className="elementor-builder__canvas-toolbar">
            <div className="elementor-builder__devices">
              {[
                ["desktop", Monitor, "Desktop"],
                ["tablet", Tablet, "Tablet"],
                ["mobile", Smartphone, "Mobile"],
              ].map(([value, Icon, label]) => (
                <button
                  type="button"
                  key={value}
                  className={device === value ? "is-active" : ""}
                  onClick={() => setDevice(value)}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            <span className={ready ? "is-ready" : ""}>
              {ready ? "Real page ready" : "Loading real page"}
            </span>

            <button
              type="button"
              className="elementor-builder__reload"
              onClick={() => {
                setReady(false);
                iframeRef.current?.contentWindow?.location.reload();
              }}
            >
              <RefreshCcw size={14} /> Reload
            </button>
          </header>

          <div className="elementor-builder__stage">
            <div
              className={`elementor-builder__frame is-${device}`}
              style={{ width: DEVICE_WIDTH[device] }}
            >
              <iframe
                ref={iframeRef}
                src={`${page.slug}?cmsPreview=1`}
                title={`${page.title} visual editor`}
                onLoad={preparePreview}
              />
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}

function Group({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="elementor-builder__group">
      <button type="button" onClick={() => setOpen((value) => !value)}>
        <strong>{title}</strong>
        {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
      </button>
      {open && <div>{children}</div>}
    </section>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="elementor-builder__field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Area({ label, value, rows, onChange }) {
  return (
    <label className="elementor-builder__field">
      <span>{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function NumberField({ label, value, disabled, onChange }) {
  return (
    <label className="elementor-builder__field">
      <span>{label}</span>
      <div className="elementor-builder__number">
        <input
          type="number"
          min="0"
          max="400"
          value={value}
          disabled={disabled}
          placeholder="Keep current"
          onChange={(event) => onChange(event.target.value)}
        />
        <small>px</small>
      </div>
    </label>
  );
}

function Color({ label, value, disabled, onChange }) {
  const picker = /^#[0-9a-f]{6}$/i.test(value) ? value : "#000000";
  return (
    <label className="elementor-builder__field">
      <span>{label}</span>
      <div className="elementor-builder__color">
        <input
          type="color"
          value={picker}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
        />
        <input
          value={value}
          disabled={disabled}
          placeholder="Keep current"
          onChange={(event) => onChange(event.target.value.toUpperCase())}
        />
      </div>
    </label>
  );
}

function Toggle({ label, note, checked, disabled, onChange }) {
  return (
    <label className={`elementor-builder__toggle ${disabled ? "is-disabled" : ""}`}>
      <span>
        <strong>{label}</strong>
        {note && <small>{note}</small>}
      </span>
      <input
        type="checkbox"
        checked={Boolean(checked)}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function Navigator({ sections, selectedKey, onSelect }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="elementor-builder__navigator">
      <button type="button" onClick={() => setOpen((value) => !value)}>
        <span>
          <Layers3 size={15} /> Navigator
        </span>
        {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
      </button>
      {open && (
        <div>
          {sections.map((section, index) => (
            <button
              type="button"
              key={section.key}
              className={selectedKey === section.key ? "is-active" : ""}
              onClick={() => onSelect(section.key)}
            >
              <span>{index + 1}</span>
              <strong>{section.label}</strong>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}