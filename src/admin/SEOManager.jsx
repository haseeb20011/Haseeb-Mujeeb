import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileSearch,
  Globe2,
  Image as ImageIcon,
  Link2,
  Monitor,
  RefreshCcw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
} from "lucide-react";

import "./SEOManager.css";

const STORAGE_KEY = "portfolio-cms-seo";

const DEFAULT_SEO = {
  settings: {
    siteName: "Haseeb.dev",
    titleSeparator: "—",
    defaultSocialImage: "",
    sitemapEnabled: true,
    robotsIndex: true,
    trailingSlash: false,
  },
  pages: [
    {
      id: "home",
      name: "Home",
      path: "/",
      title:
        "Haseeb Mujeeb — WordPress, Shopify & React Developer",
      description:
        "Professional WordPress, Shopify, and React development focused on responsive websites, polished implementation, and reliable delivery.",
      focusKeyword: "web developer",
      canonical: "http://localhost:5174/",
      index: true,
      follow: true,
      ogTitle:
        "Haseeb Mujeeb — Professional Web Developer",
      ogDescription:
        "Explore selected WordPress, Shopify, and React projects built with clean implementation and responsive performance.",
      ogImage: "",
      twitterCard: "summary_large_image",
      updatedAt: "Today",
    },
    {
      id: "about",
      name: "About",
      path: "/about",
      title:
        "About Haseeb Mujeeb — Web Developer",
      description:
        "Learn about Haseeb Mujeeb, a web developer building polished WordPress, Shopify, and React websites for businesses and agencies.",
      focusKeyword: "about Haseeb Mujeeb",
      canonical: "http://localhost:5174/about",
      index: true,
      follow: true,
      ogTitle:
        "About Haseeb Mujeeb",
      ogDescription:
        "Experience, technical capabilities, and the development approach behind Haseeb.dev.",
      ogImage: "",
      twitterCard: "summary_large_image",
      updatedAt: "Yesterday",
    },
    {
      id: "services",
      name: "Services",
      path: "/services",
      title:
        "Web Development Services — Haseeb.dev",
      description:
        "WordPress development, Shopify stores, website builders, custom theme work, React interfaces, and responsive optimization services.",
      focusKeyword: "web development services",
      canonical:
        "http://localhost:5174/services",
      index: true,
      follow: true,
      ogTitle:
        "Professional Web Development Services",
      ogDescription:
        "Explore WordPress, Shopify, website builder, React, and responsive development services.",
      ogImage: "",
      twitterCard: "summary_large_image",
      updatedAt: "3 days ago",
    },
    {
      id: "projects",
      name: "Projects",
      path: "/projects",
      title:
        "Web Development Projects — Haseeb.dev",
      description:
        "View selected WordPress, Shopify, React, publishing, agency, and business website projects developed by Haseeb Mujeeb.",
      focusKeyword: "web development projects",
      canonical:
        "http://localhost:5174/projects",
      index: true,
      follow: true,
      ogTitle:
        "Selected Website Projects",
      ogDescription:
        "A portfolio of real client websites built around practical business goals and polished implementation.",
      ogImage: "",
      twitterCard: "summary_large_image",
      updatedAt: "5 days ago",
    },
    {
      id: "contact",
      name: "Contact",
      path: "/contact",
      title:
        "Contact Haseeb Mujeeb — Start a Project",
      description:
        "Contact Haseeb Mujeeb to discuss a WordPress, Shopify, React, website redesign, optimization, or custom development project.",
      focusKeyword: "contact web developer",
      canonical:
        "http://localhost:5174/contact",
      index: true,
      follow: true,
      ogTitle:
        "Start a Website Project with Haseeb",
      ogDescription:
        "Share your project details and receive a clear response about scope, timeline, and next steps.",
      ogImage: "",
      twitterCard: "summary_large_image",
      updatedAt: "1 week ago",
    },
  ],
};

const cloneDefaults = () =>
  JSON.parse(JSON.stringify(DEFAULT_SEO));

