const mongoose = require("mongoose");

const { Schema } = mongoose;

const pageSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
    },
    template: {
      type: String,
      default: "Standard Page",
      trim: true,
    },
    inNavigation: {
      type: Boolean,
      default: true,
    },
    content: {
      type: Schema.Types.Mixed,
      default: {},
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const navigationItemSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["page", "section", "external"],
      default: "page",
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    openInNewTab: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

const seoPageSchema = new Schema(
  {
    pageKey: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    path: {
      type: String,
      default: "",
      trim: true,
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    focusKeyword: {
      type: String,
      default: "",
      trim: true,
    },
    canonicalUrl: {
      type: String,
      default: "",
      trim: true,
    },
    index: {
      type: Boolean,
      default: true,
    },
    follow: {
      type: Boolean,
      default: true,
    },
    ogTitle: {
      type: String,
      default: "",
      trim: true,
    },
    ogDescription: {
      type: String,
      default: "",
      trim: true,
    },
    ogImage: {
      type: String,
      default: "",
      trim: true,
    },
    twitterCard: {
      type: String,
      default: "summary_large_image",
      trim: true,
    },
    noIndex: {
      type: Boolean,
      default: false,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const siteConfigSchema = new Schema(
  {
    key: {
      type: String,
      default: "main",
      unique: true,
      immutable: true,
    },

    pages: {
      type: [pageSchema],
      default: [],
    },

    siteStyles: {
      type: Schema.Types.Mixed,
      default: {},
    },

    navigation: {
      type: [navigationItemSchema],
      default: [],
    },

    seo: {
      type: [seoPageSchema],
      default: [],
    },

    seoSettings: {
      siteName: {
        type: String,
        default: "Haseeb.dev",
        trim: true,
      },
      titleSeparator: {
        type: String,
        default: "—",
        trim: true,
      },
      defaultSocialImage: {
        type: String,
        default: "",
        trim: true,
      },
      sitemapEnabled: {
        type: Boolean,
        default: true,
      },
      robotsIndex: {
        type: Boolean,
        default: true,
      },
      trailingSlash: {
        type: Boolean,
        default: false,
      },
    },

    settings: {
      type: Schema.Types.Mixed,
      default: () => ({
        general: {
          siteName: "Haseeb.dev",
          siteTagline:
            "WordPress, Shopify & React Developer",
          publicUrl: "",
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
      }),
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

siteConfigSchema.statics.getDefaultConfig = function () {
  return {
    key: "main",

    pages: [
      {
        key: "home",
        title: "Home",
        slug: "/",
        status: "published",
        template: "Landing Page",
        inNavigation: true,
        content: {},
      },
      {
        key: "about",
        title: "About",
        slug: "/about",
        status: "published",
        template: "Standard Page",
        inNavigation: true,
        content: {},
      },
      {
        key: "services",
        title: "Services",
        slug: "/services",
        status: "published",
        template: "Services Page",
        inNavigation: true,
        content: {},
      },
      {
        key: "projects",
        title: "Projects",
        slug: "/projects",
        status: "published",
        template: "Portfolio Archive",
        inNavigation: true,
        content: {},
      },
      {
        key: "contact",
        title: "Contact",
        slug: "/contact",
        status: "published",
        template: "Contact Page",
        inNavigation: true,
        content: {},
      },
    ],

    navigation: [
      {
        id: "home",
        label: "Home",
        url: "/",
        type: "section",
        enabled: true,
        order: 0,
      },
      {
        id: "about",
        label: "About",
        url: "/about",
        type: "page",
        enabled: true,
        order: 1,
      },
      {
        id: "services",
        label: "Services",
        url: "/services",
        type: "page",
        enabled: true,
        order: 2,
      },
      {
        id: "projects",
        label: "Projects",
        url: "/projects",
        type: "page",
        enabled: true,
        order: 3,
      },
      {
        id: "process",
        label: "Process",
        url: "/process",
        type: "section",
        enabled: true,
        order: 4,
      },
      {
        id: "contact",
        label: "Contact",
        url: "/contact",
        type: "page",
        enabled: true,
        order: 5,
      },
    ],
  };
};

siteConfigSchema.statics.getMainConfig =
  async function () {
    let config = await this.findOne({
      key: "main",
    });

    if (!config) {
      config = await this.create(
        this.getDefaultConfig()
      );
    }

    return config;
  };

module.exports = mongoose.model(
  "SiteConfig",
  siteConfigSchema
);
