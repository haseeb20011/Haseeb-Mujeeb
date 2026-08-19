import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleDashed,
  Copy,
  Eye,
  FilePlus2,
  FileText,
  Globe2,
  LayoutGrid,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import "./PagesManager.css";

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
        "The page request could not be completed."
    );
  }

  return data;
};

const formatPageDate = (value) => {
  if (!value) return "Recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  const now = new Date();
  const diffMinutes = Math.floor(
    Math.max(0, now.getTime() - date.getTime()) / 60000
  );

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
};

const normalizeStoredPage = (page, index = 0) => {
  const content =
    page?.content && typeof page.content === "object"
      ? page.content
      : {};

  const builderSections =
    content.builderDraft ||
    content.builderPublished ||
    {};

  const builderEntries = Object.values(builderSections).filter(
    (entry) => entry && typeof entry === "object"
  );
  const explicitSectionCount = builderEntries.filter(
    (entry) => entry.meta?.kind === "section"
  ).length;
  const sectionCount = explicitSectionCount ||
    (builderEntries.some((entry) => entry.meta?.kind)
      ? 0
      : Object.keys(builderSections).length);

  return {
    id: String(page?.key || page?.id || ""),
    key: String(page?.key || page?.id || ""),
    title: page?.title || "Untitled Page",
    slug: page?.slug || "/",
    status:
      page?.status === "draft" ? "draft" : "published",
    sections: sectionCount,
    template: page?.template || "Standard Page",
    updatedAt: formatPageDate(page?.updatedAt),
    updatedAtRaw: page?.updatedAt || null,
    inNavigation: page?.inNavigation !== false,
    content,
    tone: pageTones[index % pageTones.length],
  };
};

const toStoredPage = (page) => ({
  key: page.key || page.id,
  title: page.title,
  slug: page.slug,
  status: page.status,
  template: page.template,
  inNavigation: page.inNavigation !== false,
  content:
    page.content && typeof page.content === "object"
      ? page.content
      : {},
  updatedAt:
    page.updatedAtRaw || new Date().toISOString(),
});

const initialPages = [
  {
    id: "home",
    title: "Home",
    slug: "/",
    status: "published",
    sections: 8,
    template: "Landing Page",
    updatedAt: "Today",
    inNavigation: true,
    tone: "purple",
  },
  {
    id: "about",
    title: "About",
    slug: "/about",
    status: "published",
    sections: 7,
    template: "Standard Page",
    updatedAt: "Yesterday",
    inNavigation: true,
    tone: "pink",
  },
  {
    id: "services",
    title: "Services",
    slug: "/services",
    status: "published",
    sections: 5,
    template: "Services Page",
    updatedAt: "3 days ago",
    inNavigation: true,
    tone: "orange",
  },
  {
    id: "portfolio",
    title: "Portfolio",
    slug: "/projects",
    status: "published",
    sections: 4,
    template: "Portfolio Archive",
    updatedAt: "5 days ago",
    inNavigation: true,
    tone: "blue",
  },
  {
    id: "contact",
    title: "Contact",
    slug: "/contact",
    status: "published",
    sections: 3,
    template: "Contact Page",
    updatedAt: "1 week ago",
    inNavigation: true,
    tone: "green",
  },
];

const pageTones = [
  "purple",
  "pink",
  "orange",
  "blue",
  "green",
];

const protectedPageIds = [
  "home",
  "about",
  "services",
  "projects",
  "contact",
];

const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getNextTone = (currentLength) =>
  pageTones[currentLength % pageTones.length];