const loadSeo = () => {
  try {
    const stored = window.localStorage.getItem(
      STORAGE_KEY
    );

    if (!stored) {
      return cloneDefaults();
    }

    const parsed = JSON.parse(stored);

    if (
      !parsed ||
      !Array.isArray(parsed.pages) ||
      !parsed.settings
    ) {
      return cloneDefaults();
    }

    return parsed;
  } catch {
    return cloneDefaults();
  }
};

const saveSeo = (seoData) => {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(seoData)
  );

  window.dispatchEvent(
    new CustomEvent("portfolio-seo-updated", {
      detail: seoData,
    })
  );
};

const calculateScore = (page) => {
  let score = 0;

  const titleLength = page.title.trim().length;
  const descriptionLength =
    page.description.trim().length;
  const keyword =
    page.focusKeyword.trim().toLowerCase();

  if (titleLength >= 30 && titleLength <= 60) {
    score += 20;
  } else if (titleLength >= 20) {
    score += 10;
  }

  if (
    descriptionLength >= 120 &&
    descriptionLength <= 160
  ) {
    score += 25;
  } else if (descriptionLength >= 80) {
    score += 12;
  }

  if (page.canonical.trim()) {
    score += 15;
  }

  if (
    keyword &&
    `${page.title} ${page.description}`
      .toLowerCase()
      .includes(keyword)
  ) {
    score += 15;
  }

  if (page.index && page.follow) {
    score += 10;
  }

  if (
    page.ogTitle.trim() &&
    page.ogDescription.trim()
  ) {
    score += 15;
  }

  return Math.min(score, 100);
};

const getScoreTone = (score) => {
  if (score >= 80) {
    return "good";
  }

  if (score >= 55) {
    return "warning";
  }

  return "danger";
};

