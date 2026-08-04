import { useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleDashed,
  Copy,
  Eye,
  FileText,
  Globe2,
  LayoutGrid,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import "./PagesManager.css";

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
  },
];

const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function PagesManager({ onEditPage = () => {} }) {
  const [pages, setPages] = useState(initialPages);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newPage, setNewPage] = useState({
    title: "",
    slug: "",
    template: "Standard Page",
    status: "draft",
  });

  const filteredPages = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return pages.filter((page) => {
      const matchesSearch =
        !normalizedQuery ||
        page.title.toLowerCase().includes(normalizedQuery) ||
        page.slug.toLowerCase().includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "all" || page.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [pages, searchQuery, statusFilter]);

  const publishedCount = pages.filter(
    (page) => page.status === "published"
  ).length;

  const draftCount = pages.filter(
    (page) => page.status === "draft"
  ).length;

  const handleTitleChange = (event) => {
    const title = event.target.value;

    setNewPage((current) => ({
      ...current,
      title,
      slug: current.slug
        ? current.slug
        : title
          ? `/${slugify(title)}`
          : "",
    }));
  };

  const handleCreatePage = (event) => {
    event.preventDefault();

    const title = newPage.title.trim();
    const slugValue = newPage.slug.trim();

    if (!title || !slugValue) {
      return;
    }

    const normalizedSlug = slugValue.startsWith("/")
      ? slugValue
      : `/${slugValue}`;

    const page = {
      id: `${slugify(title)}-${Date.now()}`,
      title,
      slug: normalizedSlug,
      status: newPage.status,
      sections: 0,
      template: newPage.template,
      updatedAt: "Just now",
      inNavigation: false,
    };

    setPages((current) => [...current, page]);

    setNewPage({
      title: "",
      slug: "",
      template: "Standard Page",
      status: "draft",
    });

    setShowCreateModal(false);
    onEditPage(page);
  };

  const handleDuplicatePage = (page) => {
    const duplicatedPage = {
      ...page,
      id: `${page.id}-copy-${Date.now()}`,
      title: `${page.title} Copy`,
      slug:
        page.slug === "/"
          ? "/home-copy"
          : `${page.slug}-copy`,
      status: "draft",
      updatedAt: "Just now",
      inNavigation: false,
    };

    setPages((current) => [...current, duplicatedPage]);
  };

  const handleDeletePage = (page) => {
    const protectedPages = ["home", "about", "services", "portfolio", "contact"];

    if (protectedPages.includes(page.id)) {
      window.alert(
        "This is a core website page. You can unpublish it later, but it should not be permanently deleted."
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${page.title}" permanently?`
    );

    if (confirmed) {
      setPages((current) =>
        current.filter((item) => item.id !== page.id)
      );
    }
  };

  return (
    <section className="cms-pages">
      <header className="cms-pages__header">
        <div>
          <span className="cms-pages__eyebrow">
            Website structure
          </span>

          <h1>Pages</h1>

          <p>
            Create, edit, publish, and design every website page
            separately.
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

      <div className="cms-pages__stats">
        <article>
          <span className="cms-pages__stat-icon">
            <FileText size={19} />
          </span>

          <div>
            <strong>{pages.length}</strong>
            <span>Total pages</span>
          </div>
        </article>

        <article>
          <span className="cms-pages__stat-icon cms-pages__stat-icon--green">
            <CheckCircle2 size={19} />
          </span>

          <div>
            <strong>{publishedCount}</strong>
            <span>Published</span>
          </div>
        </article>

        <article>
          <span className="cms-pages__stat-icon cms-pages__stat-icon--orange">
            <CircleDashed size={19} />
          </span>

          <div>
            <strong>{draftCount}</strong>
            <span>Draft pages</span>
          </div>
        </article>
      </div>

      <div className="cms-pages__toolbar">
        <div className="cms-pages__search">
          <Search size={17} />

          <input
            type="search"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          aria-label="Filter pages by status"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="cms-pages__list">
        <div className="cms-pages__list-head">
          <span>Page</span>
          <span>Layout</span>
          <span>Status</span>
          <span>Updated</span>
          <span>Actions</span>
        </div>

        {filteredPages.map((page) => (
          <article className="cms-pages__row" key={page.id}>
            <div className="cms-pages__identity">
              <span className="cms-pages__page-icon">
                <FileText size={18} />
              </span>

              <div>
                <strong>{page.title}</strong>

                <span>
                  <Globe2 size={11} />
                  {page.slug}
                </span>
              </div>
            </div>

            <div className="cms-pages__layout">
              <strong>{page.template}</strong>
              <span>{page.sections} sections</span>
            </div>

            <span
              className={`cms-pages__status cms-pages__status--${page.status}`}
            >
              {page.status}
            </span>

            <span className="cms-pages__updated">
              {page.updatedAt}
            </span>

            <div className="cms-pages__actions">
              <button
                type="button"
                onClick={() => onEditPage(page)}
                title="Edit page layout"
              >
                <LayoutGrid size={16} />
              </button>

              <button
                type="button"
                onClick={() => onEditPage(page)}
                title="Edit page settings"
              >
                <Pencil size={16} />
              </button>

              <a
                href={page.slug}
                target="_blank"
                rel="noreferrer"
                title="Preview page"
              >
                <Eye size={16} />
              </a>

              <button
                type="button"
                onClick={() => handleDuplicatePage(page)}
                title="Duplicate page"
              >
                <Copy size={16} />
              </button>

              <button
                type="button"
                className="cms-pages__delete"
                onClick={() => handleDeletePage(page)}
                title="Delete page"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}

        {filteredPages.length === 0 && (
          <div className="cms-pages__empty">
            <FileText size={28} />

            <strong>No pages found</strong>

            <span>
              Change your search or create a new website page.
            </span>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div
          className="cms-pages__modal-overlay"
          role="presentation"
          onMouseDown={() => setShowCreateModal(false)}
        >
          <section
            className="cms-pages__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-page-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span>Create website page</span>
                <h2 id="create-page-title">Add a new page</h2>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </header>

            <form onSubmit={handleCreatePage}>
              <label>
                Page title
                <input
                  type="text"
                  placeholder="Example: Testimonials"
                  value={newPage.title}
                  onChange={handleTitleChange}
                  autoFocus
                />
              </label>

              <label>
                URL slug
                <input
                  type="text"
                  placeholder="/testimonials"
                  value={newPage.slug}
                  onChange={(event) =>
                    setNewPage((current) => ({
                      ...current,
                      slug: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                Starting template
                <select
                  value={newPage.template}
                  onChange={(event) =>
                    setNewPage((current) => ({
                      ...current,
                      template: event.target.value,
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

              <label>
                Initial status
                <select
                  value={newPage.status}
                  onChange={(event) =>
                    setNewPage((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>

              <footer>
                <button
                  type="button"
                  className="cms-pages__cancel"
                  onClick={() => setShowCreateModal(false)}
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