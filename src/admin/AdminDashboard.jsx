import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Eye,
  FilePlus2,
  FileText,
  FolderKanban,
  FolderPlus,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Palette,
  Search,
  Settings,
  Sparkles,
  UploadCloud,
  Wrench,
} from "lucide-react";

import "./AdminDashboard.css";
import PagesManager from "./PagesManager.jsx";
import SiteStylesManager from "./SiteStylesManager.jsx";
import PageBuilder from "./PageBuilder.jsx";
import ProjectsManager from "./ProjectsManager.jsx";
import MessagesManager from "./MessagesManager.jsx";
import MediaLibraryManager from "./MediaLibraryManager.jsx";
import NavigationManager from "./NavigationManager.jsx";
import SEOManager from "./SEOManager.jsx";
import SettingsManager from "./SettingsManager.jsx";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "" : "http://localhost:5000");

const navigationItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Pages",
    icon: FileText,
  },
  {
    label: "Site Styles",
    icon: Palette,
  },
  {
    label: "Projects",
    icon: FolderKanban,
  },
  {
    label: "Messages",
    icon: MessageSquare,
    badge: "3",
  },
  {
    label: "Media Library",
    icon: Image,
  },
  {
    label: "Navigation",
    icon: Menu,
  },
  {
    label: "SEO",
    icon: Search,
  },
  {
    label: "Settings",
    icon: Settings,
  },
];

const quickActions = [
  {
    title: "New Page",
    icon: FilePlus2,
    section: "Pages",
    tone: "purple",
  },
  {
    title: "New Project",
    icon: FolderPlus,
    section: "Projects",
    tone: "violet",
  },
  {
    title: "Upload Media",
    icon: UploadCloud,
    section: "Media Library",
    tone: "green",
  },
  {
    title: "Site Settings",
    icon: Settings,
    section: "Settings",
    tone: "blue",
  },
];

const statistics = [
  {
    label: "Pages",
    value: "5",
    change: "All active",
    icon: FileText,
    tone: "purple",
  },
  {
    label: "Projects",
    value: "7",
    change: "+2 this month",
    icon: FolderKanban,
    tone: "green",
  },
  {
    label: "Messages",
    value: "3",
    change: "3 unread",
    icon: MessageSquare,
    tone: "orange",
  },
  {
    label: "Total Views",
    value: "—",
    change: "Analytics not connected",
    icon: Eye,
    tone: "blue",
  },
];

const performanceMetrics = [
  {
    label: "Views",
    value: "—",
    change: "Not connected",
    tone: "purple",
  },
  {
    label: "Visitors",
    value: "—",
    change: "Not connected",
    tone: "green",
  },
  {
    label: "Avg. Time",
    value: "—",
    change: "Not connected",
    tone: "blue",
  },
  {
    label: "Bounce Rate",
    value: "—",
    change: "Not connected",
    tone: "orange",
  },
];

const recentActivity = [
  {
    title: "About page updated",
    detail: "Edited content and sections",
    time: "CMS page",
    type: "page",
    status: "green",
  },
  {
    title: "New project added",
    detail: "Go Studio",
    time: "CMS page",
    type: "project",
    status: "green",
  },
  {
    title: "Message from Sarah J.",
    detail: "Project inquiry",
    time: "Yesterday, 2:15 PM",
    type: "message",
    status: "orange",
  },
  {
    title: "Services page updated",
    detail: "Updated service descriptions",
    time: "CMS page",
    type: "page",
    status: "green",
  },
  {
    title: "New media uploaded",
    detail: "portfolio-preview.png",
    time: "May 18, 2026",
    type: "media",
    status: "green",
  },
];

const recentPages = [
  {
    title: "Home",
    type: "Landing Page",
    status: "Published",
    time: "Today, 10:45 AM",
  },
  {
    title: "About",
    type: "Standard Page",
    status: "Published",
    time: "Yesterday, 4:22 PM",
  },
  {
    title: "Services",
    type: "Services Page",
    status: "Published",
    time: "May 18, 2026",
  },
];

