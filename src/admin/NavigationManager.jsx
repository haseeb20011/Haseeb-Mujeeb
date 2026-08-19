import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  Link2,
  ListTree,
  Menu,
  Monitor,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Smartphone,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import "./NavigationManager.css";

const STORAGE_KEY = "portfolio-cms-navigation";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "" : "http://localhost:5000");

const fetchJson = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message ||
        "The navigation request could not be completed."
    );
  }

  return data;
};

const FALLBACK_PAGE_OPTIONS = [
  { key: "home", label: "Home", url: "/" },
  { key: "about", label: "About", url: "/about" },
  { key: "services", label: "Services", url: "/services" },
  { key: "projects", label: "Projects", url: "/projects" },
  { key: "process", label: "Process", url: "/process", virtual: true },
  { key: "contact", label: "Contact", url: "/contact" },
];

const toBackendNavigationType = (item) => {
  if (item.url === "/process") return "section";
  if (/^https?:\/\//i.test(item.url)) return "external";
  return "page";
};

const DEFAULT_NAVIGATION = {
  menus: [
    {
      id: "header",
      name: "Header Navigation",
      location: "Main website header",
      description:
        "Primary navigation displayed across the top of the public website.",
      items: [
        {
          id: "header-home",
          label: "Home",
          url: "/",
          type: "page",
          visible: true,
          newTab: false,
        },
        {
          id: "header-about",
          label: "About",
          url: "/about",
          type: "page",
          visible: true,
          newTab: false,
        },
        {
          id: "header-services",
          label: "Services",
          url: "/services",
          type: "page",
          visible: true,
          newTab: false,
        },
        {
          id: "header-projects",
          label: "Projects",
          url: "/projects",
          type: "page",
          visible: true,
          newTab: false,
        },
        {
          id: "header-process",
          label: "Process",
          url: "/process",
          type: "page",
          visible: true,
          newTab: false,
        },
        {
          id: "header-contact",
          label: "Contact",
          url: "/contact",
          type: "page",
          visible: true,
          newTab: false,
        },
      ],
    },
    {
      id: "footer-quick",
      name: "Footer Quick Links",
      location: "Footer column",
      description:
        "General navigation links shown inside the website footer.",
      items: [
        {
          id: "footer-about",
          label: "About",
          url: "/about",
          type: "page",
          visible: true,
          newTab: false,
        },
        {
          id: "footer-services",
          label: "Services",
          url: "/services",
          type: "page",
          visible: true,
          newTab: false,
        },
        {
          id: "footer-projects",
          label: "Projects",
          url: "/projects",
          type: "page",
          visible: true,
          newTab: false,
        },
        {
          id: "footer-process",
          label: "Process",
          url: "/process",
          type: "page",
          visible: true,
          newTab: false,
        },
        {
          id: "footer-contact",
          label: "Contact",
          url: "/contact",
          type: "page",
          visible: true,
          newTab: false,
        },
      ],
    },
    {
      id: "footer-services",
      name: "Footer Services",
      location: "Footer services column",
      description:
        "Service links displayed in the footer without changing the site layout.",
      items: [
        {
          id: "service-wordpress",
          label: "WordPress Website Development",
          url: "/services",
          type: "custom",
          visible: true,
          newTab: false,
        },
        {
          id: "service-shopify",
          label: "Shopify Store Development",
          url: "/services",
          type: "custom",
          visible: true,
          newTab: false,
        },
        {
          id: "service-builders",
          label: "Website Builder Platforms",
          url: "/services",
          type: "custom",
          visible: true,
          newTab: false,
        },
        {
          id: "service-customization",
          label: "Custom Theme & Builder Customization",
          url: "/services",
          type: "custom",
          visible: true,
          newTab: false,
        },
        {
          id: "service-react",
          label: "React & Front-End Development",
          url: "/services",
          type: "custom",
          visible: true,
          newTab: false,
        },
      ],
    },
  ],
  headerCta: {
    enabled: true,
    label: "Let's Work Together",
    url: "/contact",
    newTab: false,
  },
};

const EMPTY_ITEM = {
  label: "",
  linkType: "page",
  pageUrl: "/",
  customUrl: "",
  visible: true,
  newTab: false,
};

const cloneDefaults = () =>
  JSON.parse(JSON.stringify(DEFAULT_NAVIGATION));

const loadNavigation = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return cloneDefaults();
    }

    const parsed = JSON.parse(stored);

    if (
      !parsed ||
      !Array.isArray(parsed.menus) ||
      !parsed.headerCta
    ) {
      return cloneDefaults();
    }

    return parsed;
  } catch {
    return cloneDefaults();
  }
};