export default function PagesManager({
  onEditPage = () => {},
}) {
  const [pages, setPages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [showCreateModal, setShowCreateModal] =
    useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  const [newPage, setNewPage] = useState({
    title: "",
    slug: "",
    template: "Standard Page",
    status: "draft",
  });

  useEffect(() => {
    let cancelled = false;

    const loadPages = async () => {
      try {
        const data = await fetchJson("/api/site-config");
        const storedPages = Array.isArray(data.config?.pages)
          ? data.config.pages
          : [];

        if (!cancelled) {
          setPages(
            storedPages.map((page, index) =>
              normalizeStoredPage(page, index)
            )
          );
        }
      } catch (error) {
        console.error("Unable to load CMS pages:", error);
        if (!cancelled) {
          window.alert(
            error instanceof Error
              ? error.message
              : "Unable to load website pages."
          );
        }
      }
    };

    loadPages();

    return () => {
      cancelled = true;
    };
  }, []);

  const persistPages = async (nextPages) => {
    const data = await fetchJson("/api/site-config/pages", {
      method: "PUT",
      body: JSON.stringify({
        pages: nextPages.map(toStoredPage),
      }),
    });

    const storedPages = Array.isArray(data.pages)
      ? data.pages
      : [];

    const normalized = storedPages.map((page, index) =>
      normalizeStoredPage(page, index)
    );

    setPages(normalized);
    return normalized;
  };

  const filteredPages = useMemo(() => {
    const normalizedQuery = searchQuery
      .trim()
      .toLowerCase();

    return pages.filter((page) => {
      const matchesSearch =
        !normalizedQuery ||
        page.title
          .toLowerCase()
          .includes(normalizedQuery) ||
        page.slug
          .toLowerCase()
          .includes(normalizedQuery) ||
        page.template
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "all" ||
        page.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [pages, searchQuery, statusFilter]);

  const publishedCount = pages.filter(
    (page) => page.status === "published"
  ).length;

  const draftCount = pages.filter(
    (page) => page.status === "draft"
  ).length;

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setSlugEdited(false);

    setNewPage({
      title: "",
      slug: "",
      template: "Standard Page",
      status: "draft",
    });
  };

  const handleTitleChange = (event) => {
    const title = event.target.value;

    setNewPage((current) => ({
      ...current,
      title,
      slug: slugEdited
        ? current.slug
        : title
          ? `/${slugify(title)}`
          : "",
    }));
  };

  const handleSlugChange = (event) => {
    setSlugEdited(true);

    setNewPage((current) => ({
      ...current,
      slug: event.target.value,
    }));
  };

  const handleCreatePage = async (event) => {
    event.preventDefault();

    const title = newPage.title.trim();
    const slugValue = newPage.slug.trim();

    if (!title || !slugValue) {
      return;
    }

    const normalizedSlug = slugValue.startsWith("/")
      ? slugValue
      : `/${slugValue}`;

    if (
      pages.some(
        (item) =>
          String(item.slug).toLowerCase() ===
          normalizedSlug.toLowerCase()
      )
    ) {
      window.alert("A page with this URL already exists.");
      return;
    }

    const keyBase =
      slugify(normalizedSlug.replace(/^\//, "")) ||
      slugify(title) ||
      "page";

    const page = {
      id: `${keyBase}-${Date.now()}`,
      key: `${keyBase}-${Date.now()}`,
      title,
      slug: normalizedSlug,
      status: newPage.status,
      sections: 0,
      template: newPage.template,
      updatedAt: "Just now",
      updatedAtRaw: new Date().toISOString(),
      inNavigation: false,
      content: {},
      tone: getNextTone(pages.length),
    };

    try {
      const nextPages = [...pages, page];
      const savedPages = await persistPages(nextPages);
      const savedPage =
        savedPages.find((item) => item.key === page.key) ||
        savedPages[savedPages.length - 1];

      closeCreateModal();

      if (savedPage) {
        onEditPage(savedPage);
      }
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to create the page."
      );
    }
  };

  const handleDuplicatePage = async (page) => {
    const suffix = Date.now().toString(36);

    const duplicatedPage = {
      ...page,
      id: `${page.id}-copy-${suffix}`,
      key: `${page.key || page.id}-copy-${suffix}`,
      title: `${page.title} Copy`,
      slug:
        page.slug === "/"
          ? `/home-copy-${suffix}`
          : `${page.slug}-copy-${suffix}`,
      status: "draft",
      updatedAt: "Just now",
      updatedAtRaw: new Date().toISOString(),
      inNavigation: false,
      tone: getNextTone(pages.length),
    };

    try {
      await persistPages([...pages, duplicatedPage]);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to duplicate the page."
      );
    }
  };

  const handleDeletePage = async (page) => {
    if (
      protectedPageIds.includes(page.key || page.id)
    ) {
      window.alert(
        "This is a core website page. It can be unpublished later, but it should not be permanently deleted."
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${page.title}" permanently?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await persistPages(
        pages.filter(
          (item) => item.id !== page.id
        )
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to delete the page."
      );
    }
  };

  return (
    <section className="cms-pages">
      <header className="cms-pages__header">
        <div className="cms-pages__heading">
          <span className="cms-pages__eyebrow">
            Website structure
          </span>

          <h1>Pages</h1>

          <p>
            Create, edit, publish, and manage every
            page of your portfolio from one place.
          </p>
        </div>

        <button
          type="button"
          className="cms-pages__create"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={17} />
          Add new page
        </button>
      </header>

      <section className="cms-pages__summary">
        <article className="cms-pages__summary-intro">
          <span>
            <Sparkles size={16} />
            Content overview
          </span>

          <strong>
            Your portfolio structure is organized and
            ready to manage.
          </strong>

          <p>
            Open the visual builder to update content
            while keeping the current website layout
            protected.
          </p>
        </article>

        <div className="cms-pages__stats">
          <article className="cms-pages__stat-card cms-pages__stat-card--purple">
            <span className="cms-pages__stat-icon">
              <FileText size={19} />
            </span>

            <div>
              <span>Total pages</span>
              <strong>{pages.length}</strong>
              <small>Complete site structure</small>
            </div>
          </article>

          <article className="cms-pages__stat-card cms-pages__stat-card--green">
            <span className="cms-pages__stat-icon">
              <CheckCircle2 size={19} />
            </span>

            <div>
              <span>Published</span>
              <strong>{publishedCount}</strong>
              <small>Currently visible</small>
            </div>
          </article>

          <article className="cms-pages__stat-card cms-pages__stat-card--orange">
            <span className="cms-pages__stat-icon">
              <CircleDashed size={19} />
            </span>

            <div>
              <span>Draft pages</span>
              <strong>{draftCount}</strong>
              <small>Waiting for publishing</small>
            </div>
          </article>
        </div>
      </section>

      <section className="cms-pages__management">
        <header className="cms-pages__management-header">
          <div>
            <h2>Website pages</h2>

            <p>
              {filteredPages.length} of {pages.length}{" "}
              pages shown
            </p>
          </div>

          <div className="cms-pages__toolbar">
            <label className="cms-pages__search">
              <Search size={16} />

              <input
                type="search"
                placeholder="Search by page, URL, or layout..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              aria-label="Filter pages by status"
            >
              <option value="all">
                All statuses
              </option>
              <option value="published">
                Published
              </option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </header>

        <div className="cms-pages__list">
          <div className="cms-pages__list-head">
            <span>Page</span>
            <span>Layout</span>
            <span>Status</span>
            <span>Updated</span>
            <span>Actions</span>
          </div>

          {filteredPages.map((page) => (
            <article
              className="cms-pages__row"
              key={page.id}
            >
              <div
                className="cms-pages__identity"
                data-label="Page"
              >
                <span
                  className={`cms-pages__page-icon is-${page.tone}`}
                >
                  <FileText size={17} />
                </span>

                <div>
                  <strong>{page.title}</strong>

                  <span>
                    <Globe2 size={11} />
                    {page.slug}
                  </span>
                </div>
              </div>

              <div
                className="cms-pages__layout"
                data-label="Layout"
              >
                <strong>{page.template}</strong>
                <span>
                  {page.sections}{" "}
                  {page.sections === 1
                    ? "section"
                    : "sections"}
                </span>
              </div>

              <div
                className="cms-pages__status-wrap"
                data-label="Status"
              >
                <span
                  className={`cms-pages__status cms-pages__status--${page.status}`}
                >
                  <i />
                  {page.status}
                </span>
              </div>

              <span
                className="cms-pages__updated"
                data-label="Updated"
              >
                {page.updatedAt}
              </span>

              <div
                className="cms-pages__actions"
                data-label="Actions"
              >
                <button
                  type="button"
                  className="cms-pages__builder-action"
                  onClick={() => onEditPage(page)}
                  title="Open visual builder"
                  aria-label={`Open ${page.title} visual builder`}
                >
                  <LayoutGrid size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => onEditPage(page)}
                  title="Edit page settings"
                  aria-label={`Edit ${page.title} settings`}
                >
                  <Pencil size={15} />
                </button>

                <a
                  href={page.status === "draft" ? `${page.slug}?cmsPreview=1` : page.slug}
                  target="_blank"
                  rel="noreferrer"
                  title="Preview page"
                  aria-label={`Preview ${page.title}`}
                >
                  <Eye size={15} />
                </a>

                <button
                  type="button"
                  onClick={() =>
                    handleDuplicatePage(page)
                  }
                  title="Duplicate page"
                  aria-label={`Duplicate ${page.title}`}
                >
                  <Copy size={15} />
                </button>

                <button
                  type="button"
                  className="cms-pages__delete"
                  onClick={() =>
                    handleDeletePage(page)
                  }
                  title="Delete page"
                  aria-label={`Delete ${page.title}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}

          {filteredPages.length === 0 && (
            <div className="cms-pages__empty">
              <span>
                <Search size={24} />
              </span>

              <strong>No matching pages</strong>

              <p>
                Change the search or status filter, or
                create a new website page.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>

      {showCreateModal && (
        <div
          className="cms-pages__modal-overlay"
          role="presentation"
          onMouseDown={closeCreateModal}
        >
          <section
            className="cms-pages__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-page-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <header>
              <div className="cms-pages__modal-title">
                <span className="cms-pages__modal-icon">
                  <FilePlus2 size={20} />
                </span>

                <div>
                  <span>Create website page</span>

                  <h2 id="create-page-title">
                    Add a new page
                  </h2>

                  <p>
                    Start with a template and customize
                    it in the visual builder.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="cms-pages__modal-close"
                onClick={closeCreateModal}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handleCreatePage}>
              <div className="cms-pages__form-grid">
                <label className="cms-pages__field cms-pages__field--wide">
                  <span>Page title</span>

                  <input
                    type="text"
                    placeholder="Example: Testimonials"
                    value={newPage.title}
                    onChange={handleTitleChange}
                    autoFocus
                    required
                  />
                </label>

                <label className="cms-pages__field cms-pages__field--wide">
                  <span>URL slug</span>

                  <div className="cms-pages__slug-field">
                    <Globe2 size={15} />

                    <input
                      type="text"
                      placeholder="/testimonials"
                      value={newPage.slug}
                      onChange={handleSlugChange}
                      required
                    />
                  </div>

                  <small>
                    Preview:{" "}
                    {newPage.slug || "/new-page"}
                  </small>
                </label>

                <label className="cms-pages__field">
                  <span>Starting template</span>

                  <select
                    value={newPage.template}
                    onChange={(event) =>
                      setNewPage((current) => ({
                        ...current,
                        template:
                          event.target.value,
                      }))
                    }
                  >
                    <option>Standard Page</option>
                    <option>Blank Page</option>
                    <option>Landing Page</option>
                    <option>Services Page</option>
                    <option>Portfolio Page</option>
                    <option>Contact Page</option>
                  </select>
                </label>

                <label className="cms-pages__field">
                  <span>Initial status</span>

                  <select
                    value={newPage.status}
                    onChange={(event) =>
                      setNewPage((current) => ({
                        ...current,
                        status:
                          event.target.value,
                      }))
                    }
                  >
                    <option value="draft">
                      Draft
                    </option>
                    <option value="published">
                      Published
                    </option>
                  </select>
                </label>
              </div>

              <footer>
                <button
                  type="button"
                  className="cms-pages__cancel"
                  onClick={closeCreateModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="cms-pages__save"
                >
                  <Plus size={16} />
                  Create page
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}