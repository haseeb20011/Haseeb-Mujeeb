export const SITE_STYLES_STORAGE_KEY =
  "portfolio-cms-site-styles";

const PREVIEW_STYLE_ID =
  "portfolio-cms-global-style-overrides";

export const DEFAULT_SITE_STYLES = {
  headingFont: "'Plus Jakarta Sans', sans-serif",
  bodyFont: "'Plus Jakarta Sans', sans-serif",

  h1Desktop: 56,
  h1Mobile: 38,

  h2Desktop: 42,
  h2Mobile: 30,

  bodyDesktop: 16,
  bodyMobile: 15,

  primaryColor: "#8B5CF6",
  accentColor: "#F5A623",
  highlightColor: "#EC4899",

  darkBackground: "#0A0A12",
  lightBackground: "#F5F5FA",

  headingColor: "#0E0E16",
  bodyColor: "#5C6270",

  contentWidth: 1240,

  sectionSpacingDesktop: 96,
  sectionSpacingMobile: 64,

  columnGapDesktop: 48,
  columnGapMobile: 24,
};

export const normalizeSiteStyles = (styles = {}) => ({
  ...DEFAULT_SITE_STYLES,
  ...styles,
});

const buildOverrideCSS = (values) => {
  const rules = [];

  /*
   * Only add overrides when a value differs from the original
   * website default. This prevents the CMS from changing the
   * current design when no custom styles have been selected.
   */

  if (
    values.headingFont !==
    DEFAULT_SITE_STYLES.headingFont
  ) {
    rules.push(`
      .ds h1,
      .ds h2,
      .ds h3,
      .ds h4,
      .ds h5,
      .ds h6 {
        font-family: var(--site-heading-font) !important;
      }
    `);
  }

  if (
    values.h1Desktop !==
      DEFAULT_SITE_STYLES.h1Desktop ||
    values.h1Mobile !== DEFAULT_SITE_STYLES.h1Mobile
  ) {
    rules.push(`
      .ds .hero h1 {
        font-size: var(--site-h1-desktop) !important;
      }

      @media (max-width: 720px) {
        .ds .hero h1 {
          font-size: var(--site-h1-mobile) !important;
        }
      }
    `);
  }

  if (
    values.h2Desktop !==
      DEFAULT_SITE_STYLES.h2Desktop ||
    values.h2Mobile !== DEFAULT_SITE_STYLES.h2Mobile
  ) {
    rules.push(`
      .ds h2 {
        font-size: var(--site-h2-desktop) !important;
      }

      @media (max-width: 720px) {
        .ds h2 {
          font-size: var(--site-h2-mobile) !important;
        }
      }
    `);
  }

  if (
    values.bodyDesktop !==
      DEFAULT_SITE_STYLES.bodyDesktop ||
    values.bodyMobile !== DEFAULT_SITE_STYLES.bodyMobile
  ) {
    rules.push(`
      .ds {
        font-size: var(--site-body-desktop) !important;
      }

      .ds .hero p.lead,
      .ds .masthead p,
      .ds .section-head p,
      .ds .about-copy p,
      .ds .process-copy p,
      .ds .cta-copy p,
      .ds .contact-copy p {
        font-size: var(--site-body-desktop) !important;
      }

      @media (max-width: 720px) {
        .ds {
          font-size: var(--site-body-mobile) !important;
        }

        .ds .hero p.lead,
        .ds .masthead p,
        .ds .section-head p,
        .ds .about-copy p,
        .ds .process-copy p,
        .ds .cta-copy p,
        .ds .contact-copy p {
          font-size: var(--site-body-mobile) !important;
        }
      }
    `);
  }

  if (
    values.contentWidth !==
    DEFAULT_SITE_STYLES.contentWidth
  ) {
    rules.push(`
      .ds .wrap {
        max-width: var(--site-content-width) !important;
      }
    `);
  }

  if (
    values.sectionSpacingDesktop !==
      DEFAULT_SITE_STYLES.sectionSpacingDesktop ||
    values.sectionSpacingMobile !==
      DEFAULT_SITE_STYLES.sectionSpacingMobile
  ) {
    rules.push(`
      .ds .main-content > section:not(.hero):not(.masthead) {
        padding-top:
          var(--site-section-spacing-desktop) !important;
        padding-bottom:
          var(--site-section-spacing-desktop) !important;
      }

      @media (max-width: 720px) {
        .ds .main-content > section:not(.hero):not(.masthead) {
          padding-top:
            var(--site-section-spacing-mobile) !important;
          padding-bottom:
            var(--site-section-spacing-mobile) !important;
        }
      }
    `);
  }

  if (
    values.columnGapDesktop !==
      DEFAULT_SITE_STYLES.columnGapDesktop ||
    values.columnGapMobile !==
      DEFAULT_SITE_STYLES.columnGapMobile
  ) {
    rules.push(`
      .ds .hero__grid,
      .ds .about-grid,
      .ds .contact-grid,
      .ds .cta-grid,
      .ds .service-detail-grid {
        column-gap:
          var(--site-column-gap-desktop) !important;
      }

      @media (max-width: 720px) {
        .ds .hero__grid,
        .ds .about-grid,
        .ds .contact-grid,
        .ds .cta-grid,
        .ds .service-detail-grid {
          column-gap:
            var(--site-column-gap-mobile) !important;
          row-gap:
            var(--site-column-gap-mobile) !important;
        }
      }
    `);
  }

  return rules.join("\n");
};