const recentProjects = [
  {
    initials: "GO",
    title: "Go Studio",
    category: "Agency · Branding",
    status: "Published",
    time: "May 18, 2026",
    tone: "amber",
  },
  {
    initials: "DF",
    title: "DGT Forge",
    category: "Agency · Digital Services",
    status: "Published",
    time: "May 15, 2026",
    tone: "red",
  },
  {
    initials: "TK",
    title: "Teknotek",
    category: "B2B · Technology",
    status: "Published",
    time: "May 18, 2026",
    tone: "blue",
  },
];

const recentMessages = [
  {
    initials: "SJ",
    name: "Sarah Johnson",
    subject: "Project Inquiry",
    time: "10:30 AM",
    tone: "green",
  },
  {
    initials: "MC",
    name: "Michael Chen",
    subject: "Collaboration",
    time: "Yesterday",
    tone: "orange",
  },
  {
    initials: "DW",
    name: "David Wilson",
    subject: "General Question",
    time: "May 18, 2026",
    tone: "yellow",
  },
];

function BrandMark() {
  return (
    <span className="cms-brand-mark" aria-hidden="true">
      <span />
    </span>
  );
}

function PerformanceChart() {
  return (
    <div
      className="cms-performance-chart"
      aria-label="Analytics is not connected"
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "230px",
        padding: "28px",
        textAlign: "center",
      }}
    >
      <div>
        <BarChart3 size={30} />
        <strong
          style={{
            display: "block",
            marginTop: "12px",
          }}
        >
          Analytics is not connected yet
        </strong>
        <p
          style={{
            margin: "8px auto 0",
            maxWidth: "360px",
          }}
        >
          No fabricated traffic numbers are shown. A real
          analytics source can be connected in the next
          phase.
        </p>
      </div>
    </div>
  );
}

