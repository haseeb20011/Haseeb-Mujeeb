import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  ChevronRight,
  ExternalLink,
  Eye,
  FileText,
  FolderKanban,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Palette,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import "./AdminDashboard.css";
import PagesManager from "./PagesManager.jsx";
import SiteStylesManager from "./SiteStylesManager.jsx";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

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

const statistics = [
  {
    label: "Total Pages",
    value: "5",
    change: "All active",
    icon: FileText,
    color: "#7254e8",
    soft: "#eeeaff",
  },
  {
    label: "Total Projects",
    value: "7",
    change: "+2 this month",
    icon: FolderKanban,
    color: "#1976d2",
    soft: "#e5f2ff",
  },
  {
    label: "Unread Messages",
    value: "3",
    change: "+3 new",
    icon: MessageSquare,
    color: "#e07b24",
    soft: "#fff0df",
  },
  {
    label: "Portfolio Views",
    value: "1,284",
    change: "+12.5%",
    icon: BarChart3,
    color: "#16875d",
    soft: "#e4f7ef",
  },
];

const recentProjects = [
  {
    initials: "HW",
    title: "Holiday Weekly",
    category: "WordPress · News and Media",
    status: "Published",
  },
  {
    initials: "JS",
    title: "Julien's Solar Solutions",
    category: "WordPress · Lead Generation",
    status: "Published",
  },
  {
    initials: "MD",
    title: "Mardo",
    category: "Shopify · E-commerce",
    status: "Published",
  },
  {
    initials: "GO",
    title: "Go Studio",
    category: "WordPress · Consulting",
    status: "Draft",
  },
];

const quickActions = [
  {
    title: "Manage Website Pages",
    description:
      "Edit Home, About, Services, Portfolio, and Contact",
    icon: FileText,
    color: "#7254e8",
    soft: "#eeeaff",
    section: "Pages",
  },
  {
    title: "Edit Site Styles",
    description:
      "Manage global fonts, colors, width, and spacing",
    icon: Palette,
    color: "#e07b24",
    soft: "#fff0df",
    section: "Site Styles",
  },
  {
    title: "Add New Project",
    description: "Publish another portfolio case study",
    icon: Plus,
    color: "#1976d2",
    soft: "#e5f2ff",
    section: "Projects",
  },
  {
    title: "View Messages",
    description: "Review new contact enquiries",
    icon: MessageSquare,
    color: "#16875d",
    soft: "#e4f7ef",
    section: "Messages",
  },
];