export const applySiteStyles = (
  styles = {},
  targetDocument = null
) => {
  const doc =
    targetDocument ||
    (typeof document !== "undefined" ? document : null);

  if (!doc) {
    return;
  }

  const values = normalizeSiteStyles(styles);
  const root = doc.documentElement;

  root.style.setProperty(
    "--site-heading-font",
    values.headingFont
  );

  root.style.setProperty(
    "--site-body-font",
    values.bodyFont
  );

  root.style.setProperty(
    "--site-h1-desktop",
    `${values.h1Desktop}px`
  );

  root.style.setProperty(
    "--site-h1-mobile",
    `${values.h1Mobile}px`
  );

  root.style.setProperty(
    "--site-h2-desktop",
    `${values.h2Desktop}px`
  );

  root.style.setProperty(
    "--site-h2-mobile",
    `${values.h2Mobile}px`
  );

  root.style.setProperty(
    "--site-body-desktop",
    `${values.bodyDesktop}px`
  );

  root.style.setProperty(
    "--site-body-mobile",
    `${values.bodyMobile}px`
  );

  root.style.setProperty(
    "--site-primary",
    values.primaryColor
  );

  root.style.setProperty(
    "--site-accent",
    values.accentColor
  );

  root.style.setProperty(
    "--site-highlight",
    values.highlightColor
  );

  root.style.setProperty(
    "--site-dark-background",
    values.darkBackground
  );

  root.style.setProperty(
    "--site-light-background",
    values.lightBackground
  );

  root.style.setProperty(
    "--site-heading-color",
    values.headingColor
  );

  root.style.setProperty(
    "--site-body-color",
    values.bodyColor
  );

  root.style.setProperty(
    "--site-content-width",
    `${values.contentWidth}px`
  );

  root.style.setProperty(
    "--site-section-spacing-desktop",
    `${values.sectionSpacingDesktop}px`
  );

  root.style.setProperty(
    "--site-section-spacing-mobile",
    `${values.sectionSpacingMobile}px`
  );

  root.style.setProperty(
    "--site-column-gap-desktop",
    `${values.columnGapDesktop}px`
  );

  root.style.setProperty(
    "--site-column-gap-mobile",
    `${values.columnGapMobile}px`
  );

  /*
   * Existing variables already used by the current frontend.
   */
  root.style.setProperty("--font", values.bodyFont);
  root.style.setProperty("--purple", values.primaryColor);
  root.style.setProperty("--purple-2", values.primaryColor);
  root.style.setProperty("--orange", values.accentColor);
  root.style.setProperty("--pink", values.highlightColor);
  root.style.setProperty(
    "--bg-dark",
    values.darkBackground
  );
  root.style.setProperty(
    "--bg-light",
    values.lightBackground
  );
  root.style.setProperty("--ink", values.headingColor);
  root.style.setProperty(
    "--gray-on-light",
    values.bodyColor
  );

  root.style.setProperty(
    "--grad",
    `linear-gradient(
      95deg,
      ${values.primaryColor} 0%,
      ${values.highlightColor} 45%,
      ${values.accentColor} 100%
    )`
  );

  let overrideStyle =
    doc.getElementById(PREVIEW_STYLE_ID);

  if (!overrideStyle) {
    overrideStyle = doc.createElement("style");
    overrideStyle.id = PREVIEW_STYLE_ID;
    doc.head.appendChild(overrideStyle);
  }

  overrideStyle.textContent = buildOverrideCSS(values);
};

export const loadSiteStyles = () => {
  if (typeof window === "undefined") {
    return { ...DEFAULT_SITE_STYLES };
  }

  try {
    const savedStyles = window.localStorage.getItem(
      SITE_STYLES_STORAGE_KEY
    );

    if (!savedStyles) {
      return { ...DEFAULT_SITE_STYLES };
    }

    return normalizeSiteStyles(JSON.parse(savedStyles));
  } catch {
    return { ...DEFAULT_SITE_STYLES };
  }
};

export const saveSiteStyles = (styles) => {
  const normalizedStyles =
    normalizeSiteStyles(styles);

  window.localStorage.setItem(
    SITE_STYLES_STORAGE_KEY,
    JSON.stringify(normalizedStyles)
  );

  applySiteStyles(normalizedStyles);

  return normalizedStyles;
};

export const applySavedSiteStyles = () => {
  const savedStyles = loadSiteStyles();

  applySiteStyles(savedStyles);

  return savedStyles;
};

export const resetSiteStyles = () => {
  window.localStorage.removeItem(
    SITE_STYLES_STORAGE_KEY
  );

  applySiteStyles(DEFAULT_SITE_STYLES);

  return { ...DEFAULT_SITE_STYLES };
};