const SiteConfig = require("../models/SiteConfig");

const sendValidationError = (res, error) => {
  const firstError =
    error?.errors &&
    Object.values(error.errors)[0];

  return res.status(400).json({
    success: false,
    message:
      firstError?.message ||
      error.message ||
      "Please check the submitted information.",
  });
};

const getConfigOrCreate = async () => {
  return SiteConfig.getMainConfig();
};

const getPublicSiteConfig = async (
  req,
  res,
  next
) => {
  try {
    const config = await getConfigOrCreate();

    const publishedPages = (
      config.pages || []
    ).filter(
      (page) => page.status === "published"
    );

    const navigation = (
      config.navigation || []
    )
      .filter((item) => item.enabled !== false)
      .sort(
        (a, b) =>
          Number(a.order || 0) -
          Number(b.order || 0)
      );

    const publishedPageKeys = new Set(
      publishedPages.map((page) => page.key)
    );

    const seo = (config.seo || []).filter(
      (item) =>
        publishedPageKeys.has(item.pageKey) ||
        item.pageKey === "process"
    );

    res.status(200).json({
      success: true,
      config: {
        pages: publishedPages,
        siteStyles:
          config.siteStyles || {},
        navigation,
        seo,
        seoSettings:
          config.seoSettings || {},
        settings: {
          siteName:
            config.settings?.general?.siteName ||
            config.settings?.siteName ||
            "Haseeb.dev",

          siteTagline:
            config.settings?.general?.siteTagline ||
            "",

          email:
            config.settings?.contact?.businessEmail ||
            config.settings?.email ||
            "",

          phone:
            config.settings?.contact?.phone ||
            config.settings?.phone ||
            "",

          location:
            config.settings?.contact?.location ||
            config.settings?.location ||
            "",

          availability:
            config.settings?.contact?.availability ||
            "",

          responseTime:
            config.settings?.contact?.responseTime ||
            "",

          websiteUrl:
            config.settings?.general?.publicUrl ||
            config.settings?.websiteUrl ||
            "",

          maintenanceMode:
            Boolean(
              config.settings?.general?.maintenanceMode
            ),

          socialLinks:
            config.settings?.social ||
            config.settings?.socialLinks ||
            {},
        },
        updatedAt: config.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getSiteConfig = async (
  req,
  res,
  next
) => {
  try {
    const config = await getConfigOrCreate();

    res.status(200).json({
      success: true,
      config,
    });
  } catch (error) {
    next(error);
  }
};

const updatePages = async (
  req,
  res,
  next
) => {
  try {
    const { pages } = req.body;

    if (!Array.isArray(pages)) {
      return res.status(400).json({
        success: false,
        message:
          "Pages must be provided as an array.",
      });
    }

    const config = await getConfigOrCreate();

    config.pages = pages.map(
      (page, index) => ({
        key:
          String(
            page.key ||
              page.id ||
              `page-${index + 1}`
          ).trim(),
        title:
          String(
            page.title || "Untitled Page"
          ).trim(),
        slug:
          String(
            page.slug || "/"
          ).trim(),
        status:
          page.status === "draft"
            ? "draft"
            : "published",
        template:
          String(
            page.template ||
              "Standard Page"
          ).trim(),
        inNavigation:
          page.inNavigation !== false,
        content:
          page.content &&
          typeof page.content === "object"
            ? page.content
            : {},
        updatedAt:
          page.updatedAt
            ? new Date(page.updatedAt)
            : new Date(),
      })
    );

    config.updatedBy =
      req.admin?._id || null;

    await config.save();

    res.status(200).json({
      success: true,
      message:
        "Pages saved successfully.",
      pages: config.pages,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendValidationError(res, error);
    }
    next(error);
  }
};

const updatePage = async (
  req,
  res,
  next
) => {
  try {
    const { pageKey } = req.params;

    const config = await getConfigOrCreate();

    const page = config.pages.find(
      (item) =>
        String(item.key) ===
        String(pageKey)
    );

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found.",
      });
    }

    const allowedFields = [
      "title",
      "slug",
      "status",
      "template",
      "inNavigation",
      "content",
    ];

    allowedFields.forEach((field) => {
      if (
        Object.prototype.hasOwnProperty.call(
          req.body,
          field
        )
      ) {
        page[field] = req.body[field];
      }
    });

    page.updatedAt = new Date();

    config.updatedBy =
      req.admin?._id || null;

    config.markModified("pages");

    await config.save();

    res.status(200).json({
      success: true,
      message:
        "Page updated successfully.",
      page,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendValidationError(res, error);
    }
    next(error);
  }
};

const updateSiteStyles = async (
  req,
  res,
  next
) => {
  try {
    const { siteStyles } = req.body;

    if (
      !siteStyles ||
      typeof siteStyles !== "object" ||
      Array.isArray(siteStyles)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Site styles must be provided as an object.",
      });
    }

    const config = await getConfigOrCreate();

    config.siteStyles = siteStyles;
    config.updatedBy =
      req.admin?._id || null;

    config.markModified("siteStyles");

    await config.save();

    res.status(200).json({
      success: true,
      message:
        "Site styles saved successfully.",
      siteStyles:
        config.siteStyles,
    });
  } catch (error) {
    next(error);
  }
};

const updateNavigation = async (
  req,
  res,
  next
) => {
  try {
    const { navigation } = req.body;

    if (!Array.isArray(navigation)) {
      return res.status(400).json({
        success: false,
        message:
          "Navigation must be provided as an array.",
      });
    }

    const config = await getConfigOrCreate();

    config.navigation =
      navigation.map(
        (item, index) => ({
          id: String(
            item.id ||
              `nav-${index + 1}`
          ).trim(),
          label: String(
            item.label || "Menu Item"
          ).trim(),
          url: String(
            item.url || "/"
          ).trim(),
          type: [
            "page",
            "section",
            "external",
          ].includes(item.type)
            ? item.type
            : "page",
          enabled:
            item.enabled !== false,
          openInNewTab:
            Boolean(item.openInNewTab),
          order:
            Number.isFinite(
              Number(item.order)
            )
              ? Number(item.order)
              : index,
        })
      );

    config.updatedBy =
      req.admin?._id || null;

    await config.save();

    res.status(200).json({
      success: true,
      message:
        "Navigation saved successfully.",
      navigation:
        config.navigation,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendValidationError(res, error);
    }
    next(error);
  }
};

const updateSeo = async (
  req,
  res,
  next
) => {
  try {
    const { seo, settings } = req.body;

    if (!Array.isArray(seo)) {
      return res.status(400).json({
        success: false,
        message:
          "SEO data must be provided as an array.",
      });
    }

    const config = await getConfigOrCreate();

    config.seo = seo.map(
      (item, index) => ({
        pageKey:
          String(
            item.pageKey ||
              item.id ||
              `page-${index + 1}`
          ).trim(),
        name:
          String(
            item.name || ""
          ).trim(),
        path:
          String(
            item.path || ""
          ).trim(),
        title:
          String(
            item.title || ""
          ).trim(),
        description:
          String(
            item.description || ""
          ).trim(),
        focusKeyword:
          String(
            item.focusKeyword || ""
          ).trim(),
        canonicalUrl:
          String(
            item.canonicalUrl ||
              item.canonical ||
              ""
          ).trim(),
        index:
          item.index !== false &&
          item.noIndex !== true,
        follow:
          item.follow !== false,
        ogTitle:
          String(
            item.ogTitle || ""
          ).trim(),
        ogDescription:
          String(
            item.ogDescription || ""
          ).trim(),
        ogImage:
          String(
            item.ogImage || ""
          ).trim(),
        twitterCard:
          String(
            item.twitterCard ||
              "summary_large_image"
          ).trim(),
        noIndex:
          item.noIndex === true ||
          item.index === false,
        updatedAt: new Date(),
      })
    );

    if (
      settings &&
      typeof settings === "object" &&
      !Array.isArray(settings)
    ) {
      config.seoSettings = {
        siteName:
          String(
            settings.siteName ||
              config.seoSettings?.siteName ||
              "Haseeb.dev"
          ).trim(),
        titleSeparator:
          String(
            settings.titleSeparator ||
              config.seoSettings?.titleSeparator ||
              "—"
          ).trim(),
        defaultSocialImage:
          String(
            settings.defaultSocialImage ||
              ""
          ).trim(),
        sitemapEnabled:
          settings.sitemapEnabled !== false,
        robotsIndex:
          settings.robotsIndex !== false,
        trailingSlash:
          Boolean(settings.trailingSlash),
      };
    }

    config.updatedBy =
      req.admin?._id || null;

    await config.save();

    res.status(200).json({
      success: true,
      message:
        "SEO settings saved successfully.",
      seo: config.seo,
      settings: config.seoSettings,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendValidationError(res, error);
    }
    next(error);
  }
};

const updateSettings = async (
  req,
  res,
  next
) => {
  try {
    const { settings } = req.body;

    if (
      !settings ||
      typeof settings !== "object" ||
      Array.isArray(settings)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Settings must be provided as an object.",
      });
    }

    const config = await getConfigOrCreate();

    const current =
      config.settings &&
      typeof config.settings === "object"
        ? config.settings
        : {};

    /*
     * Backward compatibility:
     * Older builds stored a flat settings object.
     * We migrate those values into the new grouped
     * CMS settings shape when the admin saves.
     */
    const legacyDefaults = {
      general: {
        siteName:
          current.general?.siteName ||
          current.siteName ||
          "Haseeb.dev",

        siteTagline:
          current.general?.siteTagline ||
          "",

        publicUrl:
          current.general?.publicUrl ||
          current.websiteUrl ||
          "",

        language:
          current.general?.language ||
          "English",

        timezone:
          current.general?.timezone ||
          "Asia/Karachi",

        dateFormat:
          current.general?.dateFormat ||
          "MMM D, YYYY",

        maintenanceMode:
          Boolean(
            current.general?.maintenanceMode
          ),
      },

      contact: {
        businessEmail:
          current.contact?.businessEmail ||
          current.email ||
          "",

        phone:
          current.contact?.phone ||
          current.phone ||
          "",

        location:
          current.contact?.location ||
          current.location ||
          "",

        availability:
          current.contact?.availability ||
          "Available for selected projects",

        responseTime:
          current.contact?.responseTime ||
          "Within one business day",
      },

      social: {
        github:
          current.social?.github ||
          current.socialLinks?.github ||
          "",

        linkedin:
          current.social?.linkedin ||
          current.socialLinks?.linkedin ||
          "",

        behance:
          current.social?.behance ||
          "",

        dribbble:
          current.social?.dribbble ||
          "",

        instagram:
          current.social?.instagram ||
          "",

        x:
          current.social?.x ||
          "",
      },

      notifications: {
        newMessages:
          current.notifications?.newMessages !== false,

        projectUpdates:
          current.notifications?.projectUpdates !== false,

        publishConfirmation:
          current.notifications?.publishConfirmation !== false,

        weeklySummary:
          Boolean(
            current.notifications?.weeklySummary
          ),

        securityAlerts:
          current.notifications?.securityAlerts !== false,
      },

      preferences: {
        defaultSection:
          current.preferences?.defaultSection ||
          "Dashboard",

        compactTables:
          Boolean(
            current.preferences?.compactTables
          ),

        confirmDelete:
          current.preferences?.confirmDelete !== false,

        autoSave:
          current.preferences?.autoSave !== false,

        autoLockMinutes:
          Number.isFinite(
            Number(
              current.preferences?.autoLockMinutes
            )
          )
            ? Number(
                current.preferences.autoLockMinutes
              )
            : 60,
      },
    };

    const groups = [
      "general",
      "contact",
      "social",
      "notifications",
      "preferences",
    ];

    const nextSettings = {
      ...legacyDefaults,
    };

    groups.forEach((group) => {
      if (
        settings[group] &&
        typeof settings[group] === "object" &&
        !Array.isArray(settings[group])
      ) {
        nextSettings[group] = {
          ...legacyDefaults[group],
          ...settings[group],
        };
      }
    });

    config.settings = nextSettings;

    config.updatedBy =
      req.admin?._id || null;

    config.markModified("settings");

    await config.save();

    res.status(200).json({
      success: true,
      message:
        "Website settings saved successfully.",
      settings: config.settings,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendValidationError(res, error);
    }

    next(error);
  }
};

const initializeSiteConfig = async (
  req,
  res,
  next
) => {
  try {
    const config =
      await SiteConfig.getMainConfig();

    res.status(200).json({
      success: true,
      message:
        "Site configuration is ready.",
      config,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicSiteConfig,
  getSiteConfig,
  updatePages,
  updatePage,
  updateSiteStyles,
  updateNavigation,
  updateSeo,
  updateSettings,
  initializeSiteConfig,
};
