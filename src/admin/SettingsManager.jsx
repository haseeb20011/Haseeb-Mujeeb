import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Bell,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  FileJson,
  Globe2,
  KeyRound,
  Laptop,
  Link2,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCcw,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  X,
} from "lucide-react";

import "./SettingsManager.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const DEFAULT_SETTINGS = {
  general: {
    siteName: "Haseeb.dev",
    siteTagline:
      "WordPress, Shopify & React Developer",
    publicUrl: "http://localhost:5174",
    language: "English",
    timezone: "Asia/Karachi",
    dateFormat: "MMM D, YYYY",
    maintenanceMode: false,
  },

  contact: {
    businessEmail:
      "haseebmujeeb360@gmail.com",
    phone: "",
    location: "Pakistan",
    availability:
      "Available for selected projects",
    responseTime:
      "Within one business day",
  },

  social: {
    github: "",
    linkedin: "",
    behance: "",
    dribbble: "",
    instagram: "",
    x: "",
  },

  notifications: {
    newMessages: true,
    projectUpdates: true,
    publishConfirmation: true,
    weeklySummary: false,
    securityAlerts: true,
  },

  preferences: {
    defaultSection: "Dashboard",
    compactTables: false,
    confirmDelete: true,
    autoSave: true,
    autoLockMinutes: 60,
  },
};

const cloneDefaults = () =>
  JSON.parse(
    JSON.stringify(DEFAULT_SETTINGS)
  );

const normalizeSettings = (
  input = {}
) => {
  const defaults = cloneDefaults();

  return {
    general: {
      ...defaults.general,
      ...(input.general || {}),

      siteName:
        input.general?.siteName ||
        input.siteName ||
        defaults.general.siteName,

      publicUrl:
        input.general?.publicUrl ||
        input.websiteUrl ||
        defaults.general.publicUrl,
    },

    contact: {
      ...defaults.contact,
      ...(input.contact || {}),

      businessEmail:
        input.contact?.businessEmail ||
        input.email ||
        defaults.contact.businessEmail,

      phone:
        input.contact?.phone ??
        input.phone ??
        defaults.contact.phone,

      location:
        input.contact?.location ||
        input.location ||
        defaults.contact.location,
    },

    social: {
      ...defaults.social,
      ...(input.socialLinks || {}),
      ...(input.social || {}),
    },

    notifications: {
      ...defaults.notifications,
      ...(input.notifications || {}),
    },

    preferences: {
      ...defaults.preferences,
      ...(input.preferences || {}),
    },
  };
};

const getCompletedFields = (
  object
) =>
  Object.values(object).filter(
    (value) => {
      if (
        typeof value === "boolean"
      ) {
        return true;
      }

      return String(
        value || ""
      ).trim().length > 0;
    }
  ).length;