const saveNavigation = (navigation) => {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(navigation)
  );

  window.dispatchEvent(
    new CustomEvent("portfolio-navigation-updated", {
      detail: navigation,
    })
  );
};

export default function NavigationManager() {
  const [navigation, setNavigation] = useState(loadNavigation);
  const [activeMenuId, setActiveMenuId] = useState("header");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewMode, setPreviewMode] = useState("desktop");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [itemForm, setItemForm] = useState(EMPTY_ITEM);
  const [notice, setNotice] = useState("");
  const [pageOptions, setPageOptions] = useState(
    FALLBACK_PAGE_OPTIONS
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    saveNavigation(navigation);
  }, [navigation]);

  useEffect(() => {
    let cancelled = false;

    const loadCmsNavigation = async () => {
      try {
        const data = await fetchJson("/api/site-config");
        const pages = Array.isArray(data.config?.pages)
          ? data.config.pages
          : [];
        const storedNavigation = Array.isArray(
          data.config?.navigation
        )
          ? data.config.navigation
          : [];

        const publishedPages = pages
          .filter((page) => page.status === "published")
          .map((page) => ({
            key: String(page.key || page.id || page.slug),
            label: page.title || "Untitled Page",
            url: page.slug || "/",
          }));

        const processOption = FALLBACK_PAGE_OPTIONS.find(
          (page) => page.key === "process"
        );

        const nextPageOptions = [
          ...publishedPages,
          ...(processOption &&
          !publishedPages.some(
            (page) => page.url === processOption.url
          )
            ? [processOption]
            : []),
        ];

        if (cancelled) return;

        setPageOptions(
          nextPageOptions.length > 0
            ? nextPageOptions
            : FALLBACK_PAGE_OPTIONS
        );

        if (storedNavigation.length > 0) {
          const headerItems = storedNavigation
            .slice()
            .sort(
              (a, b) =>
                Number(a.order || 0) -
                Number(b.order || 0)
            )
            .map((item, index) => ({
              id:
                item.id ||
                `header-item-${index + 1}`,
              label: item.label || "Menu Item",
              url: item.url || "/",
              type:
                item.type === "external"
                  ? "custom"
                  : "page",
              visible: item.enabled !== false,
              newTab: Boolean(
                item.openInNewTab
              ),
            }));

          setNavigation((current) => ({
            ...current,
            menus: current.menus.map((menuItem) =>
              menuItem.id === "header"
                ? {
                    ...menuItem,
                    items: headerItems,
                  }
                : menuItem
            ),
          }));
        }
      } catch (error) {
        console.error(
          "Unable to load navigation from the CMS:",
          error
        );
        if (!cancelled) {
          showNotice(
            "Could not load live navigation. Existing local menu shown."
          );
        }
      }
    };

    loadCmsNavigation();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeMenu =
    navigation.menus.find(
      (menuItem) => menuItem.id === activeMenuId
    ) || navigation.menus[0];

  const visibleItemCount = activeMenu.items.filter(
    (item) => item.visible
  ).length;

  const filteredItems = useMemo(() => {
    const normalized = searchQuery
      .trim()
      .toLowerCase();

    if (!normalized) {
      return activeMenu.items;
    }

    return activeMenu.items.filter((item) =>
      [item.label, item.url, item.type]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [activeMenu.items, searchQuery]);

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice("");
    }, 2400);
  };

  const updateActiveMenuItems = (updater) => {
    setNavigation((current) => ({
      ...current,
      menus: current.menus.map((menuItem) =>
        menuItem.id === activeMenu.id
          ? {
              ...menuItem,
              items: updater(menuItem.items),
            }
          : menuItem
      ),
    }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setItemForm({
      ...EMPTY_ITEM,
      pageUrl: pageOptions[0]?.url || "/",
      label: pageOptions[0]?.label || "",
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    const pageMatch = pageOptions.some(
      (page) => page.url === item.url
    );

    setEditingId(item.id);
    setItemForm({
      label: item.label,
      linkType:
        item.type === "page" && pageMatch
          ? "page"
          : "custom",
      pageUrl: pageMatch ? item.url : "/",
      customUrl: pageMatch ? "" : item.url,
      visible: item.visible,
      newTab: item.newTab,
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setItemForm(EMPTY_ITEM);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const label = itemForm.label.trim();
    const url =
      itemForm.linkType === "page"
        ? itemForm.pageUrl
        : itemForm.customUrl.trim();

    if (!label || !url) {
      return;
    }

    if (editingId) {
      updateActiveMenuItems((items) =>
        items.map((item) =>
          item.id === editingId
            ? {
                ...item,
                label,
                url,
                type: itemForm.linkType,
                visible: itemForm.visible,
                newTab: itemForm.newTab,
              }
            : item
        )
      );

      showNotice("Navigation item updated.");
    } else {
      updateActiveMenuItems((items) => [
        ...items,
        {
          id: `${activeMenu.id}-${Date.now()}`,
          label,
          url,
          type: itemForm.linkType,
          visible: itemForm.visible,
          newTab: itemForm.newTab,
        },
      ]);

      showNotice("Navigation item added.");
    }

    closeModal();
  };

  const moveItem = (itemId, direction) => {
    updateActiveMenuItems((items) => {
      const currentIndex = items.findIndex(
        (item) => item.id === itemId
      );

      const nextIndex =
        direction === "up"
          ? currentIndex - 1
          : currentIndex + 1;

      if (
        currentIndex < 0 ||
        nextIndex < 0 ||
        nextIndex >= items.length
      ) {
        return items;
      }

      const reordered = [...items];
      const [movedItem] = reordered.splice(
        currentIndex,
        1
      );

      reordered.splice(nextIndex, 0, movedItem);

      return reordered;
    });
  };

  const duplicateItem = (item) => {
    updateActiveMenuItems((items) => [
      ...items,
      {
        ...item,
        id: `${item.id}-copy-${Date.now()}`,
        label: `${item.label} Copy`,
        visible: false,
      },
    ]);

    showNotice("Navigation item duplicated.");
  };

  const deleteItem = (item) => {
    const confirmed = window.confirm(
      `Delete "${item.label}" from ${activeMenu.name}?`
    );

    if (!confirmed) {
      return;
    }

    updateActiveMenuItems((items) =>
      items.filter(
        (menuItem) => menuItem.id !== item.id
      )
    );

    showNotice("Navigation item deleted.");
  };

  const toggleVisibility = (itemId) => {
    updateActiveMenuItems((items) =>
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              visible: !item.visible,
            }
          : item
      )
    );
  };

  const resetNavigation = () => {
    const confirmed = window.confirm(
      "Reset all navigation menus and the header button to the original website structure?"
    );

    if (!confirmed) {
      return;
    }

    const defaults = cloneDefaults();
    setNavigation(defaults);
    setActiveMenuId("header");
    setSearchQuery("");
    showNotice("Navigation restored to defaults.");
  };

  const saveChanges = async () => {
    const headerMenu =
      navigation.menus.find(
        (menuItem) => menuItem.id === "header"
      ) || navigation.menus[0];

    const payload = headerMenu.items.map(
      (item, index) => ({
        id:
          item.id ||
          `header-item-${index + 1}`,
        label: item.label,
        url: item.url,
        type: toBackendNavigationType(item),
        enabled: item.visible !== false,
        openInNewTab: Boolean(item.newTab),
        order: index,
      })
    );

    try {
      setIsSaving(true);

      await fetchJson("/api/site-config/navigation", {
        method: "PUT",
        body: JSON.stringify({
          navigation: payload,
        }),
      });

      saveNavigation(navigation);
      showNotice(
        "Header navigation saved and published to the website."
      );
    } catch (error) {
      console.error(
        "Unable to save navigation:",
        error
      );
      showNotice(
        error instanceof Error
          ? error.message
          : "Unable to save navigation."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const updateCta = (updates) => {
    setNavigation((current) => ({
      ...current,
      headerCta: {
        ...current.headerCta,
        ...updates,
      },
    }));
  };

  return (
    <section className="cms-navigation">
      <header className="cms-navigation__header">
        <div>
          <span className="cms-navigation__eyebrow">
            Website structure
          </span>

          <h1>Navigation</h1>

          <p>
            Manage header and footer links while
            preserving the exact public website
            layout.
          </p>
        </div>

        <div className="cms-navigation__header-actions">
          <button
            type="button"
            className="cms-navigation__reset"
            onClick={resetNavigation}
          >
            <RotateCcw size={15} />
            Reset defaults
          </button>

          <button
            type="button"
            className="cms-navigation__save"
            onClick={saveChanges}
            disabled={isSaving}
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </header>

      {notice && (
        <div className="cms-navigation__notice">
          <Check size={15} />
          {notice}
        </div>
      )}

      <section className="cms-navigation__summary">
        <article className="cms-navigation__summary-intro">
          <span>
            <Sparkles size={16} />
            Navigation manager
          </span>

          <strong>
            Edit labels, links, visibility, and order
            without rebuilding the website header or
            footer.
          </strong>

          <p>
            Published pages are available automatically.
            Save Header Navigation to publish the selected
            links to the public website.
          </p>
        </article>

        <NavigationStat
          label="Menus"
          value={navigation.menus.length}
          detail="Managed locations"
          tone="purple"
        />

        <NavigationStat
          label="Current items"
          value={activeMenu.items.length}
          detail={activeMenu.name}
          tone="blue"
        />

        <NavigationStat
          label="Visible links"
          value={visibleItemCount}
          detail="Shown on website"
          tone="green"
        />

        <NavigationStat
          label="Hidden links"
          value={
            activeMenu.items.length - visibleItemCount
          }
          detail="Saved but inactive"
          tone="orange"
        />
      </section>

      <section className="cms-navigation__workspace">
        <aside className="cms-navigation__locations">
          <div className="cms-navigation__locations-heading">
            <span>
              <Menu size={16} />
            </span>

            <div>
              <strong>Menu locations</strong>
              <small>
                {navigation.menus.length} menus
              </small>
            </div>
          </div>

          <nav>
            {navigation.menus.map((menuItem) => (
              <button
                type="button"
                key={menuItem.id}
                className={
                  activeMenuId === menuItem.id
                    ? "is-active"
                    : ""
                }
                onClick={() => {
                  setActiveMenuId(menuItem.id);
                  setSearchQuery("");
                }}
              >
                <ListTree size={16} />

                <span>
                  <strong>{menuItem.name}</strong>
                  <small>{menuItem.location}</small>
                </span>

                <i>{menuItem.items.length}</i>
              </button>
            ))}
          </nav>

          <div className="cms-navigation__location-note">
            <Link2 size={16} />

            <div>
              <strong>Protected layout</strong>

              <span>
                Only link content and order are
                editable. The frontend design remains
                unchanged.
              </span>
            </div>
          </div>
        </aside>

        <div className="cms-navigation__editor">
          <header className="cms-navigation__editor-header">
            <div>
              <span>{activeMenu.location}</span>
              <h2>{activeMenu.name}</h2>
              <p>{activeMenu.description}</p>
            </div>

            <button
              type="button"
              className="cms-navigation__add"
              onClick={openCreateModal}
            >
              <Plus size={15} />
              Add menu item
            </button>
          </header>

          <div className="cms-navigation__toolbar">
            <label>
              <Link2 size={15} />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search menu items..."
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery("")
                  }
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </label>

            <span>
              {filteredItems.length} of{" "}
              {activeMenu.items.length} links
            </span>
          </div>

          <div className="cms-navigation__list">
            {filteredItems.map((item) => {
              const originalIndex =
                activeMenu.items.findIndex(
                  (menuItem) =>
                    menuItem.id === item.id
                );

              return (
                <article
                  className={`cms-navigation-item ${
                    item.visible
                      ? ""
                      : "is-hidden"
                  }`}
                  key={item.id}
                >
                  <span className="cms-navigation-item__drag">
                    <GripVertical size={17} />
                  </span>

                  <span className="cms-navigation-item__number">
                    {String(originalIndex + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <div className="cms-navigation-item__copy">
                    <div>
                      <strong>{item.label}</strong>

                      <span>
                        {item.type === "page"
                          ? "Website page"
                          : "Custom link"}
                      </span>
                    </div>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.url}
                      <ExternalLink size={11} />
                    </a>
                  </div>

                  <span
                    className={`cms-navigation-item__status ${
                      item.visible
                        ? "is-visible"
                        : "is-hidden"
                    }`}
                  >
                    {item.visible ? (
                      <Eye size={12} />
                    ) : (
                      <EyeOff size={12} />
                    )}

                    {item.visible
                      ? "Visible"
                      : "Hidden"}
                  </span>

                  <div className="cms-navigation-item__actions">
                    <button
                      type="button"
                      onClick={() =>
                        moveItem(item.id, "up")
                      }
                      disabled={originalIndex === 0}
                      title="Move up"
                    >
                      <ArrowUp size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        moveItem(item.id, "down")
                      }
                      disabled={
                        originalIndex ===
                        activeMenu.items.length - 1
                      }
                      title="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleVisibility(item.id)
                      }
                      title={
                        item.visible
                          ? "Hide link"
                          : "Show link"
                      }
                    >
                      {item.visible ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(item)
                      }
                      title="Edit link"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        duplicateItem(item)
                      }
                      title="Duplicate link"
                    >
                      <Copy size={14} />
                    </button>

                    <button
                      type="button"
                      className="is-delete"
                      onClick={() => deleteItem(item)}
                      title="Delete link"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </article>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="cms-navigation__empty">
                <span>
                  <Link2 size={24} />
                </span>

                <strong>No links found</strong>

                <p>
                  Change the search or add a new menu
                  item.
                </p>

                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                >
                  Reset search
                </button>
              </div>
            )}
          </div>
        </div>

        <aside className="cms-navigation__preview">
          <header>
            <div>
              <span>Live structure preview</span>
              <h2>{activeMenu.name}</h2>
            </div>

            <div className="cms-navigation__devices">
              <button
                type="button"
                className={
                  previewMode === "desktop"
                    ? "is-active"
                    : ""
                }
                onClick={() =>
                  setPreviewMode("desktop")
                }
                aria-label="Desktop preview"
              >
                <Monitor size={15} />
              </button>

              <button
                type="button"
                className={
                  previewMode === "mobile"
                    ? "is-active"
                    : ""
                }
                onClick={() =>
                  setPreviewMode("mobile")
                }
                aria-label="Mobile preview"
              >
                <Smartphone size={15} />
              </button>
            </div>
          </header>

          <div
            className={`cms-navigation__preview-frame is-${previewMode}`}
          >
            {activeMenu.id === "header" ? (
              <HeaderPreview
                items={activeMenu.items}
                cta={navigation.headerCta}
                mode={previewMode}
              />
            ) : (
              <FooterPreview
                menu={activeMenu}
              />
            )}
          </div>

          {activeMenu.id === "header" && (
            <section className="cms-navigation__cta-settings">
              <div>
                <span>Header action button</span>
                <strong>Let's Work Together</strong>
              </div>

              <label className="cms-navigation__toggle-row">
                <span>
                  <strong>Show button</strong>
                  <small>
                    Keep the existing header CTA
                  </small>
                </span>

                <input
                  type="checkbox"
                  checked={
                    navigation.headerCta.enabled
                  }
                  onChange={(event) =>
                    updateCta({
                      enabled: event.target.checked,
                    })
                  }
                />
              </label>

              <label>
                <span>Button label</span>

                <input
                  type="text"
                  value={navigation.headerCta.label}
                  onChange={(event) =>
                    updateCta({
                      label: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                <span>Button link</span>

                <input
                  type="text"
                  value={navigation.headerCta.url}
                  onChange={(event) =>
                    updateCta({
                      url: event.target.value,
                    })
                  }
                />
              </label>

              <label className="cms-navigation__toggle-row">
                <span>
                  <strong>Open in new tab</strong>
                  <small>
                    Useful for external destinations
                  </small>
                </span>

                <input
                  type="checkbox"
                  checked={
                    navigation.headerCta.newTab
                  }
                  onChange={(event) =>
                    updateCta({
                      newTab: event.target.checked,
                    })
                  }
                />
              </label>
            </section>
          )}
        </aside>
      </section>

      {modalOpen && (
        <div
          className="cms-navigation__modal-overlay"
          role="presentation"
          onMouseDown={closeModal}
        >
          <section
            className="cms-navigation__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="navigation-modal-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <header>
              <div>
                <span>
                  <Link2 size={18} />
                </span>

                <div>
                  <small>Menu item</small>

                  <h2 id="navigation-modal-title">
                    {editingId
                      ? "Edit navigation item"
                      : "Add navigation item"}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </header>

            <form onSubmit={handleSubmit}>
              <label>
                <span>Link label</span>

                <input
                  type="text"
                  value={itemForm.label}
                  onChange={(event) =>
                    setItemForm((current) => ({
                      ...current,
                      label: event.target.value,
                    }))
                  }
                  placeholder="Example: Testimonials"
                  required
                  autoFocus
                />
              </label>

              <label>
                <span>Link source</span>

                <select
                  value={itemForm.linkType}
                  onChange={(event) =>
                    setItemForm((current) => ({
                      ...current,
                      linkType:
                        event.target.value,
                    }))
                  }
                >
                  <option value="page">
                    Website page
                  </option>
                  <option value="custom">
                    Custom URL
                  </option>
                </select>
              </label>

              {itemForm.linkType === "page" ? (
                <label>
                  <span>Select page</span>

                  <select
                    value={itemForm.pageUrl}
                    onChange={(event) => {
                      const selectedUrl =
                        event.target.value;
                      const selectedPage =
                        pageOptions.find(
                          (page) =>
                            page.url === selectedUrl
                        );

                      setItemForm((current) => ({
                        ...current,
                        pageUrl: selectedUrl,
                        label:
                          !editingId ||
                          !current.label.trim()
                            ? selectedPage?.label ||
                              current.label
                            : current.label,
                      }));
                    }}
                  >
                    {pageOptions.map((page) => (
                      <option
                        key={page.url}
                        value={page.url}
                      >
                        {page.label} — {page.url}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label>
                  <span>Custom URL</span>

                  <input
                    type="text"
                    value={itemForm.customUrl}
                    onChange={(event) =>
                      setItemForm((current) => ({
                        ...current,
                        customUrl:
                          event.target.value,
                      }))
                    }
                    placeholder="https://example.com or /page"
                    required
                  />
                </label>
              )}

              <div className="cms-navigation__modal-options">
                <label>
                  <span>
                    <strong>Visible</strong>
                    <small>
                      Display this item on the website
                    </small>
                  </span>

                  <input
                    type="checkbox"
                    checked={itemForm.visible}
                    onChange={(event) =>
                      setItemForm((current) => ({
                        ...current,
                        visible:
                          event.target.checked,
                      }))
                    }
                  />
                </label>

                <label>
                  <span>
                    <strong>New tab</strong>
                    <small>
                      Open this link separately
                    </small>
                  </span>

                  <input
                    type="checkbox"
                    checked={itemForm.newTab}
                    onChange={(event) =>
                      setItemForm((current) => ({
                        ...current,
                        newTab:
                          event.target.checked,
                      }))
                    }
                  />
                </label>
              </div>

              <footer>
                <button
                  type="button"
                  className="cms-navigation__cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="cms-navigation__modal-save"
                >
                  <Check size={15} />

                  {editingId
                    ? "Save item"
                    : "Add item"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

function NavigationStat({
  label,
  value,
  detail,
  tone,
}) {
  return (
    <article
      className={`cms-navigation__stat is-${tone}`}
    >
      <span>
        <ListTree size={18} />
      </span>

      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <p>{detail}</p>
      </div>
    </article>
  );
}

function HeaderPreview({ items, cta, mode }) {
  const visibleItems = items.filter(
    (item) => item.visible
  );

  return (
    <div className="cms-navigation-preview-header">
      <div className="cms-navigation-preview-brand">
        <span />
        Haseeb<strong>.dev</strong>
      </div>

      {mode === "mobile" ? (
        <div className="cms-navigation-preview-mobile-menu">
          <Menu size={18} />

          <div>
            {visibleItems.map((item) => (
              <span key={item.id}>{item.label}</span>
            ))}

            {cta.enabled && (
              <strong>{cta.label}</strong>
            )}
          </div>
        </div>
      ) : (
        <>
          <nav>
            {visibleItems.map((item) => (
              <span key={item.id}>{item.label}</span>
            ))}
          </nav>

          {cta.enabled && (
            <strong className="cms-navigation-preview-cta">
              {cta.label}
            </strong>
          )}
        </>
      )}
    </div>
  );
}

function FooterPreview({ menu }) {
  return (
    <div className="cms-navigation-preview-footer">
      <span>{menu.name}</span>

      <strong>{menu.location}</strong>

      <div>
        {menu.items
          .filter((item) => item.visible)
          .map((item) => (
            <span key={item.id}>{item.label}</span>
          ))}
      </div>
    </div>
  );
}