function ActivityIcon({ type }) {
  if (type === "project") {
    return <FolderKanban size={15} />;
  }

  if (type === "message") {
    return <MessageSquare size={15} />;
  }

  if (type === "media") {
    return <Image size={15} />;
  }

  return <FileText size={15} />;
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] =
    useState("Dashboard");
  const [selectedPage, setSelectedPage] = useState(null);
  const [projectCount, setProjectCount] = useState(0);
  const [messageSummary, setMessageSummary] = useState({
    count: 0,
    unreadCount: 0,
  });
  const [liveRecentProjects, setLiveRecentProjects] =
    useState([]);
  const [liveRecentMessages, setLiveRecentMessages] =
    useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [liveRecentPages, setLiveRecentPages] = useState([]);
  const [recentActivityItems, setRecentActivityItems] =
    useState([]);

  const [admin, setAdmin] = useState({
    name: "Administrator",
    email: "Loading account...",
  });

  useEffect(() => {
    let isMounted = true;

    const loadAdmin = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          navigate("/admin/login", {
            replace: true,
          });

          return;
        }

        const data = await response.json();

        if (isMounted && data.admin) {
          setAdmin({
            name: data.admin.name,
            email: data.admin.email,
          });
        }
      } catch {
        if (isMounted) {
          navigate("/admin/login", {
            replace: true,
          });
        }
      }
    };

    loadAdmin();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    let isActive = true;

    const formatDashboardTime = (value) => {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "Recently";
      }

      const now = new Date();
      const sameDay =
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate();

      if (sameDay) {
        return new Intl.DateTimeFormat(undefined, {
          hour: "numeric",
          minute: "2-digit",
        }).format(date);
      }

      return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
      }).format(date);
    };

    const makeInitials = (value = "") =>
      String(value)
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "NA";

    const messageTones = [
      "green",
      "orange",
      "yellow",
      "purple",
      "blue",
    ];

    const getMessageTone = (name = "") => {
      const score = String(name)
        .split("")
        .reduce(
          (total, character) =>
            total + character.charCodeAt(0),
          0
        );

      return messageTones[
        score % messageTones.length
      ];
    };

    const loadDashboardData = async () => {
      try {
        const [
          projectsResponse,
          messagesResponse,
          siteConfigResponse,
          activityResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/api/projects`, {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
          }),
          fetch(`${API_URL}/api/messages?limit=3`, {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
          }),
          fetch(`${API_URL}/api/site-config`, {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
          }),
          fetch(`${API_URL}/api/activity?limit=5`, {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
          }),
        ]);

        if (
          projectsResponse.status === 401 ||
          messagesResponse.status === 401 ||
          siteConfigResponse.status === 401 ||
          activityResponse.status === 401
        ) {
          navigate("/admin/login", {
            replace: true,
          });
          return;
        }

        const [
          projectsData,
          messagesData,
          siteConfigData,
          activityData,
        ] = await Promise.all([
          projectsResponse.json().catch(() => ({})),
          messagesResponse.json().catch(() => ({})),
          siteConfigResponse.json().catch(() => ({})),
          activityResponse.json().catch(() => ({})),
        ]);

        if (!isActive) {
          return;
        }

        if (
          projectsResponse.ok &&
          Array.isArray(projectsData.projects)
        ) {
          setProjectCount(projectsData.projects.length);
          setLiveRecentProjects(
            projectsData.projects.slice(0, 3).map(
              (project) => ({
                id: project.id,
                initials:
                  project.code ||
                  makeInitials(project.title),
                title: project.title,
                category:
                  project.projectType ||
                  project.category ||
                  "Website",
                status:
                  project.status === "published"
                    ? "Published"
                    : "Draft",
                time: formatDashboardTime(
                  project.updatedAt || project.createdAt
                ),
                timestamp: new Date(
                  project.updatedAt || project.createdAt
                ).getTime(),
                tone: project.tone || "purple",
              })
            )
          );
        }

        if (
          messagesResponse.ok &&
          Array.isArray(messagesData.messages)
        ) {
          const counts =
            messagesData.counts ||
            messagesData.stats ||
            {};

          setMessageSummary({
            count:
              Number.isFinite(counts.inbox)
                ? counts.inbox
                : messagesData.messages.filter(
                    (message) => !message.archived
                  ).length,
            unreadCount:
              Number.isFinite(counts.unread)
                ? counts.unread
                : messagesData.messages.filter(
                    (message) =>
                      !message.archived &&
                      message.unread
                  ).length,
          });

          setLiveRecentMessages(
            messagesData.messages.map((message) => ({
              id: message.id,
              initials: makeInitials(message.name),
              name: message.name,
              subject:
                message.subject ||
                "Portfolio website enquiry",
              time: formatDashboardTime(
                message.createdAt
              ),
              timestamp: new Date(
                message.createdAt
              ).getTime(),
              tone: getMessageTone(message.name),
              unread: Boolean(message.unread),
            }))
          );
        }

        if (siteConfigResponse.ok) {
          const config =
            siteConfigData.config || siteConfigData;
          const pages = Array.isArray(config?.pages)
            ? config.pages
            : [];

          setPageCount(pages.length);

          setLiveRecentPages(
            [...pages]
              .sort(
                (a, b) =>
                  new Date(b.updatedAt || 0).getTime() -
                  new Date(a.updatedAt || 0).getTime()
              )
              .slice(0, 3)
              .map((page) => ({
                id: page.key || page.id || page.slug,
                title: page.title || "Untitled page",
                type: page.template || "Standard Page",
                status:
                  page.status === "published"
                    ? "Published"
                    : "Draft",
                time: formatDashboardTime(page.updatedAt),
              }))
          );
        }

        if (
          activityResponse.ok &&
          Array.isArray(activityData.activities)
        ) {
          setRecentActivityItems(
            activityData.activities.map((activity) => ({
              id: activity.id,
              title: activity.title,
              detail:
                activity.description ||
                activity.action ||
                "CMS activity",
              time: formatDashboardTime(activity.createdAt),
              timestamp: new Date(
                activity.createdAt || 0
              ).getTime(),
              type: activity.type || "system",
              status:
                activity.action === "deleted"
                  ? "orange"
                  : activity.action === "archived"
                    ? "orange"
                    : "green",
            }))
          );
        }
      } catch {
        // Keep the dashboard usable when the API is temporarily offline.
      }
    };

    loadDashboardData();

    const refreshTimer = window.setInterval(
      loadDashboardData,
      15000
    );

    const handleDataUpdated = () => {
      loadDashboardData();
    };

    window.addEventListener(
      "portfolio-projects-updated",
      handleDataUpdated
    );
    window.addEventListener(
      "portfolio-messages-updated",
      handleDataUpdated
    );
    window.addEventListener(
      "portfolio-media-updated",
      handleDataUpdated
    );
    window.addEventListener(
      "portfolio-cms:pages-updated",
      handleDataUpdated
    );

    return () => {
      isActive = false;
      window.clearInterval(refreshTimer);
      window.removeEventListener(
        "portfolio-projects-updated",
        handleDataUpdated
      );
      window.removeEventListener(
        "portfolio-messages-updated",
        handleDataUpdated
      );
      window.removeEventListener(
        "portfolio-media-updated",
        handleDataUpdated
      );
      window.removeEventListener(
        "portfolio-cms:pages-updated",
        handleDataUpdated
      );
    };
  }, [navigate]);

  const handleNavigation = (section) => {
    setActiveSection(section);
    setSelectedPage(null);
    setSidebarOpen(false);
  };

  const handleEditPage = (page) => {
    setSelectedPage(page);
    setActiveSection("Page Builder");
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      navigate("/admin/login", {
        replace: true,
      });
    }
  };

  const adminInitials = admin.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const firstName =
    admin.name.split(" ").filter(Boolean)[0] ||
    "Administrator";

  const isBuilder = activeSection === "Page Builder";

  const dashboardStatistics = statistics.map(
    (item) => {
      if (item.label === "Pages") {
        return {
          ...item,
          value: String(pageCount),
          change: `${pageCount} total`,
        };
      }

      if (item.label === "Projects") {
        return {
          ...item,
          value: String(projectCount),
          change: `${projectCount} total`,
        };
      }

      if (item.label === "Messages") {
        return {
          ...item,
          value: String(messageSummary.count),
          change: `${messageSummary.unreadCount} unread`,
        };
      }

      return item;
    }
  );


  return (
    <div className="cms-dashboard">
      <div
        className={`cms-sidebar-overlay ${
          sidebarOpen ? "is-visible" : ""
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`cms-sidebar ${
          sidebarOpen ? "is-open" : ""
        }`}
      >
        <div className="cms-sidebar__brand">
          <div className="cms-sidebar__brand-row">
            <BrandMark />

            <strong className="cms-sidebar__brand-name">
              Haseeb<span>.dev</span>
            </strong>
          </div>

          <strong className="cms-sidebar__product">
            Portfolio CMS
          </strong>

          <small className="cms-sidebar__product-copy">
            Content Administration
          </small>
        </div>

        <nav className="cms-sidebar__nav">
          {navigationItems.map((item) => {
            const ItemIcon = item.icon;

            const itemBadge =
              item.label === "Messages"
                ? messageSummary.unreadCount > 0
                  ? String(
                      messageSummary.unreadCount
                    )
                  : null
                : item.badge;

            const isActive =
              activeSection === item.label ||
              (item.label === "Pages" && isBuilder);

            return (
              <button
                key={item.label}
                type="button"
                className={`cms-sidebar__nav-button ${
                  isActive ? "is-active" : ""
                }`}
                onClick={() =>
                  handleNavigation(item.label)
                }
              >
                <ItemIcon size={18} />

                <span>{item.label}</span>

                {itemBadge && (
                  <span className="cms-sidebar__badge">
                    {itemBadge}
                  </span>
                )}

                {isActive && (
                  <ChevronRight
                    className="cms-sidebar__active-arrow"
                    size={16}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="cms-sidebar__support">
          <div className="cms-sidebar__support-glow" />

          <Sparkles size={18} />

          <h3>
            Let&apos;s build something great together.
          </h3>

          <p>Need help or have feedback?</p>

          <a href="mailto:haseebmujeeb360@gmail.com">
            Contact Support
            <ArrowRight size={15} />
          </a>
        </div>
      </aside>

      <main className="cms-main">
        <header className="cms-topbar">
          <div className="cms-topbar__left">
            <button
              type="button"
              className="cms-menu-toggle"
              onClick={() =>
                setSidebarOpen((current) => !current)
              }
              aria-label="Open dashboard menu"
            >
              <Menu size={20} />
            </button>

            <label className="cms-topbar__search">
              <Search size={17} />

              <input
                type="search"
                placeholder="Search pages, projects, messages..."
                aria-label="Search dashboard"
              />

              <kbd>⌘ K</kbd>
            </label>
          </div>

          <div className="cms-topbar__actions">
            <button
              type="button"
              className="cms-topbar__notification"
              aria-label="Notifications"
            >
              <Bell size={19} />
              {messageSummary.unreadCount > 0 && (
                <span>{messageSummary.unreadCount}</span>
              )}
            </button>

            <div className="cms-topbar__profile">
              <div className="cms-topbar__avatar">
                {adminInitials || "HM"}
              </div>

              <div className="cms-topbar__profile-copy">
                <strong>{admin.name}</strong>
                <span>Administrator</span>
              </div>

              <ChevronDown size={15} />
            </div>

            <button
              type="button"
              className="cms-topbar__logout"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={18} />
            </button>

            <a
              className="cms-topbar__view-site"
              href="/"
              target="_blank"
              rel="noreferrer"
            >
              View Website
              <ExternalLink size={14} />
            </a>
          </div>
        </header>

        <div
          className={`cms-content ${
            isBuilder ? "cms-content--builder" : ""
          }`}
        >
          {activeSection === "Pages" && (
            <PagesManager onEditPage={handleEditPage} />
          )}

          {activeSection === "Site Styles" && (
            <SiteStylesManager />
          )}

          {activeSection === "Projects" && (
            <ProjectsManager />
          )}

          {activeSection === "Messages" && (
            <MessagesManager />
          )}

          {activeSection === "Media Library" && (
            <MediaLibraryManager />
          )}

          {activeSection === "Navigation" && (
            <NavigationManager />
          )}

          {activeSection === "SEO" && (
            <SEOManager />
          )}

          {activeSection === "Settings" && (
            <SettingsManager
              admin={admin}
              onLogout={handleLogout}
            />
          )}

          {isBuilder && selectedPage && (
            <PageBuilder
              page={selectedPage}
              onBack={() => {
                setSelectedPage(null);
                setActiveSection("Pages");
              }}
            />
          )}

          {activeSection === "Dashboard" && (
            <div className="cms-dashboard-home">
              <section className="cms-dashboard-hero">
                <div className="cms-dashboard-hero__copy">
                  <span>
                    Welcome back, {firstName} 👋
                  </span>

                  <h1>
                    Here&apos;s what&apos;s happening
                    with your site.
                  </h1>

                  <p>
                    Manage your content, track
                    performance, and grow your
                    portfolio.
                  </p>
                </div>

                <article className="cms-quick-panel">
                  <div className="cms-section-heading">
                    <h2>Quick Actions</h2>
                  </div>

                  <div className="cms-quick-grid">
                    {quickActions.map((action) => {
                      const ActionIcon = action.icon;

                      return (
                        <button
                          type="button"
                          className={`cms-quick-card cms-tone--${action.tone}`}
                          key={action.title}
                          onClick={() =>
                            handleNavigation(
                              action.section
                            )
                          }
                        >
                          <span>
                            <ActionIcon size={20} />
                          </span>

                          <strong>
                            {action.title}
                          </strong>
                        </button>
                      );
                    })}
                  </div>
                </article>
              </section>

              <section className="cms-stat-grid">
                {dashboardStatistics.map((item) => {
                  const StatIcon = item.icon;

                  return (
                    <article
                      className={`cms-stat-card cms-tone--${item.tone}`}
                      key={item.label}
                    >
                      <span className="cms-stat-card__icon">
                        <StatIcon size={21} />
                      </span>

                      <div className="cms-stat-card__copy">
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                        <small>{item.change}</small>
                      </div>
                    </article>
                  );
                })}
              </section>

              <section className="cms-overview-grid">
                <article className="cms-panel cms-site-preview">
                  <div className="cms-panel__header">
                    <div className="cms-section-heading cms-section-heading--inline">
                      <h2>Website Overview</h2>

                      <span className="cms-live-badge">
                        <i />
                        Live
                      </span>
                    </div>
                  </div>

                  <div className="cms-site-preview__frame">
                    <iframe
                      src="/projects?dashboardPreview=1"
                      title="Portfolio website preview"
                      tabIndex="-1"
                    />
                  </div>

                  <div className="cms-site-preview__footer">
                    <a
                      href="/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink size={13} />
                      Portfolio website
                    </a>

                    <a
                      className="cms-card-button"
                      href="/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Website
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </article>

                <article className="cms-panel cms-performance">
                  <div className="cms-panel__header">
                    <div className="cms-section-heading">
                      <h2>Performance</h2>
                    </div>

                    <button
                      type="button"
                      className="cms-period-button"
                    >
                      Last 30 days
                      <ChevronDown size={13} />
                    </button>
                  </div>

                  <div className="cms-performance__metrics">
                    {performanceMetrics.map(
                      (metric) => (
                        <div
                          className={`cms-performance-metric cms-tone--${metric.tone}`}
                          key={metric.label}
                        >
                          <span>{metric.label}</span>

                          <div>
                            <strong>
                              {metric.value}
                            </strong>

                            <small>
                              {metric.change}
                            </small>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <PerformanceChart />

                  <button
                    type="button"
                    className="cms-panel-action"
                  >
                    View Full Analytics
                    <ChevronRight size={14} />
                  </button>
                </article>

                <article className="cms-panel cms-activity-panel">
                  <div className="cms-panel__header">
                    <div className="cms-section-heading">
                      <h2>Recent Activity</h2>
                    </div>
                  </div>

                  <div className="cms-activity-list">
                    {recentActivityItems.map((activity) => (
                      <div
                        className="cms-activity-row"
                        key={activity.id || `${activity.title}-${activity.time}`}
                      >
                        <span
                          className={`cms-activity-row__icon is-${activity.type}`}
                        >
                          <ActivityIcon
                            type={activity.type}
                          />
                        </span>

                        <div className="cms-activity-row__copy">
                          <strong>
                            {activity.title}
                          </strong>

                          <span>
                            {activity.detail}
                          </span>
                        </div>

                        <time>{activity.time}</time>

                        <i
                          className={`cms-status-dot is-${activity.status}`}
                        />
                      </div>
                    ))}

                    {recentActivityItems.length === 0 && (
                      <div className="cms-activity-row">
                        <span className="cms-activity-row__icon is-system">
                          <Activity size={15} />
                        </span>
                        <div className="cms-activity-row__copy">
                          <strong>No activity recorded yet</strong>
                          <span>New CMS changes will appear here.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="cms-panel-action cms-panel-action--wide"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Activity
                    <ChevronRight size={14} />
                  </button>
                </article>
              </section>

              <section className="cms-lists-grid">
                <article className="cms-panel cms-list-panel">
                  <div className="cms-panel__header">
                    <div className="cms-section-heading">
                      <h2>Recent Pages</h2>
                    </div>

                    <button
                      type="button"
                      className="cms-panel-link"
                      onClick={() =>
                        handleNavigation("Pages")
                      }
                    >
                      View All Pages
                      <ChevronRight size={13} />
                    </button>
                  </div>

                  <div className="cms-compact-list">
                    {liveRecentPages.map((page) => (
                      <div
                        className="cms-compact-row"
                        key={page.title}
                      >
                        <span className="cms-compact-row__icon is-page">
                          <FileText size={16} />
                        </span>

                        <div className="cms-compact-row__copy">
                          <strong>{page.title}</strong>
                          <span>{page.type}</span>
                        </div>

                        <span className="cms-list-status">
                          <i />
                          {page.status}
                        </span>

                        <time>{page.time}</time>

                        <button
                          type="button"
                          aria-label={`Open ${page.title}`}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="cms-panel cms-list-panel">
                  <div className="cms-panel__header">
                    <div className="cms-section-heading">
                      <h2>Recent Projects</h2>
                    </div>

                    <button
                      type="button"
                      className="cms-panel-link"
                      onClick={() =>
                        handleNavigation("Projects")
                      }
                    >
                      View All Projects
                      <ChevronRight size={13} />
                    </button>
                  </div>

                  <div className="cms-compact-list">
                    {liveRecentProjects.map((project) => (
                      <div
                        className="cms-compact-row"
                        key={project.title}
                      >
                        <span
                          className={`cms-project-thumb is-${project.tone}`}
                        >
                          {project.initials}
                        </span>

                        <div className="cms-compact-row__copy">
                          <strong>
                            {project.title}
                          </strong>

                          <span>
                            {project.category}
                          </span>
                        </div>

                        <span className="cms-list-status">
                          <i />
                          {project.status}
                        </span>

                        <time>{project.time}</time>

                        <button
                          type="button"
                          aria-label={`Open ${project.title}`}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="cms-panel cms-list-panel">
                  <div className="cms-panel__header">
                    <div className="cms-section-heading">
                      <h2>Recent Messages</h2>
                    </div>

                    <button
                      type="button"
                      className="cms-panel-link"
                      onClick={() =>
                        handleNavigation("Messages")
                      }
                    >
                      View All Messages
                      <ChevronRight size={13} />
                    </button>
                  </div>

                  <div className="cms-message-list">
                    {liveRecentMessages.map((message) => (
                      <div
                        className="cms-message-row"
                        key={message.id}
                      >
                        <span
                          className={`cms-message-avatar is-${message.tone}`}
                        >
                          {message.initials}
                        </span>

                        <div className="cms-message-copy">
                          <strong>
                            {message.name}
                          </strong>

                          <span>
                            {message.subject}
                          </span>
                        </div>

                        <time>{message.time}</time>

                        {message.unread && (
                          <i className="cms-message-unread" />
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="cms-message-total">
                    Total {messageSummary.count} messages
                  </p>
                </article>
              </section>
            </div>
          )}

          {![
            "Dashboard",
            "Pages",
            "Page Builder",
            "Site Styles",
            "Projects",
            "Messages",
            "Media Library",
            "Navigation",
            "SEO",
            "Settings",
          ].includes(activeSection) && (
            <section className="cms-builder-placeholder">
              <span className="cms-builder-placeholder__eyebrow">
                Haseeb.dev Portfolio CMS
              </span>

              <h1>{activeSection}</h1>

              <div className="cms-builder-placeholder__card">
                <Wrench size={30} />

                <h2>{activeSection} module</h2>

                <p>
                  This module will be connected after
                  the page builder foundation is
                  complete.
                </p>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