const recentMessages = [
  {
    initials: "AM",
    name: "Ahmed Malik",
    message: "I would like to discuss a new website project.",
    time: "12 min",
  },
  {
    initials: "SK",
    name: "Sarah Khan",
    message: "Are you available for a remote development role?",
    time: "2 hr",
  },
  {
    initials: "DW",
    name: "Daniel Wright",
    message: "Please send your estimated project timeline.",
    time: "1 day",
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] =
    useState("Dashboard");
  const [selectedPage, setSelectedPage] = useState(null);

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
          <div className="cms-sidebar__logo">
            <ShieldCheck size={23} />
          </div>

          <div className="cms-sidebar__brand-text">
            <strong>Portfolio CMS</strong>
            <small>Content administration</small>
          </div>
        </div>

        <span className="cms-sidebar__label">
          Workspace
        </span>

        <nav className="cms-sidebar__nav">
          {navigationItems.map((item) => {
            const ItemIcon = item.icon;

            const isActive =
              activeSection === item.label ||
              (item.label === "Pages" &&
                activeSection === "Page Builder");

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
              </button>
            );
          })}
        </nav>

        <div className="cms-sidebar__footer">
          <div className="cms-sidebar__profile">
            <div className="cms-sidebar__avatar">
              {adminInitials || "AD"}
            </div>

            <div className="cms-sidebar__profile-copy">
              <strong>{admin.name}</strong>
              <span>{admin.email}</span>
            </div>

            <button
              type="button"
              className="cms-sidebar__logout"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={17} />
            </button>
          </div>
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
              <Menu size={19} />
            </button>

            <div className="cms-topbar__title">
              <strong>
                {activeSection === "Page Builder" &&
                selectedPage
                  ? `Editing ${selectedPage.title}`
                  : activeSection}
              </strong>

              <span>
                Portfolio content management
              </span>
            </div>
          </div>

          <div className="cms-topbar__actions">
            <button
              type="button"
              className="cms-topbar__icon-button"
              aria-label="Search"
            >
              <Search size={17} />
            </button>

            <button
              type="button"
              className="cms-topbar__icon-button"
              aria-label="Notifications"
            >
              <Bell size={17} />
              <span className="cms-topbar__notification-dot" />
            </button>

            <a
              className="cms-topbar__view-site"
              href="/"
              target="_blank"
              rel="noreferrer"
            >
              <Eye size={16} />
              <span>View website</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </header>

        <div className="cms-content">
          {activeSection === "Pages" && (
            <PagesManager
              onEditPage={handleEditPage}
            />
          )}

          {activeSection === "Site Styles" && (
            <SiteStylesManager />
          )}

          {activeSection === "Page Builder" &&
            selectedPage && (
              <section className="cms-builder-placeholder">
                <button
                  type="button"
                  className="cms-builder-placeholder__back"
                  onClick={() => {
                    setSelectedPage(null);
                    setActiveSection("Pages");
                  }}
                >
                  ← Back to pages
                </button>

                <span className="cms-builder-placeholder__eyebrow">
                  Page builder
                </span>

                <h1>
                  Editing {selectedPage.title}
                </h1>

                <p>
                  URL:{" "}
                  <strong>
                    {selectedPage.slug}
                  </strong>
                </p>

                <div className="cms-builder-placeholder__card">
                  <LayoutDashboard size={31} />

                  <h2>
                    Layout builder coming next
                  </h2>

                  <p>
                    This screen will let you add,
                    edit, duplicate, delete, hide,
                    and reorder sections for this
                    page.
                  </p>
                </div>
              </section>
            )}

          {activeSection === "Dashboard" && (
            <>
              <section className="cms-welcome">
                <div className="cms-welcome__copy">
                  <span>
                    Portfolio administration
                  </span>

                  <h1>
                    Welcome back, {firstName}.
                  </h1>

                  <p>
                    Manage your website pages,
                    publish projects, review
                    enquiries, and keep your
                    portfolio updated from one
                    private dashboard.
                  </p>
                </div>

                <button
                  type="button"
                  className="cms-primary-button"
                  onClick={() =>
                    handleNavigation("Pages")
                  }
                >
                  <Plus size={17} />
                  Add new page
                </button>
              </section>

              <section className="cms-stat-grid">
                {statistics.map((item) => {
                  const StatIcon = item.icon;

                  return (
                    <article
                      key={item.label}
                      className="cms-stat-card"
                      style={{
                        "--stat-color":
                          item.color,
                        "--stat-soft":
                          item.soft,
                      }}
                    >
                      <div className="cms-stat-card__top">
                        <div className="cms-stat-card__icon">
                          <StatIcon size={20} />
                        </div>

                        <span className="cms-stat-card__change">
                          {item.change}
                        </span>
                      </div>

                      <strong className="cms-stat-card__value">
                        {item.value}
                      </strong>

                      <span className="cms-stat-card__label">
                        {item.label}
                      </span>
                    </article>
                  );
                })}
              </section>

              <section className="cms-dashboard-grid">
                <article className="cms-panel">
                  <div className="cms-panel__header">
                    <div className="cms-panel__heading">
                      <h2>Recent projects</h2>

                      <p>
                        Your latest portfolio work
                        and publishing status
                      </p>
                    </div>

                    <button
                      type="button"
                      className="cms-panel__link"
                      onClick={() =>
                        handleNavigation(
                          "Projects"
                        )
                      }
                    >
                      View all
                    </button>
                  </div>

                  <div className="cms-project-list">
                    {recentProjects.map(
                      (project) => (
                        <div
                          className="cms-project-row"
                          key={project.title}
                        >
                          <div className="cms-project-row__image">
                            {project.initials}
                          </div>

                          <div className="cms-project-row__copy">
                            <strong>
                              {project.title}
                            </strong>

                            <span>
                              {project.category}
                            </span>
                          </div>

                          <span
                            className={`cms-status ${
                              project.status ===
                              "Published"
                                ? "cms-status--published"
                                : "cms-status--draft"
                            }`}
                          >
                            {project.status}
                          </span>

                          <button
                            type="button"
                            className="cms-row-action"
                            aria-label={`Open ${project.title}`}
                          >
                            <MoreHorizontal
                              size={16}
                            />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </article>

                <div className="cms-dashboard-side">
                  <article className="cms-panel">
                    <div className="cms-panel__header">
                      <div className="cms-panel__heading">
                        <h2>Quick actions</h2>
                        <p>
                          Common portfolio
                          management tasks
                        </p>
                      </div>
                    </div>

                    <div className="cms-quick-actions">
                      {quickActions.map(
                        (action) => {
                          const ActionIcon =
                            action.icon;

                          return (
                            <button
                              type="button"
                              className="cms-quick-action"
                              key={action.title}
                              onClick={() =>
                                handleNavigation(
                                  action.section
                                )
                              }
                            >
                              <span
                                className="cms-quick-action__icon"
                                style={{
                                  "--action-color":
                                    action.color,
                                  "--action-soft":
                                    action.soft,
                                }}
                              >
                                <ActionIcon
                                  size={18}
                                />
                              </span>

                              <span className="cms-quick-action__copy">
                                <strong>
                                  {action.title}
                                </strong>

                                <span>
                                  {
                                    action.description
                                  }
                                </span>
                              </span>

                              <ChevronRight
                                size={15}
                              />
                            </button>
                          );
                        }
                      )}
                    </div>
                  </article>

                  <article className="cms-panel cms-panel--messages">
                    <div className="cms-panel__header">
                      <div className="cms-panel__heading">
                        <h2>Recent messages</h2>

                        <p>
                          Latest enquiries from
                          your portfolio
                        </p>
                      </div>

                      <button
                        type="button"
                        className="cms-panel__link"
                        onClick={() =>
                          handleNavigation(
                            "Messages"
                          )
                        }
                      >
                        View all
                      </button>
                    </div>

                    <div className="cms-message-list">
                      {recentMessages.map(
                        (message) => (
                          <div
                            className="cms-message-row"
                            key={message.name}
                          >
                            <div className="cms-message-avatar">
                              {
                                message.initials
                              }
                            </div>

                            <div className="cms-message-copy">
                              <strong>
                                {message.name}
                              </strong>

                              <p>
                                {message.message}
                              </p>
                            </div>

                            <span className="cms-message-time">
                              {message.time}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </article>
                </div>
              </section>
            </>
          )}

          {![
            "Dashboard",
            "Pages",
            "Page Builder",
            "Site Styles",
          ].includes(activeSection) && (
            <section className="cms-builder-placeholder">
              <span className="cms-builder-placeholder__eyebrow">
                Portfolio CMS
              </span>

              <h1>{activeSection}</h1>

              <div className="cms-builder-placeholder__card">
                <Wrench size={30} />

                <h2>
                  {activeSection} module
                </h2>

                <p>
                  This module will be connected
                  after the page builder foundation
                  is complete.
                </p>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}