export default function SettingsManager({
  admin = {
    name: "Administrator",
    email: "",
  },

  onLogout = () => {},
}) {
  const importInputRef =
    useRef(null);

  const [
    settings,
    setSettings,
  ] = useState(cloneDefaults);

  const [
    activeTab,
    setActiveTab,
  ] = useState("general");

  const [
    notice,
    setNotice,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    hasChanges,
    setHasChanges,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load settings from MongoDB
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let active = true;

    const loadSettingsFromDatabase =
      async () => {
        setIsLoading(true);
        setError("");

        try {
          const response =
            await fetch(
              `${API_URL}/api/site-config`,
              {
                credentials:
                  "include",

                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const result =
            await response
              .json()
              .catch(() => ({}));

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result.message ||
                "Unable to load settings."
            );
          }

          if (!active) {
            return;
          }

          setSettings(
            normalizeSettings(
              result.config
                ?.settings || {}
            )
          );

          setHasChanges(false);
        } catch (
          loadError
        ) {
          if (!active) {
            return;
          }

          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Unable to load settings."
          );
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      };

    loadSettingsFromDatabase();

    return () => {
      active = false;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Dashboard calculations
  |--------------------------------------------------------------------------
  */

  const completion =
    useMemo(() => {
      const totalFields =
        Object.keys(
          settings.general
        ).length +
        Object.keys(
          settings.contact
        ).length +
        Object.keys(
          settings.social
        ).length;

      const completedFields =
        getCompletedFields(
          settings.general
        ) +
        getCompletedFields(
          settings.contact
        ) +
        getCompletedFields(
          settings.social
        );

      return Math.round(
        (completedFields /
          totalFields) *
          100
      );
    }, [settings]);

  const socialCount =
    Object.values(
      settings.social
    ).filter((value) =>
      String(
        value || ""
      ).trim()
    ).length;

  const notificationCount =
    Object.values(
      settings.notifications
    ).filter(Boolean).length;

  /*
  |--------------------------------------------------------------------------
  | Notices
  |--------------------------------------------------------------------------
  */

  const showNotice = (
    message
  ) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice("");
    }, 2500);
  };

  /*
  |--------------------------------------------------------------------------
  | Update settings field
  |--------------------------------------------------------------------------
  */

  const updateGroup = (
    groupName,
    fieldName,
    value
  ) => {
    setSettings(
      (current) => ({
        ...current,

        [groupName]: {
          ...current[
            groupName
          ],

          [fieldName]:
            value,
        },
      })
    );

    setHasChanges(true);
    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | Save settings to MongoDB
  |--------------------------------------------------------------------------
  */

  const handleSave =
    async () => {
      if (
        isSaving ||
        isLoading
      ) {
        return;
      }

      setIsSaving(true);
      setError("");

      try {
        const response =
          await fetch(
            `${API_URL}/api/site-config/settings`,
            {
              method: "PUT",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    settings,
                  }
                ),
            }
          );

        const result =
          await response
            .json()
            .catch(() => ({}));

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Unable to save settings."
          );
        }

        const savedSettings =
          normalizeSettings(
            result.settings ||
              settings
          );

        setSettings(
          savedSettings
        );

        setHasChanges(false);

        window.dispatchEvent(
          new CustomEvent(
            "portfolio-settings-updated",
            {
              detail:
                savedSettings,
            }
          )
        );

        showNotice(
          "Settings saved successfully to MongoDB."
        );
      } catch (
        saveError
      ) {
        setError(
          saveError instanceof
            Error
            ? saveError.message
            : "Unable to save settings."
        );
      } finally {
        setIsSaving(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Reset
  |--------------------------------------------------------------------------
  */

  const handleReset = () => {
    const confirmed =
      window.confirm(
        "Reset all CMS settings to their original defaults?"
      );

    if (!confirmed) {
      return;
    }

    setSettings(
      cloneDefaults()
    );

    setHasChanges(true);
    setError("");

    showNotice(
      "Defaults loaded. Click Save settings to publish them."
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Export
  |--------------------------------------------------------------------------
  */

  const handleExport = () => {
    const payload = {
      exportedAt:
        new Date().toISOString(),

      type:
        "Haseeb.dev CMS Settings",

      version: 1,

      settings,
    };

    const blob =
      new Blob(
        [
          JSON.stringify(
            payload,
            null,
            2
          ),
        ],

        {
          type:
            "application/json",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const anchor =
      document.createElement(
        "a"
      );

    anchor.href = url;

    anchor.download =
      "haseeb-dev-cms-settings.json";

    document.body.appendChild(
      anchor
    );

    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(
      url
    );

    showNotice(
      "Settings export downloaded."
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Import
  |--------------------------------------------------------------------------
  */

  const handleImport = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      try {
        const parsed =
          JSON.parse(
            String(
              reader.result ||
                "{}"
            )
          );

        const importedSettings =
          parsed.settings ||
          parsed;

        setSettings({
          general: {
            ...DEFAULT_SETTINGS.general,
            ...(
              importedSettings.general ||
              {}
            ),
          },

          contact: {
            ...DEFAULT_SETTINGS.contact,
            ...(
              importedSettings.contact ||
              {}
            ),
          },

          social: {
            ...DEFAULT_SETTINGS.social,
            ...(
              importedSettings.social ||
              {}
            ),
          },

          notifications: {
            ...DEFAULT_SETTINGS.notifications,
            ...(
              importedSettings.notifications ||
              {}
            ),
          },

          preferences: {
            ...DEFAULT_SETTINGS.preferences,
            ...(
              importedSettings.preferences ||
              {}
            ),
          },
        });

        setHasChanges(true);

        showNotice(
          "Settings imported. Review and save them."
        );
      } catch {
        showNotice(
          "The selected JSON file is not valid."
        );
      }
    };

    reader.readAsText(
      file
    );

    event.target.value =
      "";
  };

  /*
  |--------------------------------------------------------------------------
  | Tabs
  |--------------------------------------------------------------------------
  */

  const tabs = [
    {
      id: "general",
      label: "General",
      description:
        "Site identity and locale",
      icon: Settings2,
    },

    {
      id: "contact",
      label: "Contact",
      description:
        "Public contact details",
      icon: Mail,
    },

    {
      id: "social",
      label:
        "Social Links",
      description:
        "External profiles",
      icon: Link2,
    },

    {
      id: "notifications",
      label:
        "Notifications",
      description:
        "CMS alerts and summaries",
      icon: Bell,
    },

    {
      id: "preferences",
      label:
        "Preferences",
      description:
        "Dashboard behavior",
      icon: Laptop,
    },

    {
      id: "security",
      label:
        "Security & Data",
      description:
        "Session and backup tools",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="cms-settings">
      <header className="cms-settings__header">
        <div>
          <span className="cms-settings__eyebrow">
            CMS configuration
          </span>

          <h1>
            Settings
          </h1>

          <p>
            Manage website
            details, contact
            information,
            notifications,
            preferences,
            account security,
            and CMS data.
          </p>
        </div>

        <div className="cms-settings__header-actions">
          <button
            type="button"
            className="cms-settings__reset"
            onClick={
              handleReset
            }
            disabled={
              isLoading ||
              isSaving
            }
          >
            <RefreshCcw
              size={15}
            />

            Reset defaults
          </button>

          <button
            type="button"
            className="cms-settings__save"
            onClick={
              handleSave
            }
            disabled={
              isLoading ||
              isSaving ||
              !hasChanges
            }
          >
            <Save
              size={16}
            />

            {isSaving
              ? "Saving..."
              : "Save settings"}
          </button>
        </div>
      </header>

      {notice && (
        <div className="cms-settings__notice">
          <Check
            size={15}
          />

          {notice}
        </div>
      )}

      {isLoading && (
        <div className="cms-settings__notice">
          Loading saved
          settings...
        </div>
      )}

      {error && (
        <div className="cms-settings__notice">
          <X
            size={15}
          />

          {error}
        </div>
      )}

      <section className="cms-settings__summary">
        <article className="cms-settings__summary-intro">
          <span>
            <Sparkles
              size={16}
            />

            Configuration
            overview
          </span>

          <strong>
            Keep your
            operational settings
            organized without
            changing the current
            website design.
          </strong>

          <p>
            Settings are loaded
            from and saved to
            MongoDB so they stay
            consistent across
            browsers, devices,
            and deployments.
          </p>
        </article>

        <SettingsStat
          label="Profile complete"
          value={`${completion}%`}
          detail="General, contact, and social"
          icon={
            CheckCircle2
          }
          tone="purple"
        />

        <SettingsStat
          label="Social links"
          value={
            socialCount
          }
          detail="Connected profiles"
          icon={Link2}
          tone="blue"
        />

        <SettingsStat
          label="Notifications"
          value={
            notificationCount
          }
          detail="Enabled alert types"
          icon={Bell}
          tone="orange"
        />

        <SettingsStat
          label="Session"
          value="Active"
          detail="Protected administrator"
          icon={
            ShieldCheck
          }
          tone="green"
        />
      </section>

      <section className="cms-settings__workspace">
        <aside className="cms-settings__tabs">
          <div className="cms-settings__tabs-heading">
            <span>
              <Settings2
                size={16}
              />
            </span>

            <div>
              <strong>
                Settings groups
              </strong>

              <small>
                {tabs.length}{" "}
                categories
              </small>
            </div>
          </div>

          <nav>
            {tabs.map(
              (tab) => {
                const TabIcon =
                  tab.icon;

                return (
                  <button
                    type="button"
                    key={
                      tab.id
                    }
                    className={
                      activeTab ===
                      tab.id
                        ? "is-active"
                        : ""
                    }
                    onClick={() =>
                      setActiveTab(
                        tab.id
                      )
                    }
                  >
                    <TabIcon
                      size={
                        16
                      }
                    />

                    <span>
                      <strong>
                        {
                          tab.label
                        }
                      </strong>

                      <small>
                        {
                          tab.description
                        }
                      </small>
                    </span>
                  </button>
                );
              }
            )}
          </nav>

          <div className="cms-settings__tabs-note">
            <ShieldCheck
              size={16}
            />

            <div>
              <strong>
                Protected
                configuration
              </strong>

              <span>
                Sensitive login
                credentials are
                not stored in
                browser settings.
              </span>
            </div>
          </div>
        </aside>

        <div className="cms-settings__editor">
          <header className="cms-settings__editor-header">
            <div>
              <span>
                Haseeb.dev
                Portfolio CMS
              </span>

              <h2>
                {
                  tabs.find(
                    (
                      tab
                    ) =>
                      tab.id ===
                      activeTab
                  )?.label
                }
              </h2>

              <p>
                {
                  tabs.find(
                    (
                      tab
                    ) =>
                      tab.id ===
                      activeTab
                  )
                    ?.description
                }
              </p>
            </div>

            <span
              className={`cms-settings__save-state ${
                hasChanges
                  ? "is-unsaved"
                  : ""
              }`}
            >
              {hasChanges
                ? "Unsaved changes"
                : "All changes saved"}
            </span>
          </header>

          <div className="cms-settings__editor-body">
            {activeTab ===
              "general" && (
              <GeneralSettings
                settings={
                  settings.general
                }
                update={(
                  fieldName,
                  value
                ) =>
                  updateGroup(
                    "general",
                    fieldName,
                    value
                  )
                }
              />
            )}

            {activeTab ===
              "contact" && (
              <ContactSettings
                settings={
                  settings.contact
                }
                update={(
                  fieldName,
                  value
                ) =>
                  updateGroup(
                    "contact",
                    fieldName,
                    value
                  )
                }
              />
            )}

            {activeTab ===
              "social" && (
              <SocialSettings
                settings={
                  settings.social
                }
                update={(
                  fieldName,
                  value
                ) =>
                  updateGroup(
                    "social",
                    fieldName,
                    value
                  )
                }
              />
            )}

            {activeTab ===
              "notifications" && (
              <NotificationSettings
                settings={
                  settings.notifications
                }
                update={(
                  fieldName,
                  value
                ) =>
                  updateGroup(
                    "notifications",
                    fieldName,
                    value
                  )
                }
              />
            )}

            {activeTab ===
              "preferences" && (
              <PreferenceSettings
                settings={
                  settings.preferences
                }
                update={(
                  fieldName,
                  value
                ) =>
                  updateGroup(
                    "preferences",
                    fieldName,
                    value
                  )
                }
              />
            )}

            {activeTab ===
              "security" && (
              <SecuritySettings
                admin={
                  admin
                }
                settings={
                  settings.preferences
                }
                onLogout={
                  onLogout
                }
                onExport={
                  handleExport
                }
                onImport={() =>
                  importInputRef.current?.click()
                }
              />
            )}
          </div>
        </div>

        <aside className="cms-settings__preview">
          <header>
            <div>
              <span>
                Configuration
                preview
              </span>

              <h2>
                Website identity
              </h2>
            </div>

            <Globe2
              size={17}
            />
          </header>

          <div className="cms-settings__site-card">
            <div className="cms-settings__brand">
              <span />

              <strong>
                {settings.general
                  .siteName ||
                  "Haseeb.dev"}
              </strong>
            </div>

            <p>
              {settings.general
                .siteTagline ||
                "Portfolio website"}
            </p>

            <a
              href={
                settings.general
                  .publicUrl ||
                "/"
              }
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink
                size={13}
              />

              {settings.general
                .publicUrl ||
                "Public website"}
            </a>
          </div>

          <section className="cms-settings__preview-section">
            <header>
              <span>
                Public contact
              </span>

              <strong>
                Contact details
              </strong>
            </header>

            <PreviewRow
              icon={Mail}
              label="Email"
              value={
                settings.contact
                  .businessEmail ||
                "Not added"
              }
            />

            <PreviewRow
              icon={Phone}
              label="Phone"
              value={
                settings.contact
                  .phone ||
                "Not added"
              }
            />

            <PreviewRow
              icon={MapPin}
              label="Location"
              value={
                settings.contact
                  .location ||
                "Not added"
              }
            />

            <PreviewRow
              icon={Clock3}
              label="Response"
              value={
                settings.contact
                  .responseTime ||
                "Not added"
              }
            />
          </section>

          <section className="cms-settings__preview-section">
            <header>
              <span>
                Current session
              </span>

              <strong>
                Administrator
              </strong>
            </header>

            <div className="cms-settings__admin-card">
              <span>
                <UserRound
                  size={18}
                />
              </span>

              <div>
                <strong>
                  {admin.name}
                </strong>

                <small>
                  {admin.email}
                </small>
              </div>

              <i />
            </div>
          </section>

          <section className="cms-settings__status-list">
            <StatusRow
              label="Maintenance mode"
              enabled={
                settings.general
                  .maintenanceMode
              }
            />

            <StatusRow
              label="Message alerts"
              enabled={
                settings.notifications
                  .newMessages
              }
            />

            <StatusRow
              label="Automatic drafts"
              enabled={
                settings.preferences
                  .autoSave
              }
            />

            <StatusRow
              label="Delete confirmation"
              enabled={
                settings.preferences
                  .confirmDelete
              }
            />
          </section>
        </aside>
      </section>

      <input
        ref={
          importInputRef
        }
        className="cms-settings__hidden-input"
        type="file"
        accept=".json,application/json"
        onChange={
          handleImport
        }
      />
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| Settings section
|--------------------------------------------------------------------------
*/

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section className="cms-settings__section">
      <header>
        <span>
          <Icon
            size={16}
          />
        </span>

        <div>
          <strong>
            {title}
          </strong>

          <small>
            {description}
          </small>
        </div>
      </header>

      <div className="cms-settings__section-body">
        {children}
      </div>
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| General
|--------------------------------------------------------------------------
*/

function GeneralSettings({
  settings,
  update,
}) {
  return (
    <>
      <SettingsSection
        icon={Globe2}
        title="Website identity"
        description="Core public website information"
      >
        <div className="cms-settings__fields">
          <TextField
            label="Site name"
            value={
              settings.siteName
            }
            onChange={(
              value
            ) =>
              update(
                "siteName",
                value
              )
            }
          />

          <TextField
            label="Site tagline"
            value={
              settings.siteTagline
            }
            onChange={(
              value
            ) =>
              update(
                "siteTagline",
                value
              )
            }
          />

          <TextField
            label="Public website URL"
            type="url"
            value={
              settings.publicUrl
            }
            onChange={(
              value
            ) =>
              update(
                "publicUrl",
                value
              )
            }
            wide
          />
        </div>
      </SettingsSection>

      <SettingsSection
        icon={Clock3}
        title="Locale and formatting"
        description="Language, timezone, and date display"
      >
        <div className="cms-settings__fields">
          <SelectField
            label="Language"
            value={
              settings.language
            }
            onChange={(
              value
            ) =>
              update(
                "language",
                value
              )
            }
            options={[
              "English",
              "Urdu",
              "Arabic",
            ]}
          />

          <SelectField
            label="Timezone"
            value={
              settings.timezone
            }
            onChange={(
              value
            ) =>
              update(
                "timezone",
                value
              )
            }
            options={[
              "Asia/Karachi",
              "America/New_York",
              "America/Los_Angeles",
              "Europe/London",
              "UTC",
            ]}
          />

          <SelectField
            label="Date format"
            value={
              settings.dateFormat
            }
            onChange={(
              value
            ) =>
              update(
                "dateFormat",
                value
              )
            }
            options={[
              "MMM D, YYYY",
              "DD/MM/YYYY",
              "MM/DD/YYYY",
              "YYYY-MM-DD",
            ]}
            wide
          />
        </div>
      </SettingsSection>

      <SettingsSection
        icon={
          ShieldCheck
        }
        title="Website availability"
        description="Development and maintenance controls"
      >
        <ToggleField
          title="Maintenance mode"
          description="Store the maintenance-mode preference in the central website configuration."
          checked={
            settings.maintenanceMode
          }
          onChange={(
            checked
          ) =>
            update(
              "maintenanceMode",
              checked
            )
          }
        />
      </SettingsSection>
    </>
  );
}

/*
|--------------------------------------------------------------------------
| Contact
|--------------------------------------------------------------------------
*/

function ContactSettings({
  settings,
  update,
}) {
  return (
    <>
      <SettingsSection
        icon={Mail}
        title="Business contact"
        description="Details used across contact sections"
      >
        <div className="cms-settings__fields">
          <TextField
            label="Business email"
            type="email"
            value={
              settings.businessEmail
            }
            onChange={(
              value
            ) =>
              update(
                "businessEmail",
                value
              )
            }
          />

          <TextField
            label="Phone number"
            value={
              settings.phone
            }
            onChange={(
              value
            ) =>
              update(
                "phone",
                value
              )
            }
            placeholder="+92 ..."
          />

          <TextField
            label="Location"
            value={
              settings.location
            }
            onChange={(
              value
            ) =>
              update(
                "location",
                value
              )
            }
            wide
          />
        </div>
      </SettingsSection>

      <SettingsSection
        icon={
          MessageSquare
        }
        title="Client availability"
        description="Set expectations for new enquiries"
      >
        <div className="cms-settings__fields">
          <TextField
            label="Availability message"
            value={
              settings.availability
            }
            onChange={(
              value
            ) =>
              update(
                "availability",
                value
              )
            }
            wide
          />

          <TextField
            label="Response time"
            value={
              settings.responseTime
            }
            onChange={(
              value
            ) =>
              update(
                "responseTime",
                value
              )
            }
            wide
          />
        </div>
      </SettingsSection>
    </>
  );
}

/*
|--------------------------------------------------------------------------
| Social
|--------------------------------------------------------------------------
*/

function SocialSettings({
  settings,
  update,
}) {
  const fields = [
    [
      "github",
      "GitHub URL",
    ],

    [
      "linkedin",
      "LinkedIn URL",
    ],

    [
      "behance",
      "Behance URL",
    ],

    [
      "dribbble",
      "Dribbble URL",
    ],

    [
      "instagram",
      "Instagram URL",
    ],

    [
      "x",
      "X / Twitter URL",
    ],
  ];

  return (
    <SettingsSection
      icon={Link2}
      title="Social profiles"
      description="External links available to the website footer and contact sections"
    >
      <div className="cms-settings__fields">
        {fields.map(
          ([
            fieldName,
            label,
          ]) => (
            <TextField
              key={
                fieldName
              }
              label={
                label
              }
              type="url"
              value={
                settings[
                  fieldName
                ]
              }
              onChange={(
                value
              ) =>
                update(
                  fieldName,
                  value
                )
              }
              placeholder="https://..."
            />
          )
        )}
      </div>
    </SettingsSection>
  );
}

/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/

function NotificationSettings({
  settings,
  update,
}) {
  const fields = [
    [
      "newMessages",
      "New message alerts",
      "Show an alert when a new portfolio enquiry arrives.",
    ],

    [
      "projectUpdates",
      "Project update alerts",
      "Notify when project records are added or changed.",
    ],

    [
      "publishConfirmation",
      "Publish confirmations",
      "Require a clear confirmation before publishing website changes.",
    ],

    [
      "weeklySummary",
      "Weekly CMS summary",
      "Prepare a weekly overview of pages, projects, and messages.",
    ],

    [
      "securityAlerts",
      "Security alerts",
      "Show important session and account-security notifications.",
    ],
  ];

  return (
    <SettingsSection
      icon={Bell}
      title="Notification preferences"
      description="Choose which CMS events should get your attention"
    >
      <div className="cms-settings__toggle-list">
        {fields.map(
          ([
            fieldName,
            title,
            description,
          ]) => (
            <ToggleField
              key={
                fieldName
              }
              title={
                title
              }
              description={
                description
              }
              checked={
                settings[
                  fieldName
                ]
              }
              onChange={(
                checked
              ) =>
                update(
                  fieldName,
                  checked
                )
              }
            />
          )
        )}
      </div>
    </SettingsSection>
  );
}

/*
|--------------------------------------------------------------------------
| Preferences
|--------------------------------------------------------------------------
*/

function PreferenceSettings({
  settings,
  update,
}) {
  return (
    <>
      <SettingsSection
        icon={Laptop}
        title="Dashboard behavior"
        description="Control how the CMS behaves during editing"
      >
        <div className="cms-settings__fields">
          <SelectField
            label="Default dashboard section"
            value={
              settings.defaultSection
            }
            onChange={(
              value
            ) =>
              update(
                "defaultSection",
                value
              )
            }
            options={[
              "Dashboard",
              "Pages",
              "Projects",
              "Messages",
              "Media Library",
            ]}
          />

          <SelectField
            label="Automatic session lock"
            value={String(
              settings.autoLockMinutes
            )}
            onChange={(
              value
            ) =>
              update(
                "autoLockMinutes",
                Number(
                  value
                )
              )
            }
            options={[
              [
                "15",
                "After 15 minutes",
              ],

              [
                "30",
                "After 30 minutes",
              ],

              [
                "60",
                "After 1 hour",
              ],

              [
                "120",
                "After 2 hours",
              ],

              [
                "0",
                "Never automatically",
              ],
            ]}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        icon={Settings2}
        title="Editing preferences"
        description="Safety and convenience settings"
      >
        <div className="cms-settings__toggle-list">
          <ToggleField
            title="Automatic draft saving"
            description="Keep a local draft while editing CMS content."
            checked={
              settings.autoSave
            }
            onChange={(
              checked
            ) =>
              update(
                "autoSave",
                checked
              )
            }
          />

          <ToggleField
            title="Confirm destructive actions"
            description="Ask before deleting pages, projects, messages, or media."
            checked={
              settings.confirmDelete
            }
            onChange={(
              checked
            ) =>
              update(
                "confirmDelete",
                checked
              )
            }
          />

          <ToggleField
            title="Compact table rows"
            description="Use denser rows in supported management screens."
            checked={
              settings.compactTables
            }
            onChange={(
              checked
            ) =>
              update(
                "compactTables",
                checked
              )
            }
          />
        </div>
      </SettingsSection>
    </>
  );
}

/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
*/

function SecuritySettings({
  admin,
  settings,
  onLogout,
  onExport,
  onImport,
}) {
  return (
    <>
      <SettingsSection
        icon={UserRound}
        title="Administrator account"
        description="Current authenticated CMS session"
      >
        <div className="cms-settings__account">
          <span>
            <UserRound
              size={21}
            />
          </span>

          <div>
            <strong>
              {admin.name}
            </strong>

            <small>
              {admin.email}
            </small>
          </div>

          <i>
            <CheckCircle2
              size={13}
            />

            Authenticated
          </i>
        </div>

        <p className="cms-settings__account-note">
          Account name,
          login email, and
          password changes
          require a protected
          backend account
          endpoint. They are
          intentionally not
          stored in local
          browser settings.
        </p>
      </SettingsSection>

      <SettingsSection
        icon={KeyRound}
        title="Session security"
        description="Authentication and automatic locking"
      >
        <div className="cms-settings__security-grid">
          <div>
            <span>
              <LockKeyhole
                size={17}
              />
            </span>

            <div>
              <strong>
                Protected
                session
              </strong>

              <small>
                HTTP-only
                authentication
                cookie
              </small>
            </div>
          </div>

          <div>
            <span>
              <Clock3
                size={17}
              />
            </span>

            <div>
              <strong>
                {settings
                  .autoLockMinutes ===
                0
                  ? "No automatic lock"
                  : `${settings.autoLockMinutes} minute lock`}
              </strong>

              <small>
                Current
                dashboard
                preference
              </small>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="cms-settings__logout"
          onClick={
            onLogout
          }
        >
          <LogOut
            size={16}
          />

          Sign out of CMS
        </button>
      </SettingsSection>

      <SettingsSection
        icon={FileJson}
        title="Settings backup"
        description="Export or restore operational CMS settings"
      >
        <div className="cms-settings__backup-actions">
          <button
            type="button"
            onClick={
              onExport
            }
          >
            <Download
              size={16}
            />

            <span>
              <strong>
                Export
                settings
              </strong>

              <small>
                Download a JSON
                backup
              </small>
            </span>
          </button>

          <button
            type="button"
            onClick={
              onImport
            }
          >
            <Upload
              size={16}
            />

            <span>
              <strong>
                Import
                settings
              </strong>

              <small>
                Restore a
                previous JSON
                file
              </small>
            </span>
          </button>
        </div>
      </SettingsSection>
    </>
  );
}

/*
|--------------------------------------------------------------------------
| Input components
|--------------------------------------------------------------------------
*/

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  wide = false,
}) {
  return (
    <label
      className={`cms-settings__field ${
        wide
          ? "cms-settings__field--wide"
          : ""
      }`}
    >
      <span>
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        placeholder={
          placeholder
        }
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  wide = false,
}) {
  return (
    <label
      className={`cms-settings__field ${
        wide
          ? "cms-settings__field--wide"
          : ""
      }`}
    >
      <span>
        {label}
      </span>

      <select
        value={value}
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
      >
        {options.map(
          (option) => {
            const optionValue =
              Array.isArray(
                option
              )
                ? option[0]
                : option;

            const optionLabel =
              Array.isArray(
                option
              )
                ? option[1]
                : option;

            return (
              <option
                key={
                  optionValue
                }
                value={
                  optionValue
                }
              >
                {
                  optionLabel
                }
              </option>
            );
          }
        )}
      </select>
    </label>
  );
}

function ToggleField({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <label className="cms-settings__toggle">
      <span>
        <strong>
          {title}
        </strong>

        <small>
          {description}
        </small>
      </span>

      <input
        type="checkbox"
        checked={
          checked
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .checked
          )
        }
      />
    </label>
  );
}

/*
|--------------------------------------------------------------------------
| Stat
|--------------------------------------------------------------------------
*/

function SettingsStat({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}) {
  return (
    <article
      className={`cms-settings__stat is-${tone}`}
    >
      <span>
        <Icon
          size={19}
        />
      </span>

      <div>
        <small>
          {label}
        </small>

        <strong>
          {value}
        </strong>

        <p>
          {detail}
        </p>
      </div>
    </article>
  );
}

/*
|--------------------------------------------------------------------------
| Preview row
|--------------------------------------------------------------------------
*/

function PreviewRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="cms-settings__preview-row">
      <span>
        <Icon
          size={14}
        />
      </span>

      <div>
        <small>
          {label}
        </small>

        <strong
          title={
            value
          }
        >
          {value}
        </strong>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Status row
|--------------------------------------------------------------------------
*/

function StatusRow({
  label,
  enabled,
}) {
  return (
    <div className="cms-settings__status-row">
      <span>
        {label}
      </span>

      <strong
        className={
          enabled
            ? "is-enabled"
            : "is-disabled"
        }
      >
        {enabled
          ? "Enabled"
          : "Disabled"}
      </strong>
    </div>
  );
}