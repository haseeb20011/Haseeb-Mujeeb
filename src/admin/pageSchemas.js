const COMMON_BLOCKS = [
  {
    id: "cards",
    label: "Cards",
    selectors: [
      ".stat-item",
      ".about-card",
      ".tech-group",
      ".project-card",
      ".proj-grid2 > *",
      ".p-step",
      ".service-card",
      ".delivery-card",
      ".journey-card",
      ".principle-card",
      ".mini-card",
      ".beyond-item",
      ".contact-detail-card",
      ".contact-info-card",
    ],
  },
];

export const PAGE_SCHEMAS = {
  home: {
    label: "Home",
    sections: [
      {
        id: "home-hero",
        label: "Hero",
        selector: "#home.hero",
        blocks: [
          {
            id: "hero-stats",
            label: "Hero statistics",
            selector: ".stat-item",
          },
          {
            id: "hero-skills",
            label: "Hero skill bars",
            selector: ".code-skill",
          },
        ],
      },
      {
        id: "home-about",
        label: "About",
        selector: "section.about",
        blocks: [
          {
            id: "about-cards",
            label: "About cards",
            selector: ".about-card",
          },
          {
            id: "technology-groups",
            label: "Technology groups",
            selector: ".tech-group",
          },
        ],
      },
      {
        id: "home-projects",
        label: "Featured Projects",
        selector: "section.projects:not(.projects-page)",
        blocks: [
          {
            id: "featured-projects",
            label: "Projects",
            selector: ".proj-grid2 > *",
          },
        ],
      },
      {
        id: "home-process",
        label: "Process",
        selector: "#process.process",
        blocks: [
          {
            id: "process-steps",
            label: "Process steps",
            selector: ".p-step",
          },
        ],
      },
      {
        id: "home-opportunity",
        label: "Contact & Opportunities",
        selector: "section.opportunity",
      },
    ],
  },

  about: {
    label: "About",
    sections: [
      {
        id: "about-header",
        label: "Page Header",
        selector: "section.masthead",
      },
      {
        id: "about-profile",
        label: "About Profile",
        selector: "section.about-profile",
      },
      {
        id: "about-values",
        label: "Values",
        selector: "section.about-values",
        blocks: [
          {
            id: "value-cards",
            label: "Value cards",
            selector: ".about-value-card",
          },
        ],
      },
      {
        id: "about-journey",
        label: "Journey",
        selector: "section.about-journey",
        blocks: [
          {
            id: "journey-cards",
            label: "Journey cards",
            selector: ".journey-card",
          },
        ],
      },
      {
        id: "about-principles",
        label: "Principles",
        selector: "section.about-principles",
        blocks: [
          {
            id: "principle-cards",
            label: "Principle cards",
            selector: ".principle-card",
          },
        ],
      },
      {
        id: "about-details",
        label: "About Details",
        selector: "section.about-details",
        blocks: [
          {
            id: "personal-items",
            label: "Personal details",
            selector: ".beyond-item",
          },
        ],
      },
      {
        id: "about-final-cta",
        label: "Final Call to Action",
        selector: "section.about-final-cta",
      },
    ],
  },

  services: {
    label: "Services",
    sections: [
      {
        id: "services-header",
        label: "Page Header",
        selector: "section.masthead",
      },
      {
        id: "services-grid",
        label: "Services",
        contains: ".services-grid",
        blocks: [
          {
            id: "service-cards",
            label: "Service cards",
            selector: ".service-card",
          },
        ],
      },
      {
        id: "delivery",
        label: "Delivery Standards",
        selector: "section.delivery",
        blocks: [
          {
            id: "delivery-cards",
            label: "Delivery cards",
            selector: ".delivery-card",
          },
        ],
      },
      {
        id: "services-process",
        label: "Process",
        selector: "section.process",
        blocks: [
          {
            id: "process-steps",
            label: "Process steps",
            selector: ".p-step",
          },
        ],
      },
      {
        id: "services-cta",
        label: "Call to Action",
        selector: "section.cta-banner",
      },
    ],
  },

  portfolio: {
    label: "Portfolio",
    sections: [
      {
        id: "projects-header",
        label: "Page Header",
        selector: "section.masthead",
      },
      {
        id: "projects-archive",
        label: "Projects Archive",
        selector: "section.projects-page",
        blocks: [
          {
            id: "project-cards",
            label: "Projects",
            selector: ".proj-grid2 > *",
          },
        ],
      },
      {
        id: "academic-projects",
        label: "Academic Projects",
        contains: ".mini-grid",
        blocks: [
          {
            id: "academic-cards",
            label: "Academic project cards",
            selector: ".mini-card",
          },
        ],
      },
      {
        id: "projects-cta",
        label: "Call to Action",
        selector: "section.cta-banner",
      },
    ],
  },

  contact: {
    label: "Contact",
    sections: [
      {
        id: "contact-header",
        label: "Page Header",
        selector: "section.masthead",
      },
      {
        id: "contact-main",
        label: "Contact Content",
        selector: "section.contact",
        blocks: [
          {
            id: "contact-details",
            label: "Contact details",
            selector:
              ".contact-detail-card, .contact-info-card, .contact-item",
          },
        ],
      },
    ],
  },
};

export function getPageSchema(page) {
  const pageId =
    page?.id === "projects" ? "portfolio" : page?.id;

  return (
    PAGE_SCHEMAS[pageId] || {
      label: page?.title || "Page",
      sections: [],
      blocks: COMMON_BLOCKS,
    }
  );
}