export default function SEOManager() {
  const [seoData, setSeoData] = useState(loadSeo);
  const [activePageId, setActivePageId] =
    useState("home");
  const [query, setQuery] = useState("");
  const [previewMode, setPreviewMode] =
    useState("desktop");
  const [activePreview, setActivePreview] =
    useState("google");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    saveSeo(seoData);
  }, [seoData]);

  const activePage =
    seoData.pages.find(
      (page) => page.id === activePageId
    ) || seoData.pages[0];

  const filteredPages = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return seoData.pages;
    }

    return seoData.pages.filter((page) =>
      [page.name, page.path, page.title]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [seoData.pages, query]);

  const pageScores = useMemo(
    () =>
      seoData.pages.map((page) => ({
        id: page.id,
        score: calculateScore(page),
      })),
    [seoData.pages]
  );

  const optimizedCount = pageScores.filter(
    (item) => item.score >= 80
  ).length;

  const needsWorkCount = pageScores.filter(
    (item) => item.score < 80
  ).length;

  const indexedCount = seoData.pages.filter(
    (page) => page.index
  ).length;

  const activeScore = calculateScore(activePage);
  const scoreTone = getScoreTone(activeScore);

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice("");
    }, 2400);
  };

  const updateActivePage = (updates) => {
    setSeoData((current) => ({
      ...current,
      pages: current.pages.map((page) =>
        page.id === activePage.id
          ? {
              ...page,
              ...updates,
              updatedAt: "Just now",
            }
          : page
      ),
    }));
  };

  const updateSettings = (updates) => {
    setSeoData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        ...updates,
      },
    }));
  };

  const handleSave = () => {
    saveSeo(seoData);
    showNotice("SEO settings saved.");
  };

  const resetCurrentPage = () => {
    const defaultPage =
      DEFAULT_SEO.pages.find(
        (page) => page.id === activePage.id
      );

    if (!defaultPage) {
      return;
    }

    const confirmed = window.confirm(
      `Reset SEO settings for ${activePage.name}?`
    );

    if (!confirmed) {
      return;
    }

    setSeoData((current) => ({
      ...current,
      pages: current.pages.map((page) =>
        page.id === activePage.id
          ? {
              ...defaultPage,
            }
          : page
      ),
    }));

    showNotice(
      `${activePage.name} SEO restored to defaults.`
    );
  };

  const resetAllSeo = () => {
    const confirmed = window.confirm(
      "Reset all page SEO and technical settings to the original defaults?"
    );

    if (!confirmed) {
      return;
    }

    setSeoData(cloneDefaults());
    setActivePageId("home");
    showNotice("All SEO settings restored.");
  };

  const auditItems = [
    {
      label: "SEO title",
      complete:
        activePage.title.trim().length >= 30 &&
        activePage.title.trim().length <= 60,
      detail: `${activePage.title.trim().length}/60 characters`,
    },
    {
      label: "Meta description",
      complete:
        activePage.description.trim().length >=
          120 &&
        activePage.description.trim().length <=
          160,
      detail: `${activePage.description.trim().length}/160 characters`,
    },
    {
      label: "Focus keyword",
      complete:
        Boolean(activePage.focusKeyword.trim()) &&
        `${activePage.title} ${activePage.description}`
          .toLowerCase()
          .includes(
            activePage.focusKeyword
              .trim()
              .toLowerCase()
          ),
      detail: activePage.focusKeyword
        ? "Used in page metadata"
        : "Keyword not added",
    },
    {
      label: "Canonical URL",
      complete: Boolean(
        activePage.canonical.trim()
      ),
      detail: activePage.canonical
        ? "Canonical is configured"
        : "Canonical is missing",
    },
    {
      label: "Social metadata",
      complete:
        Boolean(activePage.ogTitle.trim()) &&
        Boolean(
          activePage.ogDescription.trim()
        ),
      detail: "Open Graph title and description",
    },
    {
      label: "Search visibility",
      complete:
        activePage.index && activePage.follow,
      detail:
        activePage.index && activePage.follow
          ? "Index and follow enabled"
          : "Search visibility restricted",
    },
  ];

  return (
    <section className="cms-seo">
      <header className="cms-seo__header">
        <div>
          <span className="cms-seo__eyebrow">
            Search visibility
          </span>

          <h1>SEO</h1>

          <p>
            Manage page titles, descriptions,
            indexing, social previews, and technical
            search settings.
          </p>
        </div>

        <div className="cms-seo__header-actions">
          <button
            type="button"
            className="cms-seo__reset"
            onClick={resetAllSeo}
          >
            <RefreshCcw size={15} />
            Reset all
          </button>

          <button
            type="button"
            className="cms-seo__save"
            onClick={handleSave}
          >
            <Save size={16} />
            Save SEO changes
          </button>
        </div>
      </header>

      {notice && (
        <div className="cms-seo__notice">
          <Check size={15} />
          {notice}
        </div>
      )}

      <section className="cms-seo__summary">
        <article className="cms-seo__summary-intro">
          <span>
            <Sparkles size={16} />
            SEO control centre
          </span>

          <strong>
            Improve how every portfolio page appears
            in search results and social sharing.
          </strong>

          <p>
            The module stores SEO settings locally
            during development. Public metadata will
            connect when MongoDB publishing is added.
          </p>
        </article>

        <SeoStat
          label="Optimized"
          value={optimizedCount}
          detail="Pages scoring 80+"
          icon={CheckCircle2}
          tone="green"
        />

        <SeoStat
          label="Needs work"
          value={needsWorkCount}
          detail="Pages below 80"
          icon={FileSearch}
          tone="orange"
        />

        <SeoStat
          label="Indexed"
          value={indexedCount}
          detail="Visible to search engines"
          icon={Globe2}
          tone="blue"
        />

        <SeoStat
          label="Sitemap"
          value={
            seoData.settings.sitemapEnabled
              ? "On"
              : "Off"
          }
          detail="XML sitemap setting"
          icon={ShieldCheck}
          tone="purple"
        />
      </section>

      <section className="cms-seo__workspace">
        <aside className="cms-seo__pages">
          <div className="cms-seo__pages-heading">
            <span>
              <FileSearch size={16} />
            </span>

            <div>
              <strong>Website pages</strong>
              <small>
                {seoData.pages.length} SEO records
              </small>
            </div>
          </div>

          <label className="cms-seo__page-search">
            <Search size={14} />

            <input
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search pages..."
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </label>

          <nav>
            {filteredPages.map((page) => {
              const score = calculateScore(page);
              const tone = getScoreTone(score);

              return (
                <button
                  type="button"
                  key={page.id}
                  className={
                    activePage.id === page.id
                      ? "is-active"
                      : ""
                  }
                  onClick={() =>
                    setActivePageId(page.id)
                  }
                >
                  <span>
                    <strong>{page.name}</strong>
                    <small>{page.path}</small>
                  </span>

                  <i className={`is-${tone}`}>
                    {score}
                  </i>

                  <ChevronRight size={14} />
                </button>
              );
            })}
          </nav>

          <div className="cms-seo__technical-note">
            <Settings2 size={16} />

            <div>
              <strong>Technical controls</strong>

              <span>
                Configure sitemap, robots, canonical,
                and social defaults below.
              </span>
            </div>
          </div>
        </aside>

        <div className="cms-seo__editor">
          <header className="cms-seo__editor-header">
            <div>
              <span>{activePage.path}</span>
              <h2>{activePage.name} SEO</h2>
              <p>
                Last updated {activePage.updatedAt}
              </p>
            </div>

            <button
              type="button"
              onClick={resetCurrentPage}
            >
              <RefreshCcw size={14} />
              Reset page
            </button>
          </header>

          <div className="cms-seo__editor-body">
            <section className="cms-seo__form-section">
              <header>
                <div>
                  <span>
                    <Search size={15} />
                  </span>

                  <div>
                    <strong>
                      Search appearance
                    </strong>

                    <small>
                      Title, description, keyword, and
                      canonical URL
                    </small>
                  </div>
                </div>
              </header>

              <div className="cms-seo__fields">
                <label className="cms-seo__field cms-seo__field--wide">
                  <span>
                    <strong>SEO title</strong>
                    <small>
                      {activePage.title.length}/60
                    </small>
                  </span>

                  <input
                    type="text"
                    value={activePage.title}
                    onChange={(event) =>
                      updateActivePage({
                        title: event.target.value,
                      })
                    }
                    maxLength={80}
                  />
                </label>

                <label className="cms-seo__field cms-seo__field--wide">
                  <span>
                    <strong>
                      Meta description
                    </strong>
                    <small>
                      {
                        activePage.description.length
                      }
                      /160
                    </small>
                  </span>

                  <textarea
                    rows={4}
                    value={activePage.description}
                    onChange={(event) =>
                      updateActivePage({
                        description:
                          event.target.value,
                      })
                    }
                    maxLength={220}
                  />
                </label>

                <label className="cms-seo__field">
                  <span>
                    <strong>
                      Focus keyword
                    </strong>
                  </span>

                  <input
                    type="text"
                    value={
                      activePage.focusKeyword
                    }
                    onChange={(event) =>
                      updateActivePage({
                        focusKeyword:
                          event.target.value,
                      })
                    }
                    placeholder="Example: web developer"
                  />
                </label>

                <label className="cms-seo__field">
                  <span>
                    <strong>
                      Canonical URL
                    </strong>
                  </span>

                  <input
                    type="url"
                    value={activePage.canonical}
                    onChange={(event) =>
                      updateActivePage({
                        canonical:
                          event.target.value,
                      })
                    }
                    placeholder="https://example.com/page"
                  />
                </label>
              </div>
            </section>

            <section className="cms-seo__form-section">
              <header>
                <div>
                  <span>
                    <Globe2 size={15} />
                  </span>

                  <div>
                    <strong>
                      Search engine controls
                    </strong>

                    <small>
                      Control whether search engines
                      index and follow this page
                    </small>
                  </div>
                </div>
              </header>

              <div className="cms-seo__toggle-grid">
                <ToggleField
                  title="Index this page"
                  description="Allow the page to appear in search results."
                  checked={activePage.index}
                  onChange={(checked) =>
                    updateActivePage({
                      index: checked,
                    })
                  }
                />

                <ToggleField
                  title="Follow page links"
                  description="Allow search engines to follow links on this page."
                  checked={activePage.follow}
                  onChange={(checked) =>
                    updateActivePage({
                      follow: checked,
                    })
                  }
                />
              </div>
            </section>

            <section className="cms-seo__form-section">
              <header>
                <div>
                  <span>
                    <ImageIcon size={15} />
                  </span>

                  <div>
                    <strong>
                      Social sharing
                    </strong>

                    <small>
                      Open Graph and Twitter card
                      metadata
                    </small>
                  </div>
                </div>
              </header>

              <div className="cms-seo__fields">
                <label className="cms-seo__field cms-seo__field--wide">
                  <span>
                    <strong>
                      Social title
                    </strong>
                  </span>

                  <input
                    type="text"
                    value={activePage.ogTitle}
                    onChange={(event) =>
                      updateActivePage({
                        ogTitle:
                          event.target.value,
                      })
                    }
                  />
                </label>

                <label className="cms-seo__field cms-seo__field--wide">
                  <span>
                    <strong>
                      Social description
                    </strong>
                  </span>

                  <textarea
                    rows={3}
                    value={
                      activePage.ogDescription
                    }
                    onChange={(event) =>
                      updateActivePage({
                        ogDescription:
                          event.target.value,
                      })
                    }
                  />
                </label>

                <label className="cms-seo__field">
                  <span>
                    <strong>
                      Social image URL
                    </strong>
                  </span>

                  <input
                    type="text"
                    value={activePage.ogImage}
                    onChange={(event) =>
                      updateActivePage({
                        ogImage:
                          event.target.value,
                      })
                    }
                    placeholder="Paste media URL"
                  />
                </label>

                <label className="cms-seo__field">
                  <span>
                    <strong>
                      Twitter card
                    </strong>
                  </span>

                  <select
                    value={
                      activePage.twitterCard
                    }
                    onChange={(event) =>
                      updateActivePage({
                        twitterCard:
                          event.target.value,
                      })
                    }
                  >
                    <option value="summary_large_image">
                      Large image
                    </option>
                    <option value="summary">
                      Summary
                    </option>
                  </select>
                </label>
              </div>
            </section>

            <section className="cms-seo__form-section">
              <header>
                <div>
                  <span>
                    <Settings2 size={15} />
                  </span>

                  <div>
                    <strong>
                      Technical defaults
                    </strong>

                    <small>
                      Site-wide SEO configuration
                    </small>
                  </div>
                </div>
              </header>

              <div className="cms-seo__fields">
                <label className="cms-seo__field">
                  <span>
                    <strong>Site name</strong>
                  </span>

                  <input
                    type="text"
                    value={
                      seoData.settings.siteName
                    }
                    onChange={(event) =>
                      updateSettings({
                        siteName:
                          event.target.value,
                      })
                    }
                  />
                </label>

                <label className="cms-seo__field">
                  <span>
                    <strong>
                      Title separator
                    </strong>
                  </span>

                  <select
                    value={
                      seoData.settings
                        .titleSeparator
                    }
                    onChange={(event) =>
                      updateSettings({
                        titleSeparator:
                          event.target.value,
                      })
                    }
                  >
                    <option value="—">—</option>
                    <option value="|">|</option>
                    <option value="-">-</option>
                    <option value="•">•</option>
                  </select>
                </label>

                <label className="cms-seo__field cms-seo__field--wide">
                  <span>
                    <strong>
                      Default social image
                    </strong>
                  </span>

                  <input
                    type="text"
                    value={
                      seoData.settings
                        .defaultSocialImage
                    }
                    onChange={(event) =>
                      updateSettings({
                        defaultSocialImage:
                          event.target.value,
                      })
                    }
                    placeholder="Used when a page has no social image"
                  />
                </label>
              </div>

              <div className="cms-seo__toggle-grid">
                <ToggleField
                  title="Enable XML sitemap"
                  description="Generate a sitemap for all published pages."
                  checked={
                    seoData.settings
                      .sitemapEnabled
                  }
                  onChange={(checked) =>
                    updateSettings({
                      sitemapEnabled: checked,
                    })
                  }
                />

                <ToggleField
                  title="Allow site indexing"
                  description="Permit search engines to index the website."
                  checked={
                    seoData.settings.robotsIndex
                  }
                  onChange={(checked) =>
                    updateSettings({
                      robotsIndex: checked,
                    })
                  }
                />

                <ToggleField
                  title="Use trailing slashes"
                  description="Add a slash to the end of public page URLs."
                  checked={
                    seoData.settings.trailingSlash
                  }
                  onChange={(checked) =>
                    updateSettings({
                      trailingSlash: checked,
                    })
                  }
                />
              </div>
            </section>
          </div>
        </div>

        <aside className="cms-seo__preview">
          <header>
            <div>
              <span>SEO score</span>
              <h2>{activePage.name}</h2>
            </div>

            <div
              className={`cms-seo__score is-${scoreTone}`}
            >
              <strong>{activeScore}</strong>
              <span>/100</span>
            </div>
          </header>

          <div className="cms-seo__preview-tabs">
            <button
              type="button"
              className={
                activePreview === "google"
                  ? "is-active"
                  : ""
              }
              onClick={() =>
                setActivePreview("google")
              }
            >
              Google
            </button>

            <button
              type="button"
              className={
                activePreview === "social"
                  ? "is-active"
                  : ""
              }
              onClick={() =>
                setActivePreview("social")
              }
            >
              Social
            </button>

            <div>
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
                <Monitor size={14} />
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
                <Smartphone size={14} />
              </button>
            </div>
          </div>

          <div
            className={`cms-seo__preview-frame is-${previewMode}`}
          >
            {activePreview === "google" ? (
              <GooglePreview page={activePage} />
            ) : (
              <SocialPreview
                page={activePage}
                siteName={
                  seoData.settings.siteName
                }
                defaultImage={
                  seoData.settings
                    .defaultSocialImage
                }
              />
            )}
          </div>

          <section className="cms-seo__audit">
            <header>
              <div>
                <span>Page audit</span>
                <strong>
                  {auditItems.filter(
                    (item) => item.complete
                  ).length}
                  /{auditItems.length} checks passed
                </strong>
              </div>

              <Eye size={15} />
            </header>

            <div>
              {auditItems.map((item) => (
                <article key={item.label}>
                  <span
                    className={
                      item.complete
                        ? "is-complete"
                        : "is-incomplete"
                    }
                  >
                    {item.complete ? (
                      <Check size={12} />
                    ) : (
                      <X size={12} />
                    )}
                  </span>

                  <div>
                    <strong>{item.label}</strong>
                    <small>{item.detail}</small>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="cms-seo__robots-preview">
            <header>
              <span>Robots preview</span>
              <strong>robots.txt</strong>
            </header>

            <pre>{`User-agent: *
${
  seoData.settings.robotsIndex
    ? "Allow: /"
    : "Disallow: /"
}
${
  seoData.settings.sitemapEnabled
    ? "Sitemap: /sitemap.xml"
    : "# Sitemap disabled"
}`}</pre>
          </section>
        </aside>
      </section>
    </section>
  );
}

function SeoStat({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}) {
  return (
    <article
      className={`cms-seo__stat is-${tone}`}
    >
      <span>
        <Icon size={19} />
      </span>

      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <p>{detail}</p>
      </div>
    </article>
  );
}

function ToggleField({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <label className="cms-seo__toggle-field">
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
      />
    </label>
  );
}

function GooglePreview({ page }) {
  return (
    <div className="cms-seo-google-preview">
      <div className="cms-seo-google-preview__site">
        <span>H</span>

        <div>
          <strong>Haseeb.dev</strong>
          <small>
            {page.canonical || page.path}
          </small>
        </div>
      </div>

      <h3>
        {page.title ||
          "Add an SEO title for this page"}
      </h3>

      <p>
        {page.description ||
          "Add a meta description to preview how this page may appear in search results."}
      </p>
    </div>
  );
}

function SocialPreview({
  page,
  siteName,
  defaultImage,
}) {
  const image =
    page.ogImage || defaultImage;

  return (
    <div className="cms-seo-social-preview">
      <div className="cms-seo-social-preview__image">
        {image ? (
          <img
            src={image}
            alt=""
          />
        ) : (
          <div>
            <ImageIcon size={27} />
            <span>Social image</span>
          </div>
        )}
      </div>

      <div className="cms-seo-social-preview__copy">
        <span>{siteName}</span>

        <strong>
          {page.ogTitle ||
            page.title ||
            "Social title"}
        </strong>

        <p>
          {page.ogDescription ||
            page.description ||
            "Social sharing description"}
        </p>
      </div>
    </div>
  );
}