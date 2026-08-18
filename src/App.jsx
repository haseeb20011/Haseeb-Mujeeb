import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowRight,
  Layers,
  Zap,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Menu,
  X,
  Compass,
  Code2,
  Send,
  CheckCircle2,
  Wrench,
  Smartphone,
  Layout,
  ShoppingBag,
  Database,
  Lightbulb,
  Plug,
  Briefcase,
  GraduationCap,
  CheckCircle,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Clock3,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ as: Tag = "div", delay = 0, className = "", children, ...rest }) {
  const [ref, visible] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`rv ${visible ? "rv--in" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      {...rest}
    >
      {children}
    </Tag>
  );
}


/* ------------------------------------------------------------------ */
/* Data — sourced from Haseeb's CV                                     */
/* ------------------------------------------------------------------ */
const NAV_LINKS = [
  { label: "Home", id: "home", type: "section" },
  { label: "About", id: "about", type: "page" },
  { label: "Services", id: "services", type: "page" },
  { label: "Projects", id: "projects", type: "page" },
  { label: "Process", id: "process", type: "section" },
  { label: "Contact", id: "contact", type: "page" },
];

const ABOUT_CARDS = [
  { icon: Code2, title: "Frontend Implementation", desc: "React and custom interfaces built from approved designs", color: "#8B5CF6" },
  { icon: Layers, title: "WordPress & CMS", desc: "Custom websites, themes, builders, and content systems", color: "#3B82F6" },
  { icon: ShoppingBag, title: "E-commerce Development", desc: "Shopify, WooCommerce, products, and checkout experiences", color: "#F5A623" },
  { icon: Zap, title: "Responsive & Performance-Minded", desc: "Reliable experiences across modern devices and browsers", color: "#22C55E" },
];

const TECH = [
  { label: "React", slug: "react", color: "61DAFB", fallback: "R" },
  { label: "JavaScript", slug: "javascript", color: "F7DF1E", fallback: "JS", darkTile: true },
  { label: "HTML5", slug: "html5", color: "E34F26", fallback: "H5" },
  { label: "CSS3", slug: "css3", color: "1572B6", fallback: "C3" },
  { label: "WordPress", slug: "wordpress", color: "21759B", fallback: "W" },
  { label: "Shopify", slug: "shopify", color: "7AB55C", fallback: "S" },
  { label: "WooCommerce", slug: "woocommerce", color: "96588A", fallback: "WC" },
  { label: "Elementor", slug: "elementor", color: "92003B", fallback: "E" },
  { label: "Webflow", slug: "webflow", color: "146EF5", fallback: "W" },
  { label: "Wix", slug: "wix", color: "0C0C0C", fallback: "WIX" },
  { label: "Squarespace", slug: "squarespace", color: "111111", fallback: "SQ" },
  { label: "Git", slug: "git", color: "F05032", fallback: "G" },
  { label: "GitHub", slug: "github", color: "181717", fallback: "GH" },
  { label: "Vite", slug: "vite", color: "646CFF", fallback: "V" },
];

const TECH_GROUPS = [
  { title: "Frontend", desc: "Component-based, responsive interfaces", items: ["React", "JavaScript", "HTML5", "CSS3"] },
  { title: "CMS & E-commerce", desc: "Editable websites and online stores", items: ["WordPress", "Shopify", "WooCommerce", "Elementor"] },
  { title: "Website Platforms", desc: "Flexible visual-development platforms", items: ["Webflow", "Wix", "Squarespace"] },
  { title: "Workflow & Delivery", desc: "Version control and modern development tooling", items: ["Git", "GitHub", "Vite"] },
];

const FILTERS = ["All", "WordPress", "Shopify", "Live", "In Development"];

const DEFAULT_PROJECTS = [
  {
    code: "HW",
    category: "WordPress",
    filters: ["WordPress", "Live"],
    projectType: "News & Media",
    title: "Holiday Weekly",
    domain: "holidayweekly.pk",
    liveUrl: "http://holidayweekly.pk/",
    status: "Live",
    statusTone: "live",
    role: "Design & Development",
    platform: "WordPress + Elementor",
    focus: "Editorial CMS architecture and content taxonomy",
    challenge: "Organize a high-volume publication without making readers or editors fight the structure.",
    solution: "Built a category-led WordPress system with modular homepage sections, archives, and mobile-first reading paths.",
    outcome: "A scalable editorial experience that supports frequent publishing and makes stories easier to discover.",
    desc: "A publishing-focused news portal for Pakistan's aviation, tourism, and hospitality sectors, built around a scalable editorial structure for frequent content updates.",
    highlight: "Editorial taxonomy · Fast mobile reading · Content discovery",
    stack: ["WordPress", "Elementor", "Editorial CMS", "Taxonomy", "Responsive"],
    details: [
      "Multi-level category and tag architecture spanning more than 20 editorial sub-sections.",
      "Homepage modules for Trending, Most Popular, and latest stories by section.",
      "Digital e-paper archive with issue-by-issue cover browsing.",
      "Newsletter opt-in plus WhatsApp and social distribution links.",
      "Responsive presentation optimized for fast mobile news reading.",
    ],
    image: "/images/projects/holiday-weekly.webp",
    accent: "#EC008C",
    badgeBg: "#EC008C",
  },
  {
    code: "JS",
    category: "WordPress",
    filters: ["WordPress", "Live"],
    projectType: "Clean Energy · Lead Generation",
    title: "Julien's Solar Solutions",
    domain: "juliensolarsolutions.com",
    liveUrl: "https://juliensolarsolutions.com/",
    status: "Live",
    statusTone: "live",
    role: "Design & Development",
    platform: "WordPress + Elementor",
    focus: "Lead capture and single-path funnel design",
    challenge: "Turn a complex solar decision into a clear path from education to quote request.",
    solution: "Created a focused page hierarchy with repeated calls to action, service clarity, trust content, and streamlined forms.",
    outcome: "A more direct lead-generation journey with fewer distractions between initial interest and enquiry.",
    desc: "A residential solar website designed to move Massachusetts homeowners from the value proposition to a quote request without unnecessary friction.",
    highlight: "Lead capture · Funnel design · Appointment conversion",
    stack: ["WordPress", "Elementor", "Forms", "Lead Generation", "Responsive"],
    details: [
      "Hero-to-form conversion flow with persistent calls to action.",
      "Six-stage installation process from consultation through activation.",
      "Service sections covering installation, maintenance, and warranty support.",
      "Testimonials and social proof positioned around the conversion journey.",
      "Promotional ticker for seasonal solar offers and messaging.",
    ],
    image: "/images/projects/juliens-solar.webp",
    accent: "#147AC2",
    badgeBg: "#0B5F9D",
  },
  {
    code: "IS",
    category: "WordPress",
    filters: ["WordPress", "Live"],
    projectType: "Hospitality · Booking",
    title: "Inspire Salon",
    domain: "inspiresalonstl.com",
    liveUrl: "http://inspiresalonstl.com/",
    status: "Live",
    statusTone: "live",
    role: "Design & Development",
    platform: "WordPress + Elementor",
    focus: "Booking integration and service-catalogue UX",
    challenge: "Connect brand presentation, service discovery, and third-party booking in one smooth journey.",
    solution: "Structured services, promotions, social proof, location details, and Meevo booking around clear guest intent.",
    outcome: "A cohesive salon experience that helps visitors move naturally from inspiration to appointment booking.",
    desc: "A warm, service-led salon website that connects browsing, promotions, social proof, and appointment booking in one consistent guest journey.",
    highlight: "Meevo booking · Service catalogue · Local conversion",
    stack: ["WordPress", "Elementor", "Meevo", "Service UX", "Responsive"],
    details: [
      "Direct connection to the Meevo salon booking and customer portal.",
      "Service catalogue organized around haircuts, color, and enhancements.",
      "Seasonal promotions bar for products and limited-time offers.",
      "Client testimonials, team content, and a visual photo gallery.",
      "Hours, location, contact, and eGift-card modules.",
    ],
    image: "/images/projects/inspire-salon.webp",
    accent: "#A77A72",
    badgeBg: "#76544E",
  },
  {
    code: "SA",
    category: "WordPress",
    filters: ["WordPress", "Live"],
    projectType: "Financial Services",
    title: "Straight Ahead Credit & Funding",
    domain: "straightaheadcreditandfunding.com",
    liveUrl: "http://straightaheadcreditandfunding.com/",
    status: "Live",
    statusTone: "live",
    role: "Design & Development",
    platform: "WordPress + Elementor",
    focus: "Lead qualification and complex form UX",
    challenge: "Explain several funding and credit services without overwhelming prospective applicants.",
    solution: "Used comparison content, trust-building sections, scheduling, and multi-step intake flows to simplify decisions.",
    outcome: "A clearer qualification journey that guides prospects toward the right consultation or application path.",
    desc: "A business-financing and credit-repair website that explains multiple funding options, builds trust, and moves qualified prospects into scheduling and application flows.",
    highlight: "Lead qualification · Funding comparison · Application intake",
    stack: ["WordPress", "Elementor", "Calendly", "Multi-step Forms", "Responsive"],
    details: [
      "Funding comparison table covering seven products and their best use cases.",
      "Embedded Calendly scheduling for funding consultations.",
      "Multi-part business, owner, and partner application intake.",
      "Credit-repair services presented through clear benefit cards.",
      "Lead-magnet popup supporting downloadable funding guidance.",
    ],
    image: "/images/projects/straight-ahead-credit.webp",
    accent: "#1577BD",
    badgeBg: "#0B4F82",
  },
  {
    code: "MD",
    category: "Shopify",
    filters: ["Shopify", "Live"],
    projectType: "E-commerce · Fashion",
    title: "Mardo",
    domain: "mardopk.com",
    liveUrl: "https://www.mardopk.com/",
    status: "Live",
    statusTone: "live",
    role: "Design & Development",
    platform: "Shopify",
    focus: "Storefront architecture and product storytelling",
    challenge: "Present technical scrubwear as a premium brand while keeping product discovery and checkout simple.",
    solution: "Organized collections, product storytelling, variants, material education, and commerce actions into one storefront.",
    outcome: "An editorial shopping experience that balances brand credibility with practical product and checkout flows.",
    desc: "A Shopify storefront for a technical medical-scrubwear label, balancing editorial presentation with clear collection browsing and checkout-ready product flows.",
    highlight: "Collection architecture · Product storytelling · Commerce UX",
    stack: ["Shopify", "E-commerce", "Collections", "Product UX", "Checkout"],
    details: [
      "Shopify collection structure across Tops, Bottoms, Sets, and Outerwear.",
      "Product detail experiences with variant selection and cart flow.",
      "Material-science section explaining the proprietary Forma 4WX fabric.",
      "Testimonials targeted to healthcare and critical-care professionals.",
      "Newsletter capture plus cart, account, and checkout-ready commerce flow.",
    ],
    image: "/images/projects/mardo.webp",
    accent: "#D8A85B",
    badgeBg: "#111111",
  },
  {
    code: "GO",
    category: "WordPress",
    filters: ["WordPress", "In Development"],
    projectType: "Agency Build · Consulting",
    title: "Go Studio",
    domain: "Staged build · Pantheon environment",
    liveUrl: "https://dev-go-studio.pantheonsite.io/",
    status: "In Development",
    statusTone: "development",
    role: "Development",
    platform: "WordPress on Pantheon",
    focus: "Consulting-brand architecture and reusable page templates",
    challenge: "Translate a growing consulting offer into a flexible website system before final production launch.",
    solution: "Built reusable page patterns, service architecture, case-study templates, and a controlled Pantheon workflow.",
    outcome: "A staged foundation that can expand consistently as the brand positioning and content are finalized.",
    desc: "An innovation-consulting brand presence being developed page by page, with a strong homepage narrative, service structure, case-study presentation, and reusable component patterns.",
    highlight: "Staged delivery · Service architecture · Case-study system",
    stack: ["WordPress", "Pantheon", "Component System", "Staging Workflow"],
    details: [
      "Consulting-brand homepage narrative and conversion structure.",
      "Service architecture designed for a growing studio offering.",
      "Case-study templates prepared for consistent future publishing.",
      "Reusable component patterns built ahead of client review.",
      "Pantheon Dev → Test → Live workflow for controlled releases.",
    ],
    image: "/images/projects/go-studio.webp",
    accent: "#FF5A36",
    badgeBg: "#C83A20",
  },
  {
    code: "DF",
    category: "WordPress",
    filters: ["WordPress", "In Development"],
    projectType: "Agency Build · Digital Services",
    title: "DGT Forge",
    domain: "Staged build · Pantheon environment",
    liveUrl: "https://dev-dgt-forge.pantheonsite.io/",
    status: "In Development",
    statusTone: "development",
    role: "Development",
    platform: "WordPress on Pantheon",
    focus: "Web, app, marketing, and SaaS service-page architecture",
    challenge: "Bring a broad agency offer together without turning the website into a disconnected list of services.",
    solution: "Created reusable service, portfolio, process, pricing, proof, and contact modules in a staged WordPress build.",
    outcome: "A coherent agency framework ready for structured review, iteration, and production release.",
    desc: "A full-service digital agency website being assembled section by section in a staged WordPress environment, with focused service, portfolio, process, pricing, and contact experiences.",
    highlight: "Agency architecture · Staged WordPress · Service positioning",
    stack: ["WordPress", "Pantheon", "Service Pages", "Git Workflow"],
    details: [
      "Structured service groups for design, development, marketing, and SaaS.",
      "Portfolio presentation with filters and featured case-study content.",
      "Process, pricing, proof, and lead-capture sections built as reusable modules.",
      "Git-based staged delivery ahead of production launch.",
      "Pantheon development environment supporting controlled client review.",
    ],
    image: "/images/projects/dgt-forge.webp",
    accent: "#2141E8",
    badgeBg: "#1024A9",
  },
  {
    code: "TK",
    category: "Web Development",
    filters: ["Live"],
    projectType: "B2B Consulting · Technology",
    title: "Teknotch",
    domain: "teknotch.com",
    liveUrl: "https://teknotch.com/",
    status: "Live",
    statusTone: "live",
    role: "Website Development",
    platform: "Responsive Web Platform",
    focus: "B2B service positioning and a clear enquiry journey",
    challenge: "Present a broad technology-consulting offer in a way that feels credible, focused, and easy for business visitors to understand.",
    solution: "Organized the website around clear service pathways, concise business messaging, trust-building content, and direct contact opportunities.",
    outcome: "A polished B2B presence that communicates the offer more clearly and gives prospective clients a straightforward route to start a conversation.",
    desc: "A professional B2B consulting website designed to present technology services clearly, strengthen brand credibility, and guide prospective clients toward the right next step.",
    highlight: "B2B positioning · Service clarity · Enquiry flow",
    stack: ["Responsive", "B2B Website", "Service UX", "Lead Generation"],
    details: [
      "Clear service-led page structure for business and consulting audiences.",
      "Responsive layouts designed for consistent presentation across devices.",
      "Trust-focused messaging and supporting content throughout the journey.",
      "Direct enquiry pathways positioned around relevant service information.",
      "Reusable content sections that support future website expansion.",
    ],
    image: "/images/projects/teknotch.webp",
    accent: "#6D5DFB",
    badgeBg: "#392FA8",
  },
];

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "" : "http://localhost:5000");

function getProjectCode(title = "") {
  return String(title)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "PR";
}

function getProjectDomain(liveUrl = "", fallback = "") {
  if (!liveUrl) return fallback;

  try {
    return new URL(liveUrl).hostname.replace(/^www\./, "");
  } catch {
    return fallback || liveUrl;
  }
}

function normalizePublicProject(project) {
  const technologies = Array.isArray(project.technologies)
    ? project.technologies
    : [];

  const storedFilters = Array.isArray(project.filters)
    ? project.filters
    : [];

  const searchablePlatform = [
    project.platform,
    project.category,
    ...technologies,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const publicStatus =
    project.publicStatus ||
    (project.statusTone === "development"
      ? "In Development"
      : "Live");

  const statusTone =
    project.statusTone ||
    (publicStatus.toLowerCase().includes("development")
      ? "development"
      : "live");

  const derivedFilters = [
    searchablePlatform.includes("wordpress")
      ? "WordPress"
      : null,
    searchablePlatform.includes("shopify")
      ? "Shopify"
      : null,
    statusTone === "development"
      ? "In Development"
      : "Live",
  ].filter(Boolean);

  const filters = Array.from(
    new Set([...storedFilters, ...derivedFilters])
  );

  return {
    id: String(project.id || project._id || project.slug),
    code: project.code || getProjectCode(project.title),
    category:
      filters.includes("Shopify")
        ? "Shopify"
        : filters.includes("WordPress")
          ? "WordPress"
          : project.category || "Web Development",
    filters,
    projectType:
      project.projectType ||
      project.category ||
      "Portfolio Project",
    title: project.title || "Untitled Project",
    domain:
      project.domain ||
      getProjectDomain(project.liveUrl, project.title),
    liveUrl: project.liveUrl || "",
    status: publicStatus,
    statusTone,
    role: project.role || "Design & Development",
    platform:
      project.platform ||
      technologies.slice(0, 2).join(" + ") ||
      "Web Development",
    focus:
      project.focus ||
      project.highlight ||
      "Responsive website implementation",
    challenge: project.challenge || "",
    solution: project.solution || "",
    outcome: project.outcome || "",
    desc: project.description || "",
    highlight:
      project.highlight ||
      project.focus ||
      "",
    stack: technologies,
    details: Array.isArray(project.details)
      ? project.details
      : [],
    image: project.image || "",
    accent: project.accent || "#8B5CF6",
    badgeBg: project.badgeBg || "#6D28D9",
    featured: Boolean(project.featured),
    caseStudyEnabled:
      project.caseStudyEnabled !== false,
  };
}

const ACADEMIC_PROJECTS = [
  {
    icon: Database,
    color: "#8B5CF6",
    title: "School Management System",
    tag: "OOP / Software Engineering",
    desc: "Object-oriented desktop application for managing academic records, enrollment, and user roles.",
  },
  {
    icon: Lightbulb,
    color: "#F5A623",
    title: "Music Rhythm LED Flasher",
    tag: "Embedded Electronics",
    desc: "Audio-reactive LED circuit built around the 555 Timer IC, syncing light pulses to music rhythm.",
  },
  {
    icon: Plug,
    color: "#22C55E",
    title: "DC Buck Converter",
    tag: "Power Electronics",
    desc: "Step-down power converter design, built as coursework in basic electronic engineering.",
  },
];

const PROCESS = [
  { n: "01", title: "Discover", desc: "Understand the goals, users, content, and technical requirements.", icon: Compass, color: "#8B5CF6" },
  { n: "02", title: "Plan", desc: "Define the structure, user experience, technology, and implementation approach.", icon: Layout, color: "#F5A623" },
  { n: "03", title: "Build", desc: "Develop the experience with clean, responsive, and maintainable code.", icon: Code2, color: "#3B82F6" },
  { n: "04", title: "Refine", desc: "Test, optimize, improve performance, and prepare a polished final handoff.", icon: CheckCircle, color: "#22C55E" },
];

const SERVICES = [
  {
    icon: Layers,
    color: "#8B5CF6",
    title: "WordPress Website Development",
    desc: "Custom WordPress builds, theme customization, and plugin configuration for a site you can keep growing.",
    tags: ["WordPress", "Gutenberg", "Plugins"],
  },
  {
    icon: ShoppingBag,
    color: "#95BF47",
    title: "Shopify Store Development",
    desc: "Shopify storefronts built for clean product presentation and a smooth path to checkout.",
    tags: ["Shopify", "Liquid", "E-commerce"],
  },
  {
    icon: Layout,
    color: "#146EF5",
    title: "Website Builder Platforms",
    desc: "Fast, design-forward builds on Wix, Webflow, and Squarespace when speed and visual polish matter most.",
    tags: ["Wix", "Webflow", "Squarespace"],
  },
  {
    icon: Wrench,
    color: "#F5A623",
    title: "Custom Theme & Builder Customization",
    desc: "Elementor, WPBakery, Divi, and Gutenberg customization matched precisely to your brand and layout.",
    tags: ["Elementor", "WPBakery", "Divi"],
  },
  {
    icon: Code2,
    color: "#EC4899",
    title: "React & Front-End Development",
    desc: "Component-based React interfaces and custom HTML, CSS, and JavaScript for responsive experiences beyond page builders.",
    tags: ["React", "JavaScript", "HTML5 / CSS3"],
  },
  {
    icon: Smartphone,
    color: "#22C55E",
    title: "Website Optimization & Responsive Design",
    desc: "Performance tuning, cross-browser testing, and full mobile responsiveness for every build I ship.",
    tags: ["Performance", "Responsive", "Cross-Browser"],
  },
];

const DELIVERY_STANDARDS = [
  {
    icon: MessageCircle,
    color: "#8B5CF6",
    title: "Clear communication",
    desc: "You get practical updates, direct answers, and a clear view of what is being built and what comes next.",
  },
  {
    icon: Smartphone,
    color: "#3B82F6",
    title: "Responsive by default",
    desc: "Layouts are checked across real screen sizes so the experience remains usable, readable, and consistent.",
  },
  {
    icon: ShieldCheck,
    color: "#22C55E",
    title: "A practical handoff",
    desc: "The finished build is organized, maintainable, and prepared for content updates, review, and future growth.",
  },
];

const PROJECT_TYPE_OPTIONS = [
  "WordPress website",
  "Shopify store",
  "React / front-end development",
  "Website redesign",
  "Performance or responsive fixes",
  "Other",
];

const BUDGET_OPTIONS = [
  "Not sure yet",
  "Under $1,000",
  "$1,000–$2,500",
  "$2,500–$5,000",
  "$5,000+",
];

const SITE_URL = "https://haseeb-mujeeb.vercel.app";

const PAGE_META = {
  home: {
    title: "Haseeb Ansari | WordPress, Shopify & React Developer",
    description: "Portfolio of Haseeb Ansari, a web developer building responsive WordPress, Shopify and React websites for businesses, agencies and growing brands.",
    path: "/",
  },
  about: {
    title: "About Haseeb Ansari | Web Developer & Engineer",
    description: "Meet Haseeb Ansari, a Karachi-based web developer and computer engineer focused on responsive design, clean implementation and reliable digital delivery.",
    path: "/about",
  },
  services: {
    title: "Web Development Services | WordPress, Shopify & React",
    description: "Professional WordPress, Shopify, React and front-end development services, including responsive builds, customizations, performance improvements and CMS work.",
    path: "/services",
  },
  projects: {
    title: "Web Development Portfolio | Haseeb Ansari",
    description: "Explore Haseeb Ansari's WordPress, Shopify and front-end development portfolio, including publishing, e-commerce, lead generation and business websites.",
    path: "/projects",
  },
  process: {
    title: "Web Development Process | Haseeb Ansari",
    description: "See Haseeb Ansari's four-step web development process: discovery, planning, responsive development, testing, optimization and polished project handoff.",
    path: "/process",
  },
  contact: {
    title: "Contact Haseeb Ansari | Start Your Web Project",
    description: "Contact Haseeb Ansari to discuss a WordPress, Shopify, React or website redesign project and receive clear next steps for your build.",
    path: "/contact",
  },
};

const ABOUT_VALUE_CARDS = [
  {
    number: "01",
    icon: Lightbulb,
    color: "#8B5CF6",
    title: "Product Thinking",
    desc: "I focus on the user experience and the business goal, not only the code behind the screen.",
  },
  {
    number: "02",
    icon: Layout,
    color: "#F5A623",
    title: "Design Awareness",
    desc: "I translate visual ideas into clean, responsive interfaces while protecting hierarchy, spacing, and usability.",
  },
  {
    number: "03",
    icon: Code2,
    color: "#3B82F6",
    title: "Technical Execution",
    desc: "From WordPress and Shopify to React and custom frontend work, I choose the right approach for each build.",
  },
  {
    number: "04",
    icon: Zap,
    color: "#22C55E",
    title: "Performance Mindset",
    desc: "Fast loading, responsive layouts, maintainable code, and dependable cross-browser behavior are part of the work.",
  },
];

const ABOUT_JOURNEY = [
  {
    year: "2022",
    title: "Started Freelancing",
    org: "Independent · Remote",
    desc: "Began building websites for businesses and clients across different industries, translating ideas into practical CMS-driven experiences.",
  },
  {
    year: "2023 — Present",
    title: "Web Developer",
    org: "JTECH Solutions · Karachi",
    desc: "Developing WordPress websites, custom interfaces, responsive layouts, CMS solutions, and production-ready client projects.",
  },
  {
    year: "Today",
    title: "Building Better Digital Experiences",
    org: "Frontend · CMS · Commerce",
    desc: "Continuing to grow across React, WordPress, Shopify, and modern web technologies while refining the quality of every build.",
  },
];

const ABOUT_PRINCIPLES = [
  {
    icon: Compass,
    color: "#8B5CF6",
    title: "Understand first",
    desc: "Every project starts with understanding the goal, audience, content, and problem that needs to be solved.",
  },
  {
    icon: Layers,
    color: "#F5A623",
    title: "Keep it intentional",
    desc: "I prefer clear hierarchy, purposeful interactions, and solutions that remain easy to update and maintain.",
  },
  {
    icon: Smartphone,
    color: "#3B82F6",
    title: "Build for real users",
    desc: "A website should look polished while also being fast, responsive, accessible, and useful on real devices.",
  },
  {
    icon: Lightbulb,
    color: "#22C55E",
    title: "Keep improving",
    desc: "The web changes constantly, so I keep learning, testing ideas, and improving how I approach development.",
  },
];

const ABOUT_PERSONAL = [
  {
    icon: Code2,
    color: "#8B5CF6",
    label: "Currently learning",
    value: "React and modern frontend development",
  },
  {
    icon: ShoppingBag,
    color: "#F5A623",
    label: "Enjoy working with",
    value: "WordPress, Shopify, and JavaScript",
  },
  {
    icon: MapPin,
    color: "#3B82F6",
    label: "Based in",
    value: "Karachi, Pakistan",
  },
];

const ABOUT_EDUCATION = {
  year: "2020 — 2024",
  title: "Bachelor of Computer Engineering",
  org: "Sir Syed University of Engineering & Technology (SSUET) · Karachi",
};

const CONTACT_INFO = [
  { icon: Mail, label: "Email", value: "haseebmujeeb360@gmail.com", href: "mailto:haseebmujeeb360@gmail.com" },
  { icon: Phone, label: "Phone", value: "+92 335 3832477", href: "tel:+923353832477" },
  { icon: MapPin, label: "Location", value: "Karachi, Pakistan", href: null },
];


/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */
function Eyebrow({ children }) {
  return <span className="eyebrow2">{children}</span>;
}

function TechBadge({ t, compact = false }) {
  const logoUrl = `https://cdn.simpleicons.org/${t.slug}/${t.color}`;
  return (
    <div className={`tech-badge ${compact ? "tech-badge--compact" : ""}`} title={t.label}>
      <span className={`tech-badge__logo ${t.darkTile ? "tech-badge__logo--dark" : ""}`}>
        <img
          src={logoUrl}
          alt={`${t.label} logo`}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.style.display = "none";
            event.currentTarget.parentElement?.classList.add("tech-badge__logo--fallback");
          }}
        />
        <b>{t.fallback}</b>
      </span>
      {!compact && <span className="tech-badge__label">{t.label}</span>}
    </div>
  );
}


function TechPill({ t }) {
  return (
    <div className="tech-pill">
      <TechBadge t={t} compact />
      <span>{t.label}</span>
    </div>
  );
}

function ProjectImage({ project, modal = false }) {
  const [failed, setFailed] = useState(false);

  if (failed || !project.image) {
    return (
      <div className={`project-image-fallback ${modal ? "project-image-fallback--modal" : ""}`} aria-label={`${project.title} project preview`}>
        <span className="project-image-fallback__code" style={{ background: project.badgeBg }}>{project.code}</span>
        <div>
          <small>Project preview</small>
          <strong>{project.title}</strong>
          <span>{project.domain}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={project.image}
      alt={`${project.title} ${modal ? "complete website screenshot" : "full-page website screenshot"}`}
      loading={modal ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

function ProjectPreview({ project }) {
  return (
    <div className="project-shot" aria-label={`${project.title} full-page website screenshot preview`}>
      <div className="project-shot__browser">
        <span className="project-shot__dots"><i /><i /><i /></span>
        <span className="project-shot__url">{project.domain || project.title}</span>
        <span className={`project-shot__status project-shot__status--${project.statusTone}`}>{project.status}</span>
      </div>
      <div className="project-shot__viewport">
        <ProjectImage project={project} />
        <span className="project-shot__hint">Scroll preview</span>
      </div>
    </div>
  );
}

function ProjectCard({ project, onOpen }) {
  return (
    <article className="pcard" style={{ "--project-accent": project.accent }}>
      <div className="pcard__img-wrap">
        <ProjectPreview project={project} />
        <span className="pcard__badge" style={{ background: project.badgeBg }}>{project.code}</span>
      </div>
      <div className="pcard__body">
        <div className="pcard__meta">
          <span>{project.projectType}</span>
          <span className={`pcard__status pcard__status--${project.statusTone}`}>{project.status}</span>
        </div>
        <h3>{project.title}</h3>
        <p>{project.desc}</p>
        {project.highlight && (
          <div className="pcard__highlight">
            <b>Focus</b>
            {project.highlight}
          </div>
        )}
        <div className="pcard__stack">
          {(project.stack || []).map((item) => <span key={item}>{item}</span>)}
        </div>
        <div className="pcard__actions">
          {project.caseStudyEnabled && (
            <button
              type="button"
              className="pcard__case"
              onClick={() => onOpen(project)}
            >
              View Case Study <ArrowRight size={14} />
            </button>
          )}

          {project.liveUrl && (
            <a
              className="pcard__live"
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${project.title} live website in a new tab`}
            >
              View Live Site <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function ProjectCaseStudy({ project, onClose, onContact }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!project || !dialogRef.current) return undefined;

    closeButtonRef.current?.focus();

    const dialog = dialogRef.current;
    const keepFocusInside = (event) => {
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialog.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute("hidden"));

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener("keydown", keepFocusInside);
    return () => dialog.removeEventListener("keydown", keepFocusInside);
  }, [project]);

  if (!project) return null;

  const storyItems = [
    { label: "Challenge", text: project.challenge, icon: Lightbulb, tone: "purple" },
    { label: "Solution", text: project.solution, icon: Wrench, tone: "orange" },
    { label: "Outcome", text: project.outcome, icon: CheckCircle2, tone: "green" },
  ].filter((item) => item.text);

  const projectDetails = Array.isArray(project.details)
    ? project.details.filter(Boolean)
    : [];

  return (
    <div
      className="project-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      aria-describedby="project-modal-description"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div ref={dialogRef} className="project-modal__dialog" style={{ "--project-accent": project.accent }}>
        <button
          ref={closeButtonRef}
          className="project-modal__close"
          type="button"
          onClick={onClose}
          aria-label="Close project case study"
        >
          <X size={20} />
        </button>

        <div className="project-modal__visual">
          <div className="project-modal__visual-heading">
            <span className="project-modal__project-code" style={{ background: project.badgeBg }}>{project.code}</span>
            <div>
              <small>Featured case study</small>
              <strong>{project.title}</strong>
            </div>
          </div>

          <div className="project-modal__browser">
            <div className="project-modal__browser-bar">
              <span className="project-shot__dots"><i /><i /><i /></span>
              <span className="project-modal__browser-url">{project.domain}</span>
              <span className="project-modal__scroll-note">Scroll preview</span>
            </div>
            <div className="project-modal__screen">
              <ProjectImage project={project} modal />
            </div>
          </div>

          <div className="project-modal__visual-footer">
            <span>{project.role}</span>
            <span>{project.platform}</span>
          </div>
        </div>

        <div className="project-modal__details">
          <div className="project-modal__content">
            <div className="project-modal__eyebrow">
              <span>{project.projectType}</span>
              <span className={`pcard__status pcard__status--${project.statusTone}`}>{project.status}</span>
            </div>

            <h2 id="project-modal-title">{project.title}</h2>
            <p id="project-modal-description" className="project-modal__lead">{project.desc}</p>

            <div className="project-modal__specs" aria-label={`${project.title} project details`}>
              <div><small>My role</small><b>{project.role}</b></div>
              <div><small>Platform</small><b>{project.platform}</b></div>
              <div><small>Primary focus</small><b>{project.focus}</b></div>
              <div><small>Project status</small><b>{project.status}</b></div>
            </div>

            {storyItems.length > 0 && (
              <>
                <div className="project-modal__section-heading">
                  <span>Project story</span>
                  <p>How the project moved from the core requirement to a practical final experience.</p>
                </div>

                <div className="project-modal__story">
                  {storyItems.map((item, index) => {
                    const StoryIcon = item.icon;
                    return (
                      <div className={`project-modal__story-item project-modal__story-item--${item.tone}`} key={item.label}>
                        <span className="project-modal__story-number">0{index + 1}</span>
                        <span className="project-modal__story-icon"><StoryIcon size={17} /></span>
                        <div>
                          <small>{item.label}</small>
                          <p>{item.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {projectDetails.length > 0 && (
              <div className="project-modal__built">
                <div className="project-modal__section-heading project-modal__section-heading--compact">
                  <span>What I built</span>
                  <p>The main implementation and experience details included in the project.</p>
                </div>
                <ul>
                  {projectDetails.map((item) => (
                    <li key={item}>
                      <span className="project-modal__check"><CheckCircle2 size={16} /></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(project.stack || []).length > 0 && (
              <div className="pcard__stack project-modal__stack" aria-label="Project technologies and capabilities">
                {(project.stack || []).map((item) => <span key={item}>{item}</span>)}
              </div>
            )}

            <div className="project-modal__actions">
              {project.liveUrl && (
                <a
                  className="btn btn-grad"
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${project.title} live website`}
                >
                  Visit Live Site <ExternalLink size={14} />
                </a>
              )}
              <button className="btn btn-outline-light" type="button" onClick={() => onContact(project)}>
                Discuss Similar Project <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Masthead({ crumb, title, subtitle, meta = [] }) {
  return (
    <section className="masthead">
      <div className="wrap">
        <Reveal className="crumb">
          <span>Haseeb.dev</span> <ChevronRight size={12} /> <b>{crumb}</b>
        </Reveal>
        <Reveal delay={60}><h1>{title}</h1></Reveal>
        <Reveal delay={110}><p>{subtitle}</p></Reveal>
        {meta.length > 0 && (
          <Reveal delay={150} className="masthead-meta">
            {meta.map((item) => {
              const MetaIcon = item.icon;
              return (
                <span key={item.label}>
                  <MetaIcon size={13} />
                  {item.label}
                </span>
              );
            })}
          </Reveal>
        )}
      </div>
    </section>
  );
}

const ROUTE_PATHS = {
  home: "/",
  about: "/about",
  services: "/services",
  projects: "/projects",
  process: "/process",
  contact: "/contact",
};

function normalizePathname(pathname = "/") {
  const normalized = pathname.trim().toLowerCase().replace(/\/+$/, "");
  return normalized || "/";
}

function getRouteFromPath(cmsPages = null) {
  if (typeof window === "undefined") {
    return {
      page: "home",
      section: "home",
      routeKey: "home",
      cmsPage: null,
    };
  }

  const path = normalizePathname(window.location.pathname);

  if (path === ROUTE_PATHS.home) {
    return { page: "home", section: "home", routeKey: "home", cmsPage: null };
  }

  if (path === ROUTE_PATHS.about) {
    return { page: "about", section: null, routeKey: "about", cmsPage: null };
  }

  if (path === ROUTE_PATHS.services) {
    return { page: "services", section: null, routeKey: "services", cmsPage: null };
  }

  if (path === ROUTE_PATHS.projects) {
    return { page: "projects", section: null, routeKey: "projects", cmsPage: null };
  }

  if (path === ROUTE_PATHS.contact) {
    return { page: "contact", section: null, routeKey: "contact", cmsPage: null };
  }

  if (path === ROUTE_PATHS.process) {
    return { page: "home", section: "process", routeKey: "process", cmsPage: null };
  }

  if (Array.isArray(cmsPages)) {
    const dynamicPage = cmsPages.find(
      (item) =>
        normalizePathname(item.slug || "/") === path
    );

    if (dynamicPage) {
      return {
        page: "cms",
        section: null,
        routeKey: dynamicPage.key,
        cmsPage: dynamicPage,
      };
    }

    return {
      page: "not-found",
      section: null,
      routeKey: "not-found",
      cmsPage: null,
    };
  }

  return {
    page: "home",
    section: "home",
    routeKey: "home",
    cmsPage: null,
  };
}

function DynamicCmsPage({
  cmsPage,
  preview = false,
  onContact,
}) {
  const content =
    cmsPage?.content &&
    typeof cmsPage.content === "object"
      ? cmsPage.content
      : {};

  const edits = preview
    ? content.builderDraft ||
      content.builderPublished ||
      {}
    : content.builderPublished || {};

  const header =
    edits["cms-page-header"]?.content || {};
  const body =
    edits["cms-page-content"]?.content || {};
  const cta =
    edits["cms-page-cta"]?.content || {};

  const title = cmsPage?.title || "Untitled Page";
  const template =
    cmsPage?.template || "Standard Page";

  const starterDescription =
    {
      "Landing Page":
        "A focused landing page ready for your message, proof, and call to action.",
      "Services Page":
        "A flexible services page ready for capabilities, process, and outcomes.",
      "Portfolio Page":
        "A portfolio page ready for selected work, results, and supporting details.",
      "Contact Page":
        "A contact page ready for enquiry details and clear next steps.",
      "Blank Page":
        "A clean starting point ready for custom content.",
    }[template] ||
    "A flexible website page ready to customize in the visual builder.";

  return (
    <>
      <section id="cms-page-header" className="masthead">
        <div className="wrap">
          <Reveal className="crumb">
            {header.eyebrow || "Haseeb.dev"}
          </Reveal>
          <Reveal delay={60}>
            <h1>{header.heading || title}</h1>
          </Reveal>
          <Reveal delay={110}>
            <p>
              {header.description ||
                starterDescription}
            </p>
          </Reveal>
        </div>
      </section>

      <section
        id="cms-page-content"
        className="sec cms-dynamic-content"
      >
        <div className="wrap">
          <Reveal className="sec-head">
            <Eyebrow>
              {body.eyebrow || template}
            </Eyebrow>
            <h2>
              {body.heading ||
                `${title} content`}
            </h2>
            <p>
              {body.description ||
                "Select this section in the visual builder to replace this starter copy with the final page content."}
            </p>
          </Reveal>
        </div>
      </section>

      <section
        id="cms-page-cta"
        className="cta-banner"
      >
        <div className="wrap cta-row">
          <div>
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "clamp(22px,3vw,30px)",
              }}
            >
              {cta.heading ||
                "Ready to start a conversation?"}
            </h2>
            <p>
              {cta.description ||
                "Tell me what you are building and I will reply with clear next steps."}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-grad"
            onClick={onContact}
          >
            {cta.primaryButton ||
              "Get In Touch"}{" "}
            <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Main App                                                             */
/* ------------------------------------------------------------------ */
export default function App() {
  const [page, setPage] = useState(() => getRouteFromPath().page); // home | about | services | projects | contact
  const [pendingScroll, setPendingScroll] = useState(() => getRouteFromPath().section);
  const [activeSection, setActiveSection] = useState(() => getRouteFromPath().section || "home");
  const [routeKey, setRouteKey] = useState(() => getRouteFromPath().routeKey);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [cmsPages, setCmsPages] = useState([]);
  const [cmsConfigLoaded, setCmsConfigLoaded] =
    useState(false);
  const [dynamicPage, setDynamicPage] =
    useState(null);

  const cmsPreview =
    typeof window !== "undefined" &&
    new URLSearchParams(
      window.location.search
    ).get("cmsPreview") === "1";

  const [form, setForm] = useState({
    name: "",
    email: "",
    projectType: "",
    budget: "",
    subject: "",
    message: "",
  });
  const [formSent, setFormSent] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [website, setWebsite] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCmsPages = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/site-config${cmsPreview ? "" : "/public"}`,
          cmsPreview
            ? { credentials: "include" }
            : undefined
        );

        const data = await response
          .json()
          .catch(() => ({}));

        if (!response.ok || data.success === false) {
          throw new Error(
            data.message ||
              "Website pages could not be loaded."
          );
        }

        const nextPages = Array.isArray(
          data.config?.pages
        )
          ? data.config.pages
          : [];

        if (!cancelled) {
          setCmsPages(nextPages);

          const route =
            getRouteFromPath(nextPages);

          setPage(route.page);
          setPendingScroll(route.section);
          setActiveSection(
            route.section ||
              (route.page === "home"
                ? "home"
                : "")
          );
          setRouteKey(route.routeKey);
          setDynamicPage(
            route.cmsPage || null
          );
          setCmsConfigLoaded(true);
        }
      } catch (error) {
        console.warn(
          "Unable to load CMS pages:",
          error
        );

        if (!cancelled) {
          setCmsConfigLoaded(true);
        }
      }
    };

    loadCmsPages();

    return () => {
      cancelled = true;
    };
  }, [cmsPreview]);

  useEffect(() => {
    let cancelled = false;

    const loadPublishedProjects = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/projects/public`
        );

        const data = await response.json();

        if (
          !response.ok ||
          data.success === false ||
          !Array.isArray(data.projects)
        ) {
          throw new Error(
            data.message ||
              "Published projects could not be loaded."
          );
        }

        if (!cancelled) {
          setProjects(
            data.projects.map(normalizePublicProject)
          );
        }
      } catch (error) {
        console.warn(
          "Using the built-in project fallback because the public Projects API is unavailable.",
          error
        );
      }
    };

    loadPublishedProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (page !== "home") return undefined;

    const updateActiveSection = () => {
      const processSection = document.getElementById("process");
      if (!processSection) {
        setActiveSection("home");
        return;
      }

      const processTop = processSection.getBoundingClientRect().top;
      setActiveSection(processTop <= window.innerHeight * 0.48 ? "process" : "home");
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [page]);

  useEffect(() => {
    const legacyHash = window.location.hash.replace(/^#\/?/, "").trim().toLowerCase();

    if (ROUTE_PATHS[legacyHash]) {
      window.history.replaceState({ route: legacyHash }, "", ROUTE_PATHS[legacyHash]);
    }

    const syncRouteFromHistory = () => {
      const route = getRouteFromPath(cmsPages);
      setMenuOpen(false);
      setSelectedProject(null);
      setPage(route.page);
      setPendingScroll(route.section);
      setActiveSection(route.section || (route.page === "home" ? "home" : ""));
      setRouteKey(route.routeKey);
      setDynamicPage(route.cmsPage || null);

      if (route.page !== "home" || !route.section) {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    };

    syncRouteFromHistory();
    window.addEventListener("popstate", syncRouteFromHistory);
    return () => window.removeEventListener("popstate", syncRouteFromHistory);
  }, [cmsPages]);

  useEffect(() => {
    const meta =
      page === "cms" && dynamicPage
        ? {
            title: `${dynamicPage.title} | Haseeb.dev`,
            description:
              dynamicPage.content?.metaDescription ||
              `Learn more about ${dynamicPage.title}.`,
            path: dynamicPage.slug,
          }
        : page === "not-found"
          ? {
              title: "Page Not Found | Haseeb.dev",
              description:
                "The requested page could not be found.",
              path: window.location.pathname,
            }
          : PAGE_META[routeKey] ||
            PAGE_META[page] ||
            PAGE_META.home;
    const canonicalUrl = `${SITE_URL}${meta.path}`;

    document.title = meta.title;

    const setMetaTag = (attribute, key, content) => {
      let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    setMetaTag("name", "description", meta.description);
    setMetaTag("property", "og:type", "website");
    setMetaTag("property", "og:site_name", "Haseeb.dev");
    setMetaTag("property", "og:title", meta.title);
    setMetaTag("property", "og:description", meta.description);
    setMetaTag("property", "og:url", canonicalUrl);
    setMetaTag("name", "twitter:card", "summary");
    setMetaTag("name", "twitter:title", meta.title);
    setMetaTag("name", "twitter:description", meta.description);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);
  }, [page, routeKey, dynamicPage]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const closeOnDesktop = () => {
      if (window.innerWidth >= 960) setMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnDesktop);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnDesktop);
    };
  }, [menuOpen]);


  useEffect(() => {
    if (page === "home" && pendingScroll) {
      const t = window.setTimeout(() => {
        const el = document.getElementById(pendingScroll);
        if (el) {
          el.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            block: "start",
          });
        }
        setPendingScroll(null);
      }, 90);

      return () => window.clearTimeout(t);
    }

    return undefined;
  }, [page, pendingScroll]);

  const navigateTo = useCallback(
    (id, type) => {
      setMenuOpen(false);
      setSelectedProject(null);

      const nextPath = ROUTE_PATHS[id] || ROUTE_PATHS.home;
      if (normalizePathname(window.location.pathname) !== nextPath || window.location.hash) {
        window.history.pushState({ route: id }, "", nextPath);
      }
      setRouteKey(id);

      if (type === "page") {
        setPendingScroll(null);
        setActiveSection(id === "home" ? "home" : "");
        setPage(id);
        window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }

      setActiveSection(id);

      if (page !== "home") {
        setPendingScroll(id);
        setPage("home");
        return;
      }

      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start",
        });
      }
    },
    [page]
  );

  const goToContact = useCallback((project) => {
    setSelectedProject(null);

    if (project?.title) {
      setForm((current) => ({
        ...current,
        projectType: project.category === "Shopify" ? "Shopify store" : "WordPress website",
        subject: `Project enquiry — inspired by ${project.title}`,
      }));
    }

    if (normalizePathname(window.location.pathname) !== ROUTE_PATHS.contact || window.location.hash) {
      window.history.pushState({ route: "contact" }, "", ROUTE_PATHS.contact);
    }

    setRouteKey("contact");
    setPage("contact");
    setPendingScroll(null);
    setActiveSection("");
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);


  useEffect(() => {
    if (!selectedProject) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedProject(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedProject]);

  const updateFormField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (formError) setFormError("");
    if (formSent) setFormSent(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (website.trim()) return; // Honeypot: silently ignore automated submissions.

    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setFormError("Please fill in your name, email, and project message.");
      setFormSent(false);
      return;
    }

    if (!emailLooksValid) {
      setFormError("Please enter a valid email address.");
      setFormSent(false);
      return;
    }

    if (form.message.trim().length < 20) {
      setFormError("Please add a little more detail so I can understand the project.");
      setFormSent(false);
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setFormSent(false);

    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          projectType: form.projectType || "Not specified",
          budget: form.budget || "Not specified",
          subject:
            form.subject.trim() ||
            "Portfolio website enquiry",
          message: form.message.trim(),
          sourceUrl:
            typeof window !== "undefined"
              ? window.location.href
              : "",
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to send your message right now.");
      }

      setFormSent(true);
      setForm({
        name: "",
        email: "",
        projectType: "",
        budget: "",
        subject: "",
        message: "",
      });
      setWebsite("");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please email me directly at haseebmujeeb360@gmail.com."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProjects =
    activeFilter === "All"
      ? projects
      : projects.filter((project) =>
          (project.filters || []).includes(activeFilter)
        );

  const featuredProjects = projects
    .filter((project) => project.featured)
    .slice(0, 4);

  return (
    <div className="ds">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap');

        :root{
          --bg-dark:#0A0A12;
          --bg-dark-2:#0D0D17;
          --bg-darkest:#07070C;
          --panel-dark:#12121D;
          --line-dark:rgba(255,255,255,0.09);
          --bg-light:#F5F5FA;
          --bg-white:#FFFFFF;
          --line-light:rgba(20,20,35,0.08);
          --ink:#0E0E16;
          --gray-on-dark:#B4B8C6;
          --gray-on-dark-2:#878C9D;
          --gray-on-light:#5C6270;
          --purple:#8B5CF6;
          --purple-2:#7C3AED;
          --orange:#F5A623;
          --pink:#EC4899;
          --blue:#3B82F6;
          --green:#22C55E;
          --grad: linear-gradient(95deg, #8B5CF6 0%, #C875E8 45%, #F5A623 100%);
          --font: 'Plus Jakarta Sans', sans-serif;
          --mono: 'JetBrains Mono', monospace;
        }
        .ds *{ box-sizing:border-box; }
        .ds{ font-family:var(--font); background:var(--bg-white); color:var(--ink); overflow-x:hidden; font-size:16px; line-height:1.5; }
        .ds img{ max-width:100%; display:block; }
        .ds a{ color:inherit; text-decoration:none; cursor:pointer; }
        .ds button,.ds input,.ds textarea,.ds select{ font:inherit; }
        .ds button{ cursor:pointer; }
        .ds button:focus-visible,.ds a:focus-visible,.ds input:focus-visible,.ds textarea:focus-visible,.ds select:focus-visible{
          outline:3px solid rgba(245,166,35,.6); outline-offset:3px;
        }
        ::selection{ background:var(--purple); color:#fff; }

        .skip-link{
          position:fixed; left:20px; top:14px; z-index:2000; transform:translateY(-160%);
          padding:10px 15px; border-radius:10px; background:#fff; color:var(--ink); font-size:13px; font-weight:800;
          box-shadow:0 16px 36px -18px rgba(0,0,0,.55); transition:transform .2s ease;
        }
        .skip-link:focus{ transform:translateY(0); }
        .main-content{ min-height:60vh; }

        .wrap{ max-width:1240px; margin:0 auto; padding:0 24px; }
        @media (min-width:900px){ .wrap{ padding:0 40px; } }

        .rv{ opacity:0; transform:translateY(24px); transition:opacity .75s cubic-bezier(.16,.8,.24,1), transform .75s cubic-bezier(.16,.8,.24,1); }
        .rv--in{ opacity:1; transform:translateY(0); }
        @media (prefers-reduced-motion:reduce){ .rv{ opacity:1; transform:none; transition:none; } }

        .eyebrow2{
          font-family:var(--mono); font-size:13px; font-weight:600; letter-spacing:.035em;
          background:linear-gradient(95deg, var(--purple), var(--pink));
          -webkit-background-clip:text; background-clip:text; color:transparent;
          display:inline-block; margin-bottom:12px;
        }

        /* ============ NAV ============ */
        .navbar{ position:fixed; top:0; left:0; right:0; z-index:200; padding:18px 0; transition:all .35s ease; }
        .navbar.scrolled{ background:rgba(10,10,18,0.82); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--line-dark); padding:12px 0; }
        .navbar__inner{ display:flex; align-items:center; justify-content:space-between; }
        .logo{ display:flex; align-items:center; gap:9px; }
        .logo__mark{ width:32px; height:32px; border-radius:9px; background:var(--grad); position:relative; flex:none; }
        .logo__mark::after{ content:''; position:absolute; inset:9px; background:#0A0A12; border-radius:4px; }
        .logo__text{ font-size:17px; font-weight:800; color:#fff; letter-spacing:-0.01em; }
        .logo__text span{ color:var(--orange); }

        .nav-links{ display:none; gap:30px; align-items:center; }
        @media (min-width:960px){ .nav-links{ display:flex; } }
        .nav-links button{ background:none; border:none; font-size:15px; font-weight:500; color:var(--gray-on-dark); position:relative; padding:4px 0; transition:color .25s ease; }
        .nav-links button.active{ color:#fff; }
        .nav-links button.active::after{ content:''; position:absolute; left:0; right:0; bottom:-14px; height:2px; background:var(--orange); border-radius:2px; }
        .nav-links button:hover{ color:#fff; }

        .nav-cta{ display:none; background:#fff; color:#0A0A12; font-size:14px; font-weight:700; padding:11px 20px; border-radius:100px; border:none; align-items:center; gap:7px; transition:transform .25s ease; }
        @media (min-width:960px){ .nav-cta{ display:inline-flex; } }
        .nav-cta:hover{ transform:translateY(-2px); }

        .nav-burger{ display:flex; background:none; border:1px solid var(--line-dark); color:#fff; border-radius:8px; padding:8px; position:relative; z-index:260; }
        @media (min-width:960px){ .nav-burger{ display:none; } }

        .mmenu{ position:fixed; inset:0; z-index:250; background:var(--bg-darkest); padding:96px 28px 40px; display:flex; flex-direction:column; transform:translateX(100%); visibility:hidden; pointer-events:none; transition:transform .45s cubic-bezier(.16,.8,.24,1),visibility 0s linear .45s; }
        .mmenu.open{ transform:translateX(0); visibility:visible; pointer-events:auto; transition-delay:0s; }
        .mmenu-close{ position:absolute; top:20px; right:20px; border:1px solid var(--line-dark); background:none; color:#fff; border-radius:8px; padding:8px; }
        .mmenu button.mlink{ background:none; border:none; text-align:left; font-size:25px; font-weight:750; color:#fff; padding:15px 0; border-bottom:1px solid var(--line-dark); }
        .mmenu .mmenu-cta{ margin-top:auto; justify-content:center; width:100%; }

        /* ============ MASTHEAD (inner pages) ============ */
        .masthead{
          background:
            radial-gradient(circle at 80% 10%, rgba(139,92,246,0.26), transparent 45%),
            radial-gradient(circle at 10% 90%, rgba(245,166,35,0.12), transparent 40%),
            var(--bg-dark);
          color:#fff; padding:150px 0 60px;
        }
        .masthead .crumb{ display:flex; align-items:center; gap:6px; font-size:13.5px; color:var(--gray-on-dark-2); margin-bottom:16px; }
        .masthead .crumb b{ color:var(--orange); font-weight:600; }
        .masthead h1{ font-size:clamp(28px,4.4vw,42px); font-weight:800; letter-spacing:-0.02em; margin:0 0 12px; }
        .masthead p{ font-size:17px; color:var(--gray-on-dark); max-width:600px; margin:0; line-height:1.75; }

        /* ============ HERO ============ */
        .hero{
          background:
            radial-gradient(circle at 78% 18%, rgba(139,92,246,0.28), transparent 42%),
            radial-gradient(circle at 12% 75%, rgba(245,166,35,0.14), transparent 40%),
            var(--bg-dark);
          color:#fff; padding:150px 0 70px; position:relative;
        }
        .hero__grid{ display:grid; grid-template-columns:1fr; gap:60px; align-items:center; }
        .hero__grid > *{ min-width:0; }
        @media (min-width:980px){ .hero__grid{ grid-template-columns:1.12fr .88fr; gap:48px; } }

        .hi-badge{ display:inline-flex; align-items:center; gap:8px; font-size:14px; color:var(--gray-on-dark); border:1px solid var(--line-dark); padding:6px 14px 6px 10px; border-radius:100px; margin-bottom:22px; }

        .hero h1{
          max-width:650px; margin:0 0 22px; font-size:clamp(46px,3.8vw,56px); font-weight:800;
          line-height:1.08; letter-spacing:-0.052em; text-wrap:balance;
        }
        .hero-title-accent{
          white-space:nowrap; background:linear-gradient(95deg, var(--orange), #F06AA8);
          -webkit-background-clip:text; background-clip:text; color:transparent;
        }
        @media (max-width:1180px) and (min-width:980px){
          .hero h1{ max-width:570px; font-size:clamp(42px,3.75vw,50px); }
        }
        @media (max-width:720px){
          .hero h1{ max-width:100%; font-size:clamp(29px,8.1vw,38px); line-height:1.1; letter-spacing:-0.045em; text-wrap:balance; }
          .hero-title-accent{ white-space:normal; }
        }

        .hero p.lead{ font-size:18px; color:var(--gray-on-dark); max-width:610px; line-height:1.78; margin:0 0 32px; }
        .hero p.lead strong{ color:#fff; font-weight:700; }

        .btn-row{ display:flex; flex-wrap:wrap; gap:14px; margin-bottom:44px; }
        .btn{ font-size:14.5px; font-weight:700; padding:14px 24px; border-radius:100px; display:inline-flex; align-items:center; gap:8px; border:1px solid transparent; transition:transform .3s cubic-bezier(.16,.8,.24,1), box-shadow .3s ease; }
        .btn-grad{ background:var(--grad); color:#fff; }
        .btn-grad:hover{ transform:translateY(-3px); box-shadow:0 16px 32px -14px rgba(139,92,246,0.55); }
        .btn-outline-dark{ background:transparent; color:#fff; border-color:var(--line-dark); }
        .btn-outline-dark:hover{ transform:translateY(-3px); border-color:#fff; }
        .btn-outline-light{ background:transparent; color:var(--ink); border-color:var(--line-light); }
        .btn-outline-light:hover{ transform:translateY(-3px); border-color:var(--ink); }
        .btn-white{ background:#fff; color:#0A0A12; }
        .btn-white:hover{ transform:translateY(-3px); box-shadow:0 16px 32px -16px rgba(0,0,0,0.4); }

        .stats-row{
          display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; width:100%; max-width:760px;
        }
        .stat-item{
          min-width:0; min-height:86px; display:grid; grid-template-columns:38px minmax(0,1fr); align-items:center;
          gap:12px; padding:14px 15px; border:1px solid var(--line-dark); border-radius:16px;
          background:linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.018));
          transition:transform .3s ease,border-color .3s ease,background .3s ease;
        }
        .stat-item:hover{ transform:translateY(-4px); border-color:rgba(139,92,246,.28); background:rgba(255,255,255,.052); }
        .stat-ic{ width:38px; height:38px; border-radius:11px; display:flex; align-items:center; justify-content:center; flex:none; }
        .stat-item > div:last-child{ min-width:0; }
        .stat-item b{ display:block; font-size:14px; line-height:1.25; font-weight:800; white-space:normal; }
        .stat-item span{ display:block; margin-top:3px; font-size:11px; line-height:1.4; color:var(--gray-on-dark); white-space:normal; overflow-wrap:normal; }
        @media (max-width:1180px) and (min-width:980px){
          .stats-row{ gap:9px; }
          .stat-item{ grid-template-columns:34px minmax(0,1fr); min-height:82px; padding:12px; gap:9px; }
          .stat-ic{ width:34px; height:34px; }
          .stat-item b{ font-size:13px; }
          .stat-item span{ font-size:10px; }
        }
        @media (max-width:720px){
          .stats-row{ grid-template-columns:1fr; gap:10px; max-width:520px; }
          .stat-item{ min-height:76px; grid-template-columns:38px minmax(0,1fr); padding:13px 14px; }
          .stat-item b{ font-size:14px; }
          .stat-item span{ font-size:11px; }
        }

        @media (max-width:720px){
          .hero{ padding:112px 0 62px; }
          .hero__grid{ gap:44px; }
          .hi-badge{ margin-bottom:18px; font-size:12.5px; }
          .hero p.lead{ max-width:none; margin-bottom:26px; font-size:16px; line-height:1.75; }
          .btn-row{ flex-direction:column; align-items:flex-start; gap:11px; margin-bottom:32px; }
          .btn-row .btn{ width:auto; max-width:100%; justify-content:center; padding:13px 20px; }
        }

        .hero__visual{ position:relative; width:100%; min-width:0; max-width:530px; margin-left:auto; }
        .code-visual{
          position:relative; width:100%; padding:18px 0 0;
        }
        .code-window{
          overflow:hidden; border:1px solid var(--line-dark); border-radius:22px;
          background:linear-gradient(145deg,rgba(16,16,27,.99),rgba(9,9,17,.99));
          box-shadow:0 54px 110px -38px rgba(0,0,0,.78);
          animation:codeWindowFloat 7s ease-in-out infinite; transform-origin:center;
        }
        .code-window__bar{
          min-height:54px; padding:0 17px; display:grid; grid-template-columns:auto 1fr auto;
          align-items:center; gap:14px; border-bottom:1px solid var(--line-dark);
          background:rgba(255,255,255,.015);
        }
        .code-window__dots{ display:flex; gap:7px; }
        .code-window__dots i{ width:10px; height:10px; border-radius:50%; }
        .code-window__path{
          justify-self:start; display:inline-flex; align-items:center; gap:8px; max-width:100%;
          padding:7px 11px; border:1px solid rgba(255,255,255,.07); border-radius:8px;
          color:#A5A7B5; background:rgba(0,0,0,.2); font-family:var(--mono); font-size:10px;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .code-window__path svg{ color:var(--orange); flex:none; }
        .code-window__availability{
          display:inline-flex; align-items:center; gap:7px; justify-self:end;
          padding:7px 10px; border:1px solid rgba(34,197,94,.17); border-radius:999px;
          color:#D9FBE5; background:rgba(34,197,94,.07); font-size:10px; font-weight:700; white-space:nowrap;
        }
        .code-window__availability::before{
          content:''; width:7px; height:7px; border-radius:50%; background:var(--green);
          box-shadow:0 0 0 4px rgba(34,197,94,.11); animation:availabilityPulse 2.1s ease-in-out infinite;
        }
        .code-window__editor{ display:grid; grid-template-columns:40px 1fr; min-height:330px; position:relative; overflow:hidden; }
        .code-window__editor::after{
          content:''; position:absolute; left:0; right:0; top:-90px; height:90px; pointer-events:none; z-index:0;
          background:linear-gradient(180deg,transparent,rgba(139,92,246,.055),transparent);
          animation:codeScan 5.6s ease-in-out infinite;
        }
        .code-window__numbers{
          padding:18px 11px; border-right:1px solid rgba(255,255,255,.045);
          color:#4F5262; font-family:var(--mono); font-size:11.5px; line-height:1.95; text-align:right;
          user-select:none; position:relative; z-index:1;
        }
        .code-window__code{
          margin:0; padding:18px 20px 22px; overflow:hidden; color:#E4E5ED;
          font-family:var(--mono); font-size:12.5px; line-height:1.95; white-space:pre-wrap; position:relative; z-index:1;
        }
        .code-window__code .kw{ color:#C084FC; }
        .code-window__code .name{ color:#FACC15; }
        .code-window__code .key{ color:#38BDF8; }
        .code-window__code .str{ color:#34D399; }
        .code-window__code .fn{ color:#F59E0B; }
        .code-window__code .muted{ color:#7D8192; }
        .code-window__footer{
          min-height:42px; padding:0 17px; display:flex; align-items:center; justify-content:space-between;
          gap:14px; border-top:1px solid var(--line-dark); color:#6F7282;
          background:rgba(255,255,255,.012); font-family:var(--mono); font-size:9.5px;
        }
        .code-window__footer span{ display:inline-flex; align-items:center; gap:7px; }
        .code-window__footer .ready-dot{ width:7px; height:7px; border-radius:50%; background:var(--green); }
        .code-skills{
          position:relative; z-index:2; margin:14px 18px 0; padding:15px;
          display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px;
          border:1px solid var(--line-dark); border-radius:17px;
          background:rgba(15,15,25,.97); box-shadow:0 25px 60px -35px rgba(0,0,0,.8);
        }
        .code-skill{ min-width:0; }
        .code-skill__top{ display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px; }
        .code-skill__top b{ min-width:0; color:#D7D8E2; font-size:10px; line-height:1.25; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .code-skill__top span{ color:#B9BBC8; font-family:var(--mono); font-size:9.5px; flex:none; }
        .code-skill__bar{ height:4px; overflow:hidden; border-radius:999px; background:rgba(255,255,255,.07); }
        .code-skill__bar i{
          display:block; height:100%; width:var(--skill-width); border-radius:inherit; background:var(--skill-gradient);
          transform:scaleX(0); transform-origin:left; animation:skillBarLoad 1.35s cubic-bezier(.16,.8,.24,1) forwards;
        }
        .code-skill:nth-child(2) .code-skill__bar i{ animation-delay:.18s; }
        .code-skill:nth-child(3) .code-skill__bar i{ animation-delay:.36s; }
        @keyframes codeWindowFloat{ 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-7px); } }
        @keyframes codeScan{ 0%,15%{ transform:translateY(0); opacity:0; } 30%{ opacity:1; } 72%{ opacity:.8; } 100%{ transform:translateY(470px); opacity:0; } }
        @keyframes availabilityPulse{ 0%,100%{ box-shadow:0 0 0 4px rgba(34,197,94,.11); } 50%{ box-shadow:0 0 0 8px rgba(34,197,94,.035); } }
        @keyframes skillBarLoad{ to{ transform:scaleX(1); } }
        @media (prefers-reduced-motion:reduce){
          .code-window,.code-window__editor::after,.code-window__availability::before,.code-skill__bar i{ animation:none; }
          .code-skill__bar i{ transform:none; }
        }
        @media (max-width:1100px){
          .hero__visual{ max-width:500px; }
          .code-window__availability{ font-size:0; width:31px; height:31px; padding:0; justify-content:center; }
          .code-window__availability::before{ margin:0; }
        }
        @media (max-width:560px){
          .hero__visual{ max-width:none; margin-left:0; }
          .code-visual{ padding-top:0; }
          .code-window{ border-radius:18px; }
          .code-window__bar{ grid-template-columns:auto minmax(0,1fr); min-height:52px; padding:0 13px; }
          .code-window__availability{ grid-column:1 / -1; justify-self:stretch; width:auto; height:auto; margin:0 0 11px; padding:7px 10px; font-size:10px; }
          .code-window__path{ justify-self:end; max-width:205px; }
          .code-window__editor{ grid-template-columns:32px 1fr; min-height:290px; }
          .code-window__numbers{ padding:15px 8px; font-size:10px; }
          .code-window__code{ padding:15px 13px 18px; font-size:10.5px; line-height:1.9; }
          .code-window__footer{ padding:0 13px; }
          .code-skills{ margin:12px 0 0; grid-template-columns:1fr; }
          .code-skill__top b{ white-space:normal; }
        }

        .scroll-cue{ display:none; text-align:center; margin-top:56px; color:var(--gray-on-dark-2); font-size:12px; }
        @media (min-width:640px){ .scroll-cue{ display:block; } }
        .scroll-cue .mouse{ width:20px; height:32px; border:2px solid var(--gray-on-dark-2); border-radius:12px; margin:0 auto 8px; position:relative; }
        .scroll-cue .mouse::after{ content:''; position:absolute; top:6px; left:50%; width:3px; height:6px; background:var(--gray-on-dark-2); border-radius:2px; transform:translateX(-50%); animation:scrolldown 1.6s ease infinite; }
        @keyframes scrolldown{ 0%{ opacity:1; transform:translate(-50%,0);} 100%{ opacity:0; transform:translate(-50%,8px);} }

        /* ============ SECTION shared ============ */
        .sec{ padding:104px 0; scroll-margin-top:72px; }
        #process{ scroll-margin-top:70px; }
        .sec-head{ margin-bottom:50px; max-width:680px; }
        @media (max-width:720px){ .sec{ padding:76px 0; } .sec-head{ margin-bottom:36px; } }
        .sec-head h2{ font-size:clamp(26px,3.6vw,38px); font-weight:800; letter-spacing:-0.02em; line-height:1.2; margin:0; }
        .sec-head p{ font-size:16.5px; color:var(--gray-on-light); margin-top:12px; line-height:1.7; }
        .sec-head--white p{ color:var(--gray-on-dark); }

        /* ============ ABOUT ============ */
        .about{ background:var(--bg-light); }
        .about__grid{ display:grid; grid-template-columns:1fr; gap:44px; margin-bottom:56px; }
        @media (min-width:960px){ .about__grid{ grid-template-columns:0.95fr 1.05fr; gap:56px; align-items:center; } }
        .about h2{ font-size:clamp(26px,3.6vw,36px); font-weight:800; line-height:1.28; letter-spacing:-0.02em; margin:0 0 16px; }
        .about h2 .link-word{ color:var(--purple-2); text-decoration:underline; text-decoration-color:rgba(124,58,237,0.35); text-underline-offset:4px; }
        .about-copy p{ font-size:16.5px; color:var(--gray-on-light); line-height:1.8; margin:0 0 26px; max-width:480px; }

        .card-grid2{ display:grid; grid-template-columns:1fr; gap:16px; }
        @media (min-width:560px){ .card-grid2{ grid-template-columns:1fr 1fr; } }
        .about-card{ background:#fff; border:1px solid var(--line-light); border-radius:16px; padding:22px 20px; transition:transform .35s cubic-bezier(.16,.8,.24,1), box-shadow .35s ease; }
        .about-card:hover{ transform:translateY(-6px); box-shadow:0 26px 48px -26px rgba(20,20,35,0.22); }
        .about-card__ic{ width:42px; height:42px; border-radius:11px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
        .about-card h4{ font-size:15.5px; font-weight:700; margin:0 0 4px; }
        .about-card p{ font-size:14px; color:var(--gray-on-light); margin:0; line-height:1.55; }

        .tech-row{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
        @media (min-width:560px){ .tech-row{ grid-template-columns:repeat(4,minmax(0,1fr)); } }
        @media (min-width:980px){ .tech-row{ grid-template-columns:repeat(8,minmax(0,1fr)); } }
        .tech-badge{ min-height:104px; background:#fff; border:1px solid var(--line-light); border-radius:15px; padding:15px 10px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; transition:transform .3s ease, box-shadow .3s ease, border-color .3s ease; }
        .tech-badge:hover{ transform:translateY(-5px); border-color:rgba(124,58,237,.2); box-shadow:0 20px 34px -22px rgba(20,20,35,0.28); }
        .tech-badge__logo{ width:45px; height:45px; border-radius:13px; background:var(--bg-light); display:flex; align-items:center; justify-content:center; position:relative; }
        .tech-badge__logo--dark{ background:#111; }
        .tech-badge__logo img{ width:27px; height:27px; object-fit:contain; }
        .tech-badge__logo b{ display:none; font-size:10px; color:var(--ink); }
        .tech-badge__logo--dark b{ color:#fff; }
        .tech-badge__logo--fallback img{ display:none; }
        .tech-badge__logo--fallback b{ display:block; }
        .tech-badge__label{ font-size:12px; font-weight:700; color:var(--gray-on-light); text-align:center; }
        .tech-badge--compact{ min-height:0; width:32px; height:32px; padding:0; border-radius:9px; gap:0; }

        .stack-intro{ display:flex; align-items:end; justify-content:space-between; gap:24px; margin:10px 0 22px; }
        .stack-intro h3{ font-size:18px; font-weight:800; margin:0; }
        .stack-intro p{ font-size:14px; color:var(--gray-on-light); margin:5px 0 0; }
        .tech-groups{ display:grid; grid-template-columns:1fr; gap:14px; }
        @media (min-width:720px){ .tech-groups{ grid-template-columns:1fr 1fr; } }
        .tech-group{ background:#fff; border:1px solid var(--line-light); border-radius:16px; padding:20px; }
        .tech-group__head{ margin-bottom:14px; }
        .tech-group__head h4{ font-size:15px; font-weight:800; margin:0 0 4px; }
        .tech-group__head p{ font-size:13.5px; color:var(--gray-on-light); line-height:1.55; margin:0; }
        .tech-group__items{ display:flex; flex-wrap:wrap; gap:9px; }
        .tech-pill{ display:inline-flex; align-items:center; gap:8px; min-height:40px; padding:4px 11px 4px 5px; border:1px solid var(--line-light); border-radius:11px; background:var(--bg-light); transition:transform .25s ease, border-color .25s ease, background .25s ease; }
        .tech-pill:hover{ transform:translateY(-2px); border-color:rgba(124,58,237,.22); background:#fff; }
        .tech-pill .tech-badge{ width:30px; height:30px; min-height:0; padding:0; border:none; border-radius:8px; background:#fff; box-shadow:none; }
        .tech-pill .tech-badge:hover{ transform:none; box-shadow:none; }
        .tech-pill .tech-badge__logo{ width:23px; height:23px; border-radius:6px; }
        .tech-pill .tech-badge__logo img{ width:15px; height:15px; }
        .tech-pill > span{ font-size:12px; font-weight:700; color:#3C3E49; }

        /* ============ PREMIUM ABOUT PAGE ============ */
        .masthead-meta{ display:flex; align-items:center; flex-wrap:wrap; gap:10px; margin-top:22px; }
        .masthead-meta span{ display:inline-flex; align-items:center; gap:7px; min-height:36px; padding:8px 13px; border:1px solid var(--line-dark); border-radius:100px; background:rgba(255,255,255,.035); color:#D7DAE4; font-size:12.5px; font-weight:650; }
        .masthead-meta span:last-child{ color:#D8FBE5; }
        .masthead-meta span:last-child svg{ color:var(--green); }

        .about-profile{ background:var(--bg-light); }
        .about-profile__grid{ display:grid; grid-template-columns:1fr; gap:42px; align-items:center; }
        @media (min-width:960px){ .about-profile__grid{ grid-template-columns:1.02fr .98fr; gap:66px; } }
        .about-photo{ position:relative; max-width:650px; }
        .about-photo__frame{ position:relative; overflow:hidden; border-radius:24px; background:#12121D; border:1px solid var(--line-light); box-shadow:0 40px 90px -48px rgba(10,10,20,.42); }
        .about-photo__frame::after{ content:''; position:absolute; inset:auto 0 0; height:42%; background:linear-gradient(180deg,transparent,rgba(8,8,14,.82)); pointer-events:none; }
        .about-photo__frame img{ width:100%; aspect-ratio:1.2/1; object-fit:cover; object-position:center 44%; }
        .about-photo__caption{ position:absolute; left:22px; right:22px; bottom:20px; z-index:2; display:flex; align-items:flex-end; justify-content:space-between; gap:18px; }
        .about-photo__caption b{ display:block; color:#fff; font-size:15.5px; margin-bottom:4px; }
        .about-photo__caption span{ color:#C0C4D0; font-size:12.5px; }
        .about-photo__signal{ display:inline-flex; align-items:center; gap:7px; padding:8px 11px; border:1px solid rgba(255,255,255,.1); border-radius:100px; background:rgba(8,8,14,.62); backdrop-filter:blur(12px); color:#D8FBE5 !important; font-size:11px !important; font-weight:700; white-space:nowrap; }
        .about-photo__signal::before{ content:''; width:7px; height:7px; border-radius:50%; background:var(--green); box-shadow:0 0 0 5px rgba(34,197,94,.12); }
        .about-photo__badge{ position:absolute; right:-14px; top:28px; z-index:3; display:flex; align-items:center; gap:10px; min-width:170px; padding:13px 15px; border-radius:15px; background:#fff; border:1px solid var(--line-light); box-shadow:0 24px 52px -27px rgba(20,20,35,.32); }
        .about-photo__badge-icon{ width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:rgba(139,92,246,.12); color:var(--purple-2); flex:none; }
        .about-photo__badge small{ display:block; color:var(--gray-on-light); font-size:11.5px; margin-bottom:2px; }
        .about-photo__badge b{ font-size:13.5px; }
        .about-story .eyebrow2{ margin-bottom:14px; }
        .about-story h2{ font-size:clamp(30px,4.2vw,46px); line-height:1.12; letter-spacing:-.035em; margin:0 0 22px; max-width:600px; }
        .about-story p{ font-size:16.5px; line-height:1.85; color:var(--gray-on-light); margin:0 0 17px; max-width:590px; }
        .about-story__highlight{ margin:26px 0 30px; padding:18px 20px; border-left:3px solid var(--purple-2); border-radius:0 13px 13px 0; background:#fff; color:#343642; font-size:15px; line-height:1.7; }

        .about-values{ background:#fff; }
        .about-value-grid{ display:grid; grid-template-columns:1fr; gap:16px; }
        @media (min-width:680px){ .about-value-grid{ grid-template-columns:1fr 1fr; } }
        @media (min-width:1040px){ .about-value-grid{ grid-template-columns:repeat(4,1fr); } }
        .about-value-card{ position:relative; overflow:hidden; min-height:250px; border:1px solid var(--line-light); border-radius:19px; padding:26px 22px; background:#fff; transition:transform .35s cubic-bezier(.16,.8,.24,1),box-shadow .35s ease,border-color .35s ease; }
        .about-value-card::before{ content:''; position:absolute; inset:0 0 auto; height:3px; background:var(--value-color); }
        .about-value-card:hover{ transform:translateY(-7px); border-color:rgba(124,58,237,.17); box-shadow:0 30px 58px -34px rgba(20,20,35,.28); }
        .about-value-card__top{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:34px; }
        .about-value-card__icon{ width:45px; height:45px; border-radius:13px; display:flex; align-items:center; justify-content:center; background:color-mix(in srgb,var(--value-color) 13%,transparent); }
        .about-value-card__num{ font-family:var(--mono); color:var(--value-color); font-size:12px; font-weight:700; }
        .about-value-card h3{ font-size:17.5px; margin:0 0 10px; }
        .about-value-card p{ font-size:14.5px; line-height:1.75; color:var(--gray-on-light); margin:0; }

        .about-journey{ background:var(--bg-light); }
        .journey-grid{ display:grid; grid-template-columns:1fr; gap:0; position:relative; }
        @media (min-width:860px){ .journey-grid{ grid-template-columns:repeat(3,1fr); gap:24px; } }
        @media (min-width:860px){ .journey-grid::before{ content:''; position:absolute; left:0%; right:30%; top:28px; height:1px; background:linear-gradient(90deg,rgba(139,92,246,.25),rgba(245,166,35,.25),rgba(34,197,94,.25)); } }
        .journey-card{ position:relative; padding:0 0 34px 40px; }
        .journey-card:last-child{ padding-bottom:0; }
        .journey-card::before{ content:''; position:absolute; left:9px; top:34px; bottom:0; width:1px; background:var(--line-light); }
        .journey-card:last-child::before{ display:none; }
        @media (min-width:860px){ .journey-card{ padding:0; z-index:1; } .journey-card::before{ display:none; } }
        .journey-card__dot{ position:absolute; left:0; top:20px; width:20px; height:20px; border-radius:50%; background:#fff; border:4px solid var(--journey-color); box-shadow:0 0 0 6px var(--bg-light); display:flex; align-items:center; justify-content:center; color:var(--journey-color); }
        .journey-card__dot svg{ display:none; }
        @media (min-width:860px){
          .journey-card__dot{ position:relative; left:auto; top:auto; width:54px; height:54px; border-radius:16px; display:flex; align-items:center; justify-content:center; margin-bottom:22px; border:1px solid var(--line-light); background:#fff; box-shadow:0 18px 38px -25px rgba(20,20,35,.26); color:var(--journey-color); }
          .journey-card__dot svg{ display:block; }
        }
        .journey-card__year{ display:inline-block; font-family:var(--mono); font-size:11.5px; color:var(--journey-color); font-weight:700; margin-bottom:9px; }
        .journey-card h3{ font-size:17.5px; line-height:1.35; margin:0 0 5px; }
        .journey-card__org{ font-size:13px; color:var(--gray-on-light); margin-bottom:12px; }
        .journey-card p{ font-size:14.5px; color:var(--gray-on-light); line-height:1.75; margin:0; max-width:330px; }

        .about-principles{ background:var(--bg-dark); color:#fff; position:relative; overflow:hidden; }
        .about-principles::before{ content:''; position:absolute; width:480px; height:480px; border-radius:50%; right:-180px; top:-250px; background:radial-gradient(circle,rgba(139,92,246,.22),transparent 68%); }
        .principle-grid{ display:grid; grid-template-columns:1fr; gap:14px; position:relative; z-index:1; }
        @media (min-width:680px){ .principle-grid{ grid-template-columns:1fr 1fr; } }
        .principle-card{ display:grid; grid-template-columns:auto 1fr; gap:16px; align-items:start; padding:24px; border:1px solid var(--line-dark); border-radius:17px; background:rgba(255,255,255,.025); }
        .principle-card__icon{ width:44px; height:44px; border-radius:13px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.05); }
        .principle-card h3{ font-size:15.5px; margin:2px 0 7px; }
        .principle-card p{ color:var(--gray-on-dark); font-size:14.5px; line-height:1.7; margin:0; }

        .about-details{ background:#fff; }
        .about-details__grid{ display:grid; grid-template-columns:1fr; gap:22px; }
        @media (min-width:900px){ .about-details__grid{ grid-template-columns:.78fr 1.22fr; gap:26px; align-items:stretch; } }
        .education-card{ border:1px solid var(--line-light); border-radius:20px; padding:28px; background:var(--bg-light); position:relative; overflow:hidden; }
        .education-card::after{ content:''; position:absolute; width:170px; height:170px; border-radius:50%; right:-70px; bottom:-90px; background:radial-gradient(circle,rgba(139,92,246,.16),transparent 70%); }
        .education-card__icon{ width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; background:rgba(139,92,246,.13); color:var(--purple-2); margin-bottom:34px; }
        .education-card__year{ font-family:var(--mono); font-size:11.5px; font-weight:700; color:var(--purple-2); }
        .education-card h3{ font-size:21px; line-height:1.35; margin:9px 0 8px; max-width:340px; }
        .education-card p{ font-size:14.5px; color:var(--gray-on-light); line-height:1.7; margin:0; max-width:390px; }
        .beyond-card{ border:1px solid var(--line-light); border-radius:20px; padding:28px; background:#fff; }
        .beyond-card h2{ font-size:25px; margin:0 0 12px; }
        .beyond-card > p{ color:var(--gray-on-light); font-size:15px; line-height:1.75; max-width:680px; margin:0 0 24px; }
        .beyond-grid{ display:grid; grid-template-columns:1fr; gap:12px; }
        @media (min-width:620px){ .beyond-grid{ grid-template-columns:repeat(3,1fr); } }
        .beyond-item{ padding:17px; border:1px solid var(--line-light); border-radius:14px; background:var(--bg-light); }
        .beyond-item__icon{ width:37px; height:37px; border-radius:11px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; background:color-mix(in srgb,var(--beyond-color) 13%,transparent); }
        .beyond-item small{ display:block; font-size:10.5px; color:var(--gray-on-light); text-transform:uppercase; letter-spacing:.055em; font-weight:700; margin-bottom:5px; }
        .beyond-item b{ font-size:14px; line-height:1.5; display:block; }

        .about-final-cta{ background:var(--bg-darkest); color:#fff; padding:76px 0; position:relative; overflow:hidden; }
        .about-final-cta::after{ content:''; position:absolute; inset:0; background:radial-gradient(circle at 86% 40%,rgba(139,92,246,.25),transparent 42%); }
        .about-final-cta__inner{ position:relative; z-index:1; display:flex; flex-direction:column; align-items:flex-start; justify-content:space-between; gap:28px; }
        @media (min-width:840px){ .about-final-cta__inner{ flex-direction:row; align-items:center; } }
        .about-final-cta h2{ font-size:clamp(29px,4vw,42px); line-height:1.15; letter-spacing:-.03em; margin:0 0 10px; }
        .about-final-cta p{ color:var(--gray-on-dark); font-size:15px; line-height:1.7; margin:0; width:600px; }
        @media screen and (max-width: 767px) {
        .about-final-cta p{ width:100%; }
        }

        @media (max-width:700px){
          .about-photo__badge{ position:relative; right:auto; top:auto; margin:-18px 14px 0; }
          .about-photo__frame img{ aspect-ratio:1/1; object-position:54% 45%; }
          .about-photo__caption{ left:16px; right:16px; bottom:16px; }
          .about-photo__signal{ display:none; }
          .about-story h2{ font-size:31px; }
        }

        /* ============ PROJECTS ============ */
        .projects{ background:#fff; }

        .filter-row{ display:flex; flex-wrap:wrap; gap:10px; margin:0; }
        .filter-pill{ position:relative; overflow:hidden; font-size:13.5px; font-weight:750; padding:10px 17px; border-radius:100px; border:1px solid rgba(20,20,35,.09); background:#fff; color:var(--gray-on-light); transition:transform .25s ease,border-color .25s ease,color .25s ease,background .25s ease,box-shadow .25s ease; }
        .filter-pill::before{ content:''; position:absolute; inset:0; background:linear-gradient(105deg,rgba(139,92,246,.09),rgba(245,166,35,.08)); opacity:0; transition:opacity .25s ease; }
        .filter-pill span{ position:relative; z-index:1; }
        .filter-pill.active{ background:var(--purple-2); color:#fff; border-color:var(--purple-2); box-shadow:0 12px 28px -16px rgba(124,58,237,.85); }
        .filter-pill:hover:not(.active){ transform:translateY(-2px); border-color:rgba(124,58,237,.34); color:var(--purple-2); box-shadow:0 12px 24px -20px rgba(20,20,35,.35); }
        .filter-pill:hover:not(.active)::before{ opacity:1; }

        .proj-grid2{ display:grid; grid-template-columns:1fr; gap:26px; margin-bottom:44px; align-items:stretch; }
        @media (min-width:820px){ .proj-grid2{ grid-template-columns:repeat(2,minmax(0,1fr)); gap:28px; } }
        .proj-grid2 > .rv{ min-width:0; height:100%; }
        .proj-grid2 > .rv > .pcard{ height:100%; }

        .pcard{ min-width:0; border-radius:20px; overflow:hidden; border:1px solid var(--line-light); background:#fff; display:flex; flex-direction:column; transition:transform .4s cubic-bezier(.16,.8,.24,1), box-shadow .4s ease, border-color .35s ease; }
        .pcard:hover{ transform:translateY(-7px); border-color:rgba(124,58,237,.2); box-shadow:0 38px 70px -34px rgba(20,20,35,.3); }
        .pcard__img-wrap{ position:relative; height:310px; overflow:hidden; background:#0C0D14; padding:14px; }
        .pcard__badge{ position:absolute; left:22px; bottom:20px; min-width:44px; height:44px; padding:0 10px; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:10.5px; font-weight:800; box-shadow:0 13px 28px -10px rgba(0,0,0,.45); z-index:4; }
        .pcard__body{ padding:32px 22px 23px; display:flex; flex-direction:column; flex:1; }
        .pcard__meta{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:9px; }
        .pcard__meta > span:first-child{ font-family:var(--mono); font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--purple-2); }
        .pcard__status{ display:inline-flex; align-items:center; gap:6px; font-size:10.5px; font-weight:800; padding:5px 8px; border-radius:100px; white-space:nowrap; }
        .pcard__status::before{ content:''; width:6px; height:6px; border-radius:50%; }
        .pcard__status--live{ color:#14723C; background:#ECFDF3; border:1px solid #CEF2DC; }
        .pcard__status--live::before{ background:#22C55E; }
        .pcard__status--development{ color:#9A5500; background:#FFF7E8; border:1px solid #F5DFC1; }
        .pcard__status--development::before{ background:#F5A623; }
        .pcard__body h3{ font-size:20px; font-weight:800; margin:0 0 9px; line-height:1.32; letter-spacing:-.015em; }
        .pcard__body > p{ font-size:15px; color:var(--gray-on-light); margin:0 0 15px; line-height:1.72; }
        .pcard__highlight{ font-size:12.5px; color:#4B4E5C; border-left:2px solid var(--purple-2); padding-left:10px; margin:0 0 15px; line-height:1.6; }
        .pcard__highlight b{ display:block; color:var(--ink); font-size:10.5px; text-transform:uppercase; letter-spacing:.065em; margin-bottom:2px; }
        .pcard__stack{ display:flex; flex-wrap:wrap; gap:6px; }
        .pcard__stack span{ font-size:11.5px; font-weight:650; color:var(--gray-on-light); border:1px solid var(--line-light); padding:5px 8px; border-radius:7px; background:var(--bg-light); }
        .pcard__actions{ display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; border-top:1px solid var(--line-light); padding-top:17px; margin-top:12px; }
        .pcard__actions button,.pcard__actions a{ display:inline-flex; align-items:center; gap:7px; font-size:13px; font-weight:800; background:none; border:none; padding:0; }
        .pcard__case{ color:var(--purple-2); }
        .pcard__live{ color:#14723C; }
        .pcard__actions button svg,.pcard__actions a svg{ transition:transform .25s ease; }
        .pcard__actions button:hover svg,.pcard__actions a:hover svg{ transform:translate(2px,-1px); }
        .pcard__actions button:hover{ color:var(--purple-2); }
        .pcard__actions a:hover{ color:#0F5F33; }

        /* Projects archive — consistent cards, smoother motion, and stronger hierarchy */
        .projects-page{
          position:relative; overflow:hidden;
          background:
            radial-gradient(circle at 9% 8%,rgba(139,92,246,.065),transparent 25%),
            radial-gradient(circle at 94% 42%,rgba(245,166,35,.055),transparent 24%),
            linear-gradient(180deg,#FFFFFF 0%,#FBFAFF 52%,#FFFFFF 100%);
        }
        .projects-page::before{
          content:''; position:absolute; inset:0; pointer-events:none; opacity:.55;
          background-image:linear-gradient(rgba(20,20,35,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(20,20,35,.022) 1px,transparent 1px);
          background-size:42px 42px; mask-image:linear-gradient(to bottom,black,transparent 72%);
        }
        .projects-page .wrap{ position:relative; z-index:1; }
        .projects-toolbar{
          display:flex; flex-direction:column; align-items:flex-start; justify-content:space-between; gap:20px;
          margin-bottom:34px; padding:18px 20px; border:1px solid rgba(20,20,35,.075); border-radius:20px;
          background:rgba(255,255,255,.84); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
          box-shadow:0 22px 55px -42px rgba(20,20,35,.38);
        }
        .projects-toolbar__summary{ display:flex; align-items:center; gap:12px; white-space:nowrap; }
        .projects-toolbar__summary::before{ content:''; width:9px; height:9px; border-radius:50%; background:var(--green); box-shadow:0 0 0 5px rgba(34,197,94,.1); }
        .projects-toolbar__summary span{ font-family:var(--mono); font-size:11px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:var(--gray-on-light); }
        .projects-toolbar__summary strong{ font-size:13px; color:var(--ink); }
        @media (min-width:760px){
          .projects-toolbar{ flex-direction:row; align-items:center; }
          .projects-toolbar .filter-row{ justify-content:flex-end; }
        }
        @media (max-width:759px){
          .projects-toolbar{ padding:16px; }
          .projects-toolbar .filter-row{ width:100%; flex-wrap:nowrap; overflow-x:auto; padding:2px 2px 7px; scrollbar-width:none; }
          .projects-toolbar .filter-row::-webkit-scrollbar{ display:none; }
          .projects-toolbar .filter-pill{ flex:none; }
        }

        .projects-page .proj-grid2{ margin-bottom:48px; }
        .projects-page .pcard{
          position:relative; isolation:isolate; border-radius:22px; border-color:rgba(20,20,35,.09);
          box-shadow:0 16px 45px -38px rgba(20,20,35,.38);
          transform:translateZ(0);
        }
        .projects-page .pcard::before{
          content:''; position:absolute; z-index:6; left:22px; right:22px; top:0; height:3px; border-radius:0 0 999px 999px;
          background:linear-gradient(90deg,var(--project-accent,var(--purple)),var(--purple),var(--orange));
          opacity:.82; transform:scaleX(.42); transform-origin:left; transition:transform .5s cubic-bezier(.16,.8,.24,1),opacity .35s ease;
        }
        .projects-page .pcard::after{
          content:''; position:absolute; z-index:-1; width:220px; height:220px; right:-95px; bottom:-115px; border-radius:50%;
          background:radial-gradient(circle,color-mix(in srgb,var(--project-accent,var(--purple)) 14%,transparent),transparent 70%);
          opacity:0; transition:opacity .4s ease,transform .5s cubic-bezier(.16,.8,.24,1); transform:scale(.76);
        }
        .projects-page .pcard:hover{
          transform:translateY(-8px); border-color:color-mix(in srgb,var(--project-accent,var(--purple)) 28%,rgba(20,20,35,.09));
          box-shadow:0 36px 80px -42px rgba(20,20,35,.42);
        }
        .projects-page .pcard:hover::before{ transform:scaleX(1); opacity:1; }
        .projects-page .pcard:hover::after{ opacity:1; transform:scale(1); }
        .projects-page .pcard__img-wrap{
          height:310px; padding:14px;
          background:
            radial-gradient(circle at 82% 18%,color-mix(in srgb,var(--project-accent,var(--purple)) 16%,transparent),transparent 34%),
            linear-gradient(145deg,#11121B,#090A10);
        }
        .projects-page .project-shot{ border-radius:15px; transition:transform .45s cubic-bezier(.16,.8,.24,1),box-shadow .45s ease; }
        .projects-page .pcard:hover .project-shot{ transform:scale(1.012); box-shadow:0 34px 70px -32px rgba(0,0,0,.95); }
        .projects-page .project-shot__viewport img{ transition-duration:7.25s; transition-timing-function:cubic-bezier(.18,.72,.2,1); }
        .projects-page .pcard:hover .project-shot__viewport img{ transform:translateY(calc(-100% + 250px)); }
        .projects-page .pcard__badge{ border:1px solid rgba(255,255,255,.18); backdrop-filter:blur(8px); }
        .projects-page .pcard__body{ padding:28px 24px 24px; }
        .projects-page .pcard__body h3{ font-size:21px; margin-bottom:10px; }
        .projects-page .pcard__body > p{
          display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:3; overflow:hidden;
          min-height:77px; font-size:15px; line-height:1.72; margin-bottom:16px;
        }
        .projects-page .pcard__highlight{ min-height:60px; padding:10px 0 10px 12px; margin-bottom:17px; border-left-width:3px; border-radius:0 10px 10px 0; background:linear-gradient(90deg,rgba(139,92,246,.055),transparent); }
        .projects-page .pcard__stack{ min-height:64px; align-content:flex-start; }
        .projects-page .pcard__stack span{ background:#F8F8FC; border-color:rgba(20,20,35,.075); transition:transform .22s ease,border-color .22s ease,background .22s ease; }
        .projects-page .pcard:hover .pcard__stack span{ border-color:rgba(124,58,237,.13); background:#FBF9FF; }
        .projects-page .pcard__actions{ margin-top:auto; padding-top:18px; }
        .projects-page .pcard__actions button,.projects-page .pcard__actions a{
          min-height:38px; padding:9px 13px; border-radius:999px; transition:transform .24s ease,background .24s ease,color .24s ease,border-color .24s ease,box-shadow .24s ease;
        }
        .projects-page .pcard__case{ background:#F3EEFF; color:var(--purple-2); border:1px solid rgba(124,58,237,.1); }
        .projects-page .pcard__case:hover{ transform:translateY(-2px); background:var(--purple-2); color:#fff; box-shadow:0 12px 24px -16px rgba(124,58,237,.7); }
        .projects-page .pcard__live{ background:#F0FBF5; color:#14723C; border:1px solid rgba(34,197,94,.13); }
        .projects-page .pcard__live:hover{ transform:translateY(-2px); background:#14723C; color:#fff; border-color:#14723C; box-shadow:0 12px 24px -16px rgba(20,114,60,.65); }
        @media (max-width:560px){
          .projects-page .pcard__img-wrap{ height:270px; padding:10px; }
          .projects-page .pcard:hover .project-shot__viewport img{ transform:translateY(calc(-100% + 218px)); }
          .projects-page .pcard__body{ padding:25px 18px 20px; }
          .projects-page .pcard__body > p{ min-height:0; -webkit-line-clamp:unset; }
          .projects-page .pcard__highlight,.projects-page .pcard__stack{ min-height:0; }
          .projects-page .pcard__actions{ align-items:stretch; }
          .projects-page .pcard__actions button,.projects-page .pcard__actions a{ justify-content:center; flex:1 1 145px; }
        }
        @media (hover:none){
          .projects-page .pcard:hover{ transform:none; }
          .projects-page .pcard:hover .project-shot{ transform:none; }
          .projects-page .pcard:hover .project-shot__viewport img{ transform:none; }
        }

        .project-shot{ width:100%; height:100%; border-radius:14px; overflow:hidden; border:1px solid rgba(255,255,255,.13); background:#fff; box-shadow:0 28px 58px -32px rgba(0,0,0,.9); }
        .project-shot__browser{ height:32px; display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:10px; padding:0 11px; background:#10111A; border-bottom:1px solid rgba(255,255,255,.09); }
        .project-shot__dots{ display:flex; gap:5px; }
        .project-shot__dots i{ width:6px; height:6px; border-radius:50%; background:#FF5F57; }
        .project-shot__dots i:nth-child(2){ background:#FEBC2E; }
        .project-shot__dots i:nth-child(3){ background:#28C840; }
        .project-shot__url{ min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:center; font-family:var(--mono); font-size:8px; color:rgba(255,255,255,.48); }
        .project-shot__status{ font-size:8px; font-weight:800; color:#fff; opacity:.82; }
        .project-shot__viewport{ position:relative; height:calc(100% - 32px); overflow:hidden; background:#F4F4F7; }
        .project-shot__viewport img{ position:absolute; left:0; top:0; width:100%; height:auto; min-height:100%; display:block; transition:transform 8s cubic-bezier(.18,.72,.2,1); will-change:transform; }
        .pcard:hover .project-shot__viewport img{ transform:translateY(calc(-100% + 278px)); }
        .project-shot__hint{ position:absolute; right:10px; bottom:10px; z-index:2; background:rgba(8,9,15,.82); color:#fff; font-size:9px; font-weight:700; padding:6px 8px; border-radius:100px; backdrop-filter:blur(8px); opacity:0; transform:translateY(5px); transition:.3s ease; }
        .pcard:hover .project-shot__hint{ opacity:1; transform:none; }
        @media (hover:none){ .pcard:hover .project-shot__viewport img{ transform:none; } .project-shot__hint{ opacity:1; transform:none; } }
        @media (prefers-reduced-motion:reduce){ .project-shot__viewport img{ transition:none; } .pcard:hover .project-shot__viewport img{ transform:none; } }

        .project-image-fallback{
          width:100%; height:100%; min-height:220px; display:flex; align-items:center; justify-content:center; gap:16px; padding:28px; text-align:left;
          background:
            radial-gradient(circle at 18% 20%,color-mix(in srgb,var(--project-accent,var(--purple)) 22%,transparent),transparent 35%),
            radial-gradient(circle at 88% 85%,rgba(245,166,35,.16),transparent 32%),
            linear-gradient(145deg,#171827,#0C0D15);
          color:#fff;
        }
        .project-image-fallback__code{ width:54px; height:54px; flex:none; border-radius:15px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:850; box-shadow:0 18px 38px -18px rgba(0,0,0,.8); }
        .project-image-fallback small{ display:block; margin-bottom:5px; color:rgba(255,255,255,.52); font-family:var(--mono); font-size:9px; letter-spacing:.08em; text-transform:uppercase; }
        .project-image-fallback strong{ display:block; margin-bottom:5px; font-size:22px; line-height:1.2; }
        .project-image-fallback span{ display:block; color:rgba(255,255,255,.68); font-size:12px; }
        .project-image-fallback--modal{ min-height:100%; }

        /* Clean, aligned case-study modal */
        .project-modal{
          position:fixed; inset:0; z-index:1200; padding:20px; overflow:hidden; display:flex; align-items:center; justify-content:center;
          background:rgba(5,5,12,.82); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
          animation:projectModalFade .22s ease both;
        }
        .project-modal__dialog{
          width:min(1240px,100%); height:min(820px,calc(100dvh - 40px)); min-height:0; position:relative; overflow:hidden;
          display:grid; grid-template-columns:minmax(0,1.06fr) minmax(420px,.94fr); background:#fff; border:1px solid rgba(255,255,255,.18);
          border-radius:28px; box-shadow:0 70px 170px -55px rgba(0,0,0,.9);
          animation:projectModalEnter .38s cubic-bezier(.16,.8,.24,1) both;
        }
        .project-modal__dialog::before{
          content:''; position:absolute; left:52%; right:0; top:0; height:4px; z-index:10;
          background:linear-gradient(90deg,var(--project-accent,var(--purple)),var(--purple),var(--orange));
        }
        .project-modal__close{
          position:absolute; right:18px; top:18px; width:42px; height:42px; z-index:20; border-radius:50%; display:flex; align-items:center; justify-content:center;
          border:1px solid rgba(20,20,35,.1); background:rgba(255,255,255,.94); color:var(--ink); box-shadow:0 18px 38px -22px rgba(0,0,0,.45);
          transition:transform .25s ease,background .25s ease,color .25s ease;
        }
        .project-modal__close:hover{ transform:rotate(5deg) scale(1.05); background:var(--ink); color:#fff; }

        .project-modal__visual{
          min-width:0; min-height:0; padding:22px; display:flex; flex-direction:column; gap:16px; overflow:hidden; color:#fff;
          background:
            radial-gradient(circle at 12% 8%,color-mix(in srgb,var(--project-accent,var(--purple)) 27%,transparent),transparent 34%),
            radial-gradient(circle at 92% 92%,rgba(245,166,35,.12),transparent 31%),
            linear-gradient(145deg,#11121D,#08090F);
        }
        .project-modal__visual-heading{ display:flex; align-items:center; gap:12px; min-height:48px; }
        .project-modal__project-code{ width:46px; height:46px; flex:none; border-radius:13px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:850; box-shadow:0 16px 34px -16px rgba(0,0,0,.8); }
        .project-modal__visual-heading small{ display:block; color:rgba(255,255,255,.48); font-family:var(--mono); font-size:9px; text-transform:uppercase; letter-spacing:.09em; margin-bottom:3px; }
        .project-modal__visual-heading strong{ display:block; font-size:15px; line-height:1.3; }
        .project-modal__browser{ min-height:0; flex:1; display:flex; flex-direction:column; overflow:hidden; border:1px solid rgba(255,255,255,.1); border-radius:17px; background:#fff; box-shadow:0 35px 75px -34px rgba(0,0,0,.95); }
        .project-modal__browser-bar{ height:42px; flex:none; display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:12px; padding:0 14px; background:#151620; border-bottom:1px solid rgba(255,255,255,.08); }
        .project-modal__browser-url{ min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:center; color:rgba(255,255,255,.56); font-family:var(--mono); font-size:9px; }
        .project-modal__scroll-note{ color:rgba(255,255,255,.5); font-size:9px; font-weight:700; white-space:nowrap; }
        .project-modal__screen{ min-height:0; flex:1; overflow:auto; background:#F5F5F7; scrollbar-width:thin; scrollbar-color:rgba(124,58,237,.45) transparent; overscroll-behavior:contain; }
        .project-modal__screen::-webkit-scrollbar{ width:8px; }
        .project-modal__screen::-webkit-scrollbar-thumb{ background:rgba(124,58,237,.35); border-radius:999px; border:2px solid transparent; background-clip:padding-box; }
        .project-modal__screen img{ width:100%; height:auto; min-height:100%; display:block; object-fit:cover; object-position:top; }
        .project-modal__visual-footer{ display:flex; align-items:center; justify-content:space-between; gap:16px; color:rgba(255,255,255,.58); font-size:10px; }
        .project-modal__visual-footer span{ min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

        .project-modal__details{ min-width:0; min-height:0; overflow-y:auto; background:linear-gradient(180deg,#FFFFFF,#FCFBFF); scrollbar-width:thin; overscroll-behavior:contain; }
        .project-modal__content{ max-width:610px; min-height:100%; margin:0 auto; padding:64px 38px 30px; display:flex; flex-direction:column; }
        .project-modal__eyebrow{ display:flex; flex-wrap:wrap; align-items:center; gap:10px; margin-bottom:14px; padding-right:48px; }
        .project-modal__eyebrow > span:first-child{ font-family:var(--mono); font-size:11px; color:var(--purple-2); font-weight:750; text-transform:uppercase; letter-spacing:.075em; }
        .project-modal__details h2{ font-size:clamp(30px,3.4vw,45px); line-height:1.08; letter-spacing:-.045em; margin:0 0 15px; text-wrap:balance; }
        .project-modal__lead{ color:var(--gray-on-light); font-size:15.5px; line-height:1.78; margin:0 0 25px; }

        .project-modal__specs{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin-bottom:30px; }
        .project-modal__specs div{ min-width:0; padding:14px 15px; border:1px solid rgba(20,20,35,.075); border-radius:14px; background:#F8F8FC; }
        .project-modal__specs small{ display:block; margin-bottom:5px; color:var(--gray-on-light); font-size:9.5px; font-weight:800; text-transform:uppercase; letter-spacing:.075em; }
        .project-modal__specs b{ display:block; font-size:12.5px; line-height:1.45; overflow-wrap:anywhere; }

        .project-modal__section-heading{ margin-bottom:14px; }
        .project-modal__section-heading span{ display:block; margin-bottom:5px; font-size:17px; font-weight:850; letter-spacing:-.015em; }
        .project-modal__section-heading p{ margin:0; color:var(--gray-on-light); font-size:12.5px; line-height:1.6; }
        .project-modal__section-heading--compact{ margin-bottom:15px; }

        .project-modal__story{ display:grid; gap:10px; margin-bottom:30px; }
        .project-modal__story-item{ position:relative; display:grid; grid-template-columns:38px minmax(0,1fr); gap:12px; align-items:start; padding:16px 16px 16px 58px; border:1px solid rgba(20,20,35,.075); border-radius:15px; background:#fff; }
        .project-modal__story-number{ position:absolute; left:14px; top:15px; font-family:var(--mono); font-size:9px; font-weight:800; color:#A1A4B0; }
        .project-modal__story-icon{ width:36px; height:36px; border-radius:11px; display:flex; align-items:center; justify-content:center; }
        .project-modal__story-item > div{ min-width:0; }
        .project-modal__story-item small{ display:block; margin-bottom:5px; font-size:10px; font-weight:850; text-transform:uppercase; letter-spacing:.08em; }
        .project-modal__story-item p{ margin:0; color:#505462; font-size:13px; line-height:1.62; }
        .project-modal__story-item--purple .project-modal__story-icon{ color:#7C3AED; background:#F3EEFF; }
        .project-modal__story-item--purple small{ color:#7C3AED; }
        .project-modal__story-item--orange .project-modal__story-icon{ color:#B86A00; background:#FFF4E3; }
        .project-modal__story-item--orange small{ color:#A85D00; }
        .project-modal__story-item--green .project-modal__story-icon{ color:#148447; background:#EAFBF1; }
        .project-modal__story-item--green small{ color:#14723C; }

        .project-modal__built{ margin-bottom:22px; padding:20px; border:1px solid rgba(20,20,35,.075); border-radius:17px; background:linear-gradient(145deg,#FAFAFD,#FFFFFF); }
        .project-modal__built ul{ list-style:none; padding:0; margin:0; display:grid; gap:11px; }
        .project-modal__built li{ display:grid; grid-template-columns:28px minmax(0,1fr); gap:10px; align-items:start; color:#4E5260; font-size:13.5px; line-height:1.58; }
        .project-modal__check{ width:26px; height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#6D28D9; background:#F1EAFF; }
        .project-modal__stack{ margin-bottom:0; padding-bottom:24px; }
        .project-modal__stack span{ background:#F7F5FC; border-color:rgba(124,58,237,.1); }
        .project-modal__actions{
          position:sticky; bottom:-1px; z-index:4; margin-top:auto; padding:18px 0 2px; display:flex; flex-wrap:wrap; gap:10px;
          background:linear-gradient(180deg,rgba(255,255,255,0),#fff 28%,#fff);
        }
        .project-modal__actions .btn{ justify-content:center; min-height:45px; }

        @keyframes projectModalFade{ from{ opacity:0; } to{ opacity:1; } }
        @keyframes projectModalEnter{ from{ opacity:0; transform:translateY(18px) scale(.985); } to{ opacity:1; transform:none; } }

        @media (max-width:980px){
          .project-modal{ overflow:auto; align-items:flex-start; padding:14px; }
          .project-modal__dialog{ height:auto; min-height:0; max-height:none; grid-template-columns:1fr; border-radius:23px; overflow:hidden; }
          .project-modal__dialog::before{ left:0; }
          .project-modal__visual{ height:500px; padding:18px; }
          .project-modal__details{ overflow:visible; }
          .project-modal__content{ max-width:none; padding:42px 28px 28px; }
          .project-modal__actions{ position:static; background:none; padding-top:4px; }
        }
        @media (max-width:620px){
          .project-modal{ padding:0; background:#fff; }
          .project-modal__dialog{ width:100%; min-height:100dvh; border:none; border-radius:0; box-shadow:none; }
          .project-modal__close{ position:fixed; right:10px; top:10px; width:40px; height:40px; }
          .project-modal__visual{ height:390px; padding:14px; gap:12px; }
          .project-modal__visual-heading{ padding-right:48px; }
          .project-modal__browser-bar{ grid-template-columns:auto minmax(0,1fr); height:38px; padding:0 11px; }
          .project-modal__scroll-note{ display:none; }
          .project-modal__visual-footer{ font-size:9px; }
          .project-modal__content{ padding:31px 18px 24px; }
          .project-modal__eyebrow{ padding-right:0; }
          .project-modal__details h2{ font-size:31px; }
          .project-modal__lead{ font-size:14.5px; line-height:1.72; }
          .project-modal__specs{ grid-template-columns:1fr; }
          .project-modal__story-item{ grid-template-columns:34px minmax(0,1fr); padding:14px 14px 14px 50px; gap:10px; }
          .project-modal__story-number{ left:12px; top:14px; }
          .project-modal__story-icon{ width:33px; height:33px; }
          .project-modal__built{ padding:17px 15px; }
          .project-modal__actions{ flex-direction:column; }
          .project-modal__actions .btn{ width:100%; }
          .project-image-fallback{ min-height:100%; padding:18px; }
          .project-image-fallback strong{ font-size:19px; }
        }
        @media (prefers-reduced-motion:reduce){
          .project-modal,.project-modal__dialog{ animation:none; }
        }

        .center-row{ display:flex; justify-content:center; }

        /* ============ SERVICES ============ */
        .services-grid{ display:grid; grid-template-columns:1fr; gap:20px; }
        @media (min-width:680px){ .services-grid{ grid-template-columns:1fr 1fr; } }
        @media (min-width:1040px){ .services-grid{ grid-template-columns:repeat(3,1fr); } }
        .service-card{ border:1px solid var(--line-light); border-radius:19px; padding:28px 24px; background:#fff; transition:transform .35s cubic-bezier(.16,.8,.24,1), box-shadow .35s ease, border-color .35s ease; }
        .service-card:hover{ transform:translateY(-7px); border-color:rgba(124,58,237,.2); box-shadow:0 30px 58px -34px rgba(20,20,35,.28); }
        .service-card__ic{ width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; margin-bottom:20px; }
        .service-card h3{ font-size:18px; font-weight:800; margin:0 0 10px; line-height:1.32; letter-spacing:-.01em; }
        .service-card p{ font-size:15px; color:var(--gray-on-light); line-height:1.72; margin:0 0 18px; }
        .service-card__tags{ display:flex; flex-wrap:wrap; gap:8px; }
        .service-card__tags span{ font-size:11.5px; font-weight:650; color:var(--gray-on-light); border:1px solid var(--line-light); padding:6px 10px; border-radius:7px; background:var(--bg-light); }

        .delivery{ background:var(--bg-light); }
        .delivery-grid{ display:grid; grid-template-columns:1fr; gap:16px; }
        @media (min-width:760px){ .delivery-grid{ grid-template-columns:repeat(3,1fr); } }
        .delivery-card{ display:grid; grid-template-columns:auto 1fr; gap:16px; align-items:start; padding:24px; border:1px solid var(--line-light); border-radius:18px; background:#fff; box-shadow:0 22px 50px -38px rgba(20,20,35,.26); }
        .delivery-card__icon{ width:46px; height:46px; border-radius:13px; display:flex; align-items:center; justify-content:center; background:color-mix(in srgb,var(--delivery-color) 13%,transparent); }
        .delivery-card h3{ margin:1px 0 8px; font-size:17px; }
        .delivery-card p{ margin:0; color:var(--gray-on-light); font-size:14.5px; line-height:1.72; }

        /* ============ ACADEMIC / MINI GRID ============ */
        .mini-grid{ display:grid; grid-template-columns:1fr; gap:18px; }
        @media (min-width:680px){ .mini-grid{ grid-template-columns:repeat(3,1fr); } }
        .mini-card{ border:1px solid var(--line-light); border-radius:18px; padding:24px; background:#fff; transition:transform .35s cubic-bezier(.16,.8,.24,1), box-shadow .35s ease, border-color .35s ease; }
        .mini-card:hover{ transform:translateY(-6px); border-color:rgba(124,58,237,.18); box-shadow:0 26px 50px -30px rgba(20,20,35,.26); }
        .mini-card__ic{ width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:16px; }
        .mini-card .tag{ display:inline-block; font-family:var(--mono); font-size:11px; font-weight:700; color:var(--purple-2); text-transform:uppercase; letter-spacing:.05em; margin-bottom:10px; }
        .mini-card h4{ font-size:16.5px; font-weight:800; margin:0 0 8px; line-height:1.3; }
        .mini-card p{ font-size:14.5px; color:var(--gray-on-light); line-height:1.68; margin:0; }

        .empty-state{ padding:40px 24px; text-align:center; border:1px dashed var(--line-light); border-radius:16px; color:var(--gray-on-light); font-size:15px; }

        /* ============ PROCESS ============ */
        .process{ background:var(--bg-dark); color:#fff; }
        .process-row{ display:grid; grid-template-columns:1fr; gap:16px; position:relative; }
        @media (min-width:860px){ .process-row{ grid-template-columns:repeat(4,1fr); gap:24px; } }
        @media (min-width:860px){
          .process-row::before{
            content:''; display:block; position:absolute; top:26px; left:0%; right:20%; height:1px;
            background-image:linear-gradient(90deg, var(--line-dark) 50%, transparent 50%); background-size:14px 1px;
          }
        }
        .p-step{ position:relative; z-index:2; }
        .p-step__top{ display:flex; align-items:center; gap:12px; margin-bottom:14px; }
        .p-step__num{ font-family:var(--mono); font-size:14px; font-weight:700; }
        .p-step__ic{ width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; background:var(--panel-dark); border:1px solid var(--line-dark); }
        .p-step h3{ font-size:17px; font-weight:700; margin:0 0 8px; }
        .p-step p{ font-size:15px; color:var(--gray-on-dark); line-height:1.7; margin:0; max-width:230px; }
        @media (max-width:859px){
          .process .sec-head{ text-align:center; margin-left:auto; margin-right:auto; margin-bottom:32px; }
          .process-row{ max-width:430px; margin:0 auto; }
          .p-step{ text-align:center; padding:24px 22px; border:1px solid var(--line-dark); border-radius:17px; background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.018)); }
          .p-step__top{ justify-content:center; margin-bottom:14px; }
          .p-step__ic{ width:56px; height:56px; border-radius:16px; box-shadow:0 18px 34px -22px rgba(0,0,0,.8); }
          .p-step p{ max-width:310px; margin:0 auto; }
          .p-step::after{ content:''; position:absolute; left:50%; bottom:-17px; width:1px; height:17px; background:linear-gradient(var(--line-dark),transparent); }
          .p-step:last-child::after{ display:none; }
        }

        /* ============ CONTACT ============ */
        .contact{ background:var(--bg-light); }
        .contact-heading{ margin-bottom:30px; }
        .dash-eyebrow{ display:inline-flex; align-items:center; gap:10px; font-size:12px; font-weight:800; letter-spacing:.09em; text-transform:uppercase; color:var(--ink); margin-bottom:16px; }
        .dash-eyebrow i{ display:block; width:26px; height:2px; border-radius:2px; background:linear-gradient(95deg, var(--orange), var(--pink)); flex:none; }
        .contact-heading h2{ font-size:clamp(25px,3.4vw,34px); font-weight:800; letter-spacing:-.025em; margin:0 0 14px; line-height:1.22; }
        .contact-heading p{ font-size:16px; color:var(--gray-on-light); line-height:1.8; margin:0; max-width:440px; }
        .contact-grid{ display:grid; grid-template-columns:1fr; gap:40px; }
        @media (min-width:960px){ .contact-grid{ grid-template-columns:0.85fr 1.15fr; gap:56px; align-items:start; } }

        .c-info-card{ display:flex; align-items:center; gap:14px; background:#fff; border:1px solid var(--line-light); border-radius:14px; padding:16px 18px; margin-bottom:14px; transition:transform .3s ease, box-shadow .3s ease; }
        .c-info-card:hover{ transform:translateX(4px); box-shadow:0 20px 34px -24px rgba(20,20,35,0.25); }
        .c-info-card__ic{ width:44px; height:44px; border-radius:12px; background:var(--bg-dark); color:var(--orange); display:flex; align-items:center; justify-content:center; flex:none; }
        .c-info-card .label{ font-size:11.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--gray-on-light); margin-bottom:3px; }
        .c-info-card .value{ font-size:15.5px; font-weight:700; }

        .c-form{ background:#fff; border:1px solid var(--line-light); border-radius:20px; padding:34px; box-shadow:0 40px 80px -46px rgba(20,20,35,0.25); }
        .c-form h3{ font-size:20px; font-weight:800; margin:0 0 7px; }
        .c-form__intro{ margin:0 0 24px; color:var(--gray-on-light); font-size:14px; line-height:1.65; }
        .c-form__reply-note{ display:flex; align-items:center; gap:8px; margin-top:14px; color:var(--gray-on-light); font-size:12.5px; line-height:1.55; }
        .c-form-row{ display:grid; grid-template-columns:1fr; gap:18px; margin-bottom:18px; }
        @media (min-width:560px){ .c-form-row.two{ grid-template-columns:1fr 1fr; } }
        .c-field label{ font-size:11.5px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--gray-on-light); display:block; margin-bottom:8px; }
        .c-field input, .c-field textarea, .c-field select{
          width:100%; border:1px solid var(--line-light); border-radius:10px; padding:13px 14px; font-family:var(--font); font-size:15px;
          background:var(--bg-light); color:var(--ink); transition:border-color .25s ease, box-shadow .25s ease, background .25s ease;
        }
        .c-field select{ min-height:49px; appearance:auto; }
        .c-field input:focus, .c-field textarea:focus, .c-field select:focus{ outline:none; border-color:var(--purple-2); box-shadow:0 0 0 3px rgba(124,58,237,0.14); background:#fff; }
        .c-field textarea{ resize:vertical; min-height:145px; }
        .c-success{ display:flex; align-items:center; gap:8px; color:var(--green); font-size:13.5px; font-weight:600; margin-top:16px; }
        .c-error{ font-size:13.5px; color:#EF4444; margin-top:10px; line-height:1.6; }
        .c-form button[disabled]{ opacity:.65; cursor:not-allowed; transform:none; box-shadow:none; }
        .hp-field{ position:absolute !important; left:-9999px !important; width:1px !important; height:1px !important; overflow:hidden !important; opacity:0 !important; pointer-events:none !important; }
        @media (max-width:620px){
          .contact-grid{ gap:30px; }
          .c-form{ padding:25px 19px; border-radius:17px; }
          .c-form-row{ gap:14px; margin-bottom:14px; }
          .c-info-card{ padding:15px; }
          .c-info-card .value{ overflow-wrap:anywhere; }
        }

        /* ============ OPPORTUNITIES ============ */
        .opportunity{ background:var(--bg-light); padding:86px 0; }
        .opportunity-card{ position:relative; overflow:hidden; border-radius:24px; background:linear-gradient(120deg,#0A0A12 0%,#11101D 56%,#251943 100%); border:1px solid var(--line-dark); padding:44px; color:#fff; display:grid; grid-template-columns:1fr; gap:30px; align-items:center; box-shadow:0 42px 90px -48px rgba(20,20,35,.58); }
        .opportunity-card::after{ content:''; position:absolute; width:310px; height:310px; right:-130px; top:-150px; border-radius:50%; background:radial-gradient(circle,rgba(139,92,246,.48),transparent 68%); }
        @media (min-width:880px){ .opportunity-card{ grid-template-columns:1.25fr .75fr; padding:52px 56px; } }
        .opportunity-copy{ position:relative; z-index:1; }
        .opportunity-copy h2{ font-size:clamp(27px,4vw,42px); line-height:1.14; letter-spacing:-.03em; margin:0 0 14px; max-width:700px; }
        .opportunity-copy p{ color:var(--gray-on-dark); font-size:15.5px; line-height:1.75; margin:0; max-width:660px; }
        .opportunity-details{ position:relative; z-index:1; display:flex; flex-direction:column; gap:14px; align-items:flex-start; }
        .opportunity-availability{ display:inline-flex; align-items:center; gap:9px; color:#D7FBE4; font-size:12px; font-weight:700; }
        .opportunity-availability::before{ content:''; width:8px; height:8px; border-radius:50%; background:var(--green); box-shadow:0 0 0 6px rgba(34,197,94,.12); }
        .opportunity-actions{ display:flex; flex-wrap:wrap; gap:11px; }
        .opportunity-actions .btn{ width:auto; }
        .opportunity-email{ font-size:13.5px; color:var(--gray-on-dark); display:flex; align-items:center; gap:7px; }
        @media (max-width:620px){ .opportunity{ padding:64px 0; } .opportunity-card{ padding:32px 24px; border-radius:20px; text-align:center; } .opportunity-details{ align-items:center; } .opportunity-actions{ justify-content:center; } }

        /* ============ CTA BANNER ============ */
        .cta-banner{ background:var(--bg-darkest); padding:64px 0; color:#fff; position:relative; overflow:hidden; }
        .cta-banner::before{ content:''; position:absolute; inset:0; background:radial-gradient(circle at 85% 30%, rgba(139,92,246,0.22), transparent 45%); }
        .cta-row{ display:flex; flex-direction:column; align-items:center; text-align:center; gap:24px; position:relative; z-index:2; }
        .cta-row .btn{ width:auto; align-self:center; flex:none; }
        @media (min-width:860px){ .cta-row{ flex-direction:row; align-items:center; justify-content:space-between; text-align:left; } .cta-row .btn{ align-self:auto; } }
        .cta-row h3{ font-size:clamp(22px,3vw,30px); font-weight:800; margin:0 0 8px; letter-spacing:-0.01em; }
        .cta-row p{ font-size:15px; color:var(--gray-on-dark); margin:0; }

        /* ============ FOOTER ============ */
        .footer{ background:var(--bg-darkest); color:var(--gray-on-dark); padding:60px 0 24px; border-top:1px solid var(--line-dark); }
        .footer-grid{ display:grid; grid-template-columns:1fr; gap:40px; margin-bottom:48px; }
        @media (min-width:760px){ .footer-grid{ grid-template-columns:1.4fr 0.6fr 1.3fr 1.1fr; gap:30px; } }
        .footer-brand p{ font-size:15px; line-height:1.8; margin:14px 0 20px; max-width:300px; color:var(--gray-on-dark-2); }
        @media screen and (max-width: 480px) {
  .footer-brand p {
        font-size:15px; line-height:1.8; margin:14px 0 0px; max-width:360px; color:var(--gray-on-dark-2); 
  }
}
        .footer h5{ color:#fff; font-size:14.5px; font-weight:700; margin:0 0 18px; }
        .footer-links{ display:flex; flex-direction:column; gap:11px; }
        .footer-links a,.footer-links button{ font-size:14.5px; color:var(--gray-on-dark-2); transition:color .25s ease; background:none; border:none; text-align:left; padding:0; cursor:pointer; }
        .footer-links button:hover{ color:#fff; }
        .footer-links a:hover{ color:#fff; }
        .footer-contact{ display:flex; flex-direction:column; gap:12px; margin-bottom:18px; }
        .footer-contact a,.footer-contact div{ display:flex; align-items:center; gap:10px; font-size:14px; color:var(--gray-on-dark-2); }
        .footer-contact a:hover{ color:#fff; }
        .footer-bottom{ border-top:1px solid var(--line-dark); padding-top:22px; display:flex; flex-wrap:wrap; gap:12px; justify-content:space-between; font-size:13.5px; }
        .footer-bottom a{ color:var(--gray-on-dark-2); margin-left:18px; }
        .footer-bottom a:hover{ color:#fff; }
      `}</style>

      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById("main-content");
          main?.focus();
          main?.scrollIntoView({ behavior: "auto", block: "start" });
        }}
      >
        Skip to content
      </a>

      {/* ============ NAV ============ */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`} aria-label="Primary navigation">
        <div className="wrap navbar__inner">
          <button type="button" className="logo" aria-label="Go to Haseeb.dev home" onClick={() => navigateTo("home", "page")} style={{ background: "none", border: "none", padding: 0 }}>
            <span className="logo__mark" />
            <span className="logo__text">Haseeb<span>.dev</span></span>
          </button>
          <div className="nav-links">
            {NAV_LINKS.map((item) => {
              const isActive = item.type === "page" ? page === item.id : page === "home" && activeSection === item.id;
              return (
                <button
                  key={item.id}
                  className={isActive ? "active" : ""}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => navigateTo(item.id, item.type)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <button type="button" className="nav-cta" onClick={() => navigateTo("contact", "page")}>
            Let's Work Together <ArrowRight size={14} />
          </button>
          <button type="button" className="nav-burger" onClick={() => setMenuOpen((o) => !o)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <div
        id="mobile-navigation"
        className={`mmenu ${menuOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <button type="button" className="mmenu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
          <X size={22} />
        </button>
        {NAV_LINKS.map((item) => (
          <button type="button" key={item.id} className="mlink" onClick={() => navigateTo(item.id, item.type)}>
            {item.label}
          </button>
        ))}
        <button type="button" className="btn btn-grad mmenu-cta" onClick={() => navigateTo("contact", "page")}>
          Start a Conversation <ArrowRight size={15} />
        </button>
      </div>

      <main id="main-content" className="main-content" tabIndex={-1}>
      {/* ================================================================ */}
      {/* HOME PAGE                                                        */}
      {/* ================================================================ */}
      {page === "home" && (
        <>
          <section id="home" className="hero">
            <div className="wrap hero__grid">
              <div>
                <Reveal><span className="hi-badge">WordPress · Shopify · React Developer</span></Reveal>
                <Reveal delay={70}>
                  <h1>
                    I build polished websites that look sharp and <span className="hero-title-accent">work beautifully.</span>
                  </h1>
                </Reveal>
                <Reveal delay={130}>
                  <p className="lead">
                    <strong>I'm Haseeb</strong> — I help businesses and agencies turn approved designs,
                    ideas, and requirements into fast, responsive WordPress, Shopify, and React experiences.
                  </p>
                </Reveal>
                <Reveal delay={190}>
                  <div className="btn-row">
                    <button className="btn btn-grad" onClick={() => navigateTo("projects", "page")}>
                      View My Work <ArrowRight size={15} />
                    </button>
                    <button className="btn btn-outline-dark" onClick={() => navigateTo("contact", "page")}>
                      Start a Conversation <Mail size={15} />
                    </button>
                  </div>
                </Reveal>
                <Reveal delay={250}>
                  <div className="stats-row">
                    <div className="stat-item">
                      <div className="stat-ic" style={{ background: "rgba(139,92,246,0.15)" }}>
                        <Layers size={17} color="#8B5CF6" />
                      </div>
                      <div><b>4+ Years</b><span>Building Professional Websites</span></div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-ic" style={{ background: "rgba(245,166,35,0.15)" }}>
                        <Code2 size={17} color="#F5A623" />
                      </div>
                      <div><b>CMS + Code</b><span>WordPress, Shopify &amp; React</span></div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-ic" style={{ background: "rgba(59,130,246,0.15)" }}>
                        <Smartphone size={17} color="#3B82F6" />
                      </div>
                      <div><b>Responsive</b><span>Built for Every Screen</span></div>
                    </div>
                  </div>
                </Reveal>
              </div>

              <Reveal delay={150} className="hero__visual">
                <div className="code-visual">
                  <div className="code-window">
                    <div className="code-window__bar">
                      <div className="code-window__dots" aria-hidden="true">
                        <i style={{ background: "#FF5F57" }} />
                        <i style={{ background: "#FEBC2E" }} />
                        <i style={{ background: "#28C840" }} />
                      </div>
                      <span className="code-window__path"><Code2 size={12} /> haseeb.dev / portfolio.tsx</span>
                      <span className="code-window__availability">Open to work</span>
                    </div>

                    <div className="code-window__editor" aria-hidden="true">
                      <div className="code-window__numbers">1<br />2<br />3<br />4<br />5<br />6<br />7<br />8<br />9<br />10<br />11<br />12</div>
                      <pre className="code-window__code"><span className="kw">const</span> <span className="name">haseeb</span> = {'{'}{"\n"}  <span className="key">name</span>: <span className="str">'Haseeb Ansari'</span>,{"\n"}  <span className="key">role</span>: <span className="str">'Web Developer'</span>,{"\n"}  <span className="key">stack</span>: [{"\n"}    <span className="str">'React'</span>, <span className="str">'WordPress'</span>,{"\n"}    <span className="str">'Shopify'</span>, <span className="str">'JavaScript'</span>{"\n"}  ],{"\n"}  <span className="key">focus</span>: <span className="str">'clean, responsive builds'</span>{"\n"}{'}'};{"\n\n"}<span className="kw">async function</span> <span className="fn">build</span>(idea) {'{'}{"\n"}  <span className="kw">return</span> <span className="fn">launch</span>(idea);{"\n"}{'}'}</pre>
                    </div>

                    <div className="code-window__footer">
                      <span><i className="ready-dot" /> main / TypeScript</span>
                      <span>UTF-8 · Ln 12</span>
                    </div>
                  </div>

                  <div className="code-skills" aria-label="Core development strengths">
                    <div className="code-skill">
                      <div className="code-skill__top"><b>React &amp; Frontend</b><span>UI</span></div>
                      <div className="code-skill__bar"><i style={{ "--skill-width": "92%", "--skill-gradient": "linear-gradient(90deg,#8B5CF6,#C084FC)" }} /></div>
                    </div>
                    <div className="code-skill">
                      <div className="code-skill__top"><b>WordPress</b><span>CMS</span></div>
                      <div className="code-skill__bar"><i style={{ "--skill-width": "95%", "--skill-gradient": "linear-gradient(90deg,#F5A623,#F59E0B)" }} /></div>
                    </div>
                    <div className="code-skill">
                      <div className="code-skill__top"><b>Shopify</b><span>Store</span></div>
                      <div className="code-skill__bar"><i style={{ "--skill-width": "85%", "--skill-gradient": "linear-gradient(90deg,#22C55E,#4ADE80)" }} /></div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="scroll-cue">
              <div className="mouse" />
              Scroll Down
            </div>
          </section>

          {/* ---- About teaser ---- */}
          <section className="about sec">
            <div className="wrap">
              <div className="about__grid">
                <div className="about-copy">
                  <Reveal><Eyebrow>About Me</Eyebrow></Reveal>
                  <Reveal delay={60}>
                    <h2>
                      I started with a curiosity for how websites work.
                      <span className="link-word"> Today, I build them.</span>
                    </h2>
                  </Reveal>
                  <Reveal delay={120}>
                    <p>
                      I'm Haseeb Mujeeb Ansari, a Computer Engineer and Web Developer from Karachi.
                      I turn ideas, approved designs, and business requirements into responsive digital
                      experiences — from React interfaces and custom frontend work to WordPress,
                      Shopify, performance optimization, and CMS implementation.
                    </p>
                  </Reveal>
                  <Reveal delay={170}>
                    <button className="btn btn-outline-light" onClick={() => navigateTo("about", "page")}>
                      More About Me <ArrowRight size={15} />
                    </button>
                  </Reveal>
                </div>

                <Reveal delay={120} className="card-grid2">
                  {ABOUT_CARDS.map((c) => (
                    <div className="about-card" key={c.title}>
                      <div className="about-card__ic" style={{ background: `${c.color}22` }}>
                        <c.icon size={19} color={c.color} />
                      </div>
                      <h4>{c.title}</h4>
                      <p>{c.desc}</p>
                    </div>
                  ))}
                </Reveal>
              </div>

              <Reveal delay={80}>
                <div className="stack-intro">
                  <div>
                    <h3>Development stack</h3>
                    <p>Organized by how I use each technology in production work.</p>
                  </div>
                </div>
                <div className="tech-groups">
                  {TECH_GROUPS.map((group) => (
                    <div className="tech-group" key={group.title}>
                      <div className="tech-group__head">
                        <h4>{group.title}</h4>
                        <p>{group.desc}</p>
                      </div>
                      <div className="tech-group__items">
                        {group.items.map((label) => {
                          const tech = TECH.find((item) => item.label === label);
                          return tech ? <TechPill key={label} t={tech} /> : null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>

          {/* ---- Featured projects teaser ---- */}
          <section className="projects sec">
            <div className="wrap">
              <Reveal className="sec-head">
                <Eyebrow>My Work</Eyebrow>
                <h2>Featured Projects</h2>
                <p>Real client-facing work and frontend projects, presented with the platform, purpose, and implementation focus.</p>
              </Reveal>

              <div className="proj-grid2">
                {featuredProjects.map((project, index) => (
                  <Reveal as="div" delay={(index % 2) * 90} key={project.id || project.slug || project.title}>
                    <ProjectCard project={project} onOpen={setSelectedProject} />
                  </Reveal>
                ))}
              </div>

              <Reveal delay={100} className="center-row">
                <button className="btn btn-outline-light" onClick={() => navigateTo("projects", "page")}>
                  View All Projects <ArrowRight size={15} />
                </button>
              </Reveal>
            </div>
          </section>

          {/* ---- Process ---- */}
          <section id="process" className="process sec">
            <div className="wrap">
              <Reveal className="sec-head sec-head--white">
                <Eyebrow>My Process</Eyebrow>
                <h2>How I Work</h2>
                <p>A practical path from requirements to a tested, production-ready experience.</p>
              </Reveal>

              <div className="process-row">
                {PROCESS.map((s, i) => (
                  <Reveal delay={i * 100} key={s.n} className="p-step">
                    <div className="p-step__top">
                      <div className="p-step__ic">
                        <s.icon size={22} color={s.color} />
                      </div>
                      <span className="p-step__num" style={{ color: s.color }}>{s.n}</span>
                    </div>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>


          {/* ---- Contact & opportunities ---- */}
          <section className="opportunity">
            <div className="wrap">
              <Reveal className="opportunity-card">
                <div className="opportunity-copy">
                  <Eyebrow>Contact & Opportunities</Eyebrow>
                  <h2>Let's build something worth visiting.</h2>
                  <p>
                    Have a project, opportunity, or idea? Whether you're building something new,
                    improving an existing website, or looking for a dependable developer, I'd be glad to hear about it.
                  </p>
                </div>
                <div className="opportunity-details">
                  <span className="opportunity-availability">Available for freelance, remote, and full-time roles</span>
                  <div className="opportunity-actions">
                    <button className="btn btn-grad" onClick={() => navigateTo("contact", "page")}>
                      Start a Conversation <ArrowRight size={15} />
                    </button>
                    <button className="btn btn-outline-dark" onClick={() => navigateTo("projects", "page")}>
                      View My Work <ExternalLink size={14} />
                    </button>
                  </div>
                  <a className="opportunity-email" href="mailto:haseebmujeeb360@gmail.com">
                    <Mail size={14} /> haseebmujeeb360@gmail.com
                  </a>
                </div>
              </Reveal>
            </div>
          </section>
        </>
      )}

      {/* ================================================================ */}
      {/* ABOUT PAGE                                                       */}
      {/* ================================================================ */}
      {page === "about" && (
        <>
          <Masthead
            crumb="About"
            title="Building with curiosity. Delivering with purpose."
            subtitle="I'm Haseeb — a Computer Engineer and Web Developer focused on building thoughtful, high-performance digital experiences."
            meta={[
              { icon: MapPin, label: "Karachi, Pakistan" },
              { icon: CheckCircle2, label: "Available for remote opportunities" },
            ]}
          />

          <section className="about-profile sec">
            <div className="wrap about-profile__grid">
              <Reveal className="about-photo">
                <div className="about-photo__frame">
                  <img
                    src="/images/haseeb-ansari-profile.webp"
                    alt="Haseeb Mujeeb Ansari, Web Developer and Computer Engineer"
                    loading="eager"
                    decoding="async"
                  />
                  <div className="about-photo__caption">
                    <div>
                      <b>Haseeb Mujeeb Ansari</b>
                      <span>Web Developer · Computer Engineer</span>
                    </div>
                    <span className="about-photo__signal">Building for the web</span>
                  </div>
                </div>
                <div className="about-photo__badge">
                  <span className="about-photo__badge-icon"><MapPin size={17} /></span>
                  <span><small>Based in</small><b>Karachi, Pakistan</b></span>
                </div>
              </Reveal>

              <div className="about-story">
                <Reveal><Eyebrow>My Story</Eyebrow></Reveal>
                <Reveal delay={60}><h2>A developer who cares about the details.</h2></Reveal>
                <Reveal delay={110}>
                  <p>
                    I started with a curiosity about how websites work. Over time, that curiosity became a career in building digital experiences that are clear, responsive, and built to perform.
                  </p>
                  <p>
                    Today, I work across WordPress, Shopify, React, and modern front-end technologies — helping businesses turn ideas, approved designs, and real requirements into polished, usable websites.
                  </p>
                  <div className="about-story__highlight">
                    My work sits between design awareness and technical execution: protecting the visual details while making sure the final website is practical, editable, and ready for real users.
                  </div>
                </Reveal>
                <Reveal delay={160}>
                  <button className="btn btn-grad" onClick={() => navigateTo("contact", "page")}>Let's Work Together <ArrowRight size={15} /></button>
                </Reveal>
              </div>
            </div>
          </section>

          <section className="about-values sec">
            <div className="wrap">
              <Reveal className="sec-head">
                <Eyebrow>What I Bring</Eyebrow>
                <h2>More than a list of technologies.</h2>
                <p>I bring a balanced approach that connects thoughtful interfaces, dependable development, and the practical needs of a real project.</p>
              </Reveal>
              <div className="about-value-grid">
                {ABOUT_VALUE_CARDS.map((item, index) => {
                  const ValueIcon = item.icon;
                  return (
                    <Reveal key={item.title} delay={(index % 4) * 70} className="about-value-card" style={{ "--value-color": item.color }}>
                      <div className="about-value-card__top">
                        <span className="about-value-card__icon"><ValueIcon size={20} color={item.color} /></span>
                        <span className="about-value-card__num">{item.number}</span>
                      </div>
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="about-journey sec">
            <div className="wrap">
              <Reveal className="sec-head">
                <Eyebrow>My Journey</Eyebrow>
                <h2>The path so far.</h2>
                <p>A practical progression from independent client work to production development — with a focus on getting better through every build.</p>
              </Reveal>
              <div className="journey-grid">
                {ABOUT_JOURNEY.map((item, index) => {
                  const colors = ["#8B5CF6", "#F5A623", "#22C55E"];
                  const icons = [Briefcase, Code2, CheckCircle2];
                  const JourneyIcon = icons[index];
                  return (
                    <Reveal key={item.title} delay={index * 100} className="journey-card" style={{ "--journey-color": colors[index] }}>
                      <span className="journey-card__dot"><JourneyIcon size={19} /></span>
                      <span className="journey-card__year">{item.year}</span>
                      <h3>{item.title}</h3>
                      <div className="journey-card__org">{item.org}</div>
                      <p>{item.desc}</p>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="about-principles sec">
            <div className="wrap">
              <Reveal className="sec-head sec-head--white">
                <Eyebrow>The Way I Work</Eyebrow>
                <h2>Thoughtful choices from the first conversation to the final handoff.</h2>
                <p>These principles guide how I approach development, communication, and the quality of the finished experience.</p>
              </Reveal>
              <div className="principle-grid">
                {ABOUT_PRINCIPLES.map((item, index) => {
                  const PrincipleIcon = item.icon;
                  return (
                    <Reveal key={item.title} delay={(index % 2) * 80} className="principle-card">
                      <span className="principle-card__icon"><PrincipleIcon size={20} color={item.color} /></span>
                      <div><h3>{item.title}</h3><p>{item.desc}</p></div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="about-details sec">
            <div className="wrap about-details__grid">
              <Reveal className="education-card">
                <span className="education-card__icon"><GraduationCap size={22} /></span>
                <span className="education-card__year">{ABOUT_EDUCATION.year}</span>
                <h3>{ABOUT_EDUCATION.title}</h3>
                <p>{ABOUT_EDUCATION.org}</p>
              </Reveal>

              <Reveal delay={80} className="beyond-card">
                <Eyebrow>Beyond the Code</Eyebrow>
                <h2>Curiosity does not stop when a project launches.</h2>
                <p>When I'm not building websites, I'm usually exploring new technologies, testing design ideas, or learning something that helps me become a more thoughtful developer.</p>
                <div className="beyond-grid">
                  {ABOUT_PERSONAL.map((item) => {
                    const PersonalIcon = item.icon;
                    return (
                      <div className="beyond-item" key={item.label} style={{ "--beyond-color": item.color }}>
                        <span className="beyond-item__icon"><PersonalIcon size={17} color={item.color} /></span>
                        <small>{item.label}</small>
                        <b>{item.value}</b>
                      </div>
                    );
                  })}
                </div>
              </Reveal>
            </div>
          </section>

          <section className="about-final-cta">
            <div className="wrap about-final-cta__inner">
              <div>
                <h2>Have a project, opportunity, or idea?</h2>
                <p>Whether you're building something new, improving an existing website, or looking for a developer to join your team, I'd be glad to hear about it.</p>
              </div>
              <button className="btn btn-grad" onClick={() => navigateTo("contact", "page")}>Start a Conversation <ArrowRight size={15} /></button>
            </div>
          </section>
        </>
      )}

      {/* ================================================================ */}
      {/* ================================================================ */}
      {/* SERVICES PAGE                                                    */}
      {/* ================================================================ */}
      {page === "services" && (
        <>
          <Masthead
            crumb="Services"
            title="What I can build for you."
            subtitle="From full CMS builds to hand-coded front-end work — here's how I can help get your site live and performing."
          />

          <section className="sec">
            <div className="wrap">
              <Reveal className="sec-head">
                <Eyebrow>Services</Eyebrow>
                <h2>Every part of the build, covered.</h2>
                <p>Pick a starting point, or bring a project that spans a few of these — most real builds do.</p>
              </Reveal>

              <div className="services-grid">
                {SERVICES.map((s, i) => (
                  <Reveal delay={(i % 3) * 90} key={s.title} className="service-card">
                    <div className="service-card__ic" style={{ background: `${s.color}22` }}>
                      <s.icon size={21} color={s.color} />
                    </div>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                    <div className="service-card__tags">
                      {s.tags.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section className="delivery sec">
            <div className="wrap">
              <Reveal className="sec-head">
                <Eyebrow>What You Can Expect</Eyebrow>
                <h2>Professional delivery, not just a finished page.</h2>
                <p>Every build is approached with communication, responsive quality, and a handoff that remains practical after launch.</p>
              </Reveal>

              <div className="delivery-grid">
                {DELIVERY_STANDARDS.map((item, index) => {
                  const DeliveryIcon = item.icon;
                  return (
                    <Reveal
                      key={item.title}
                      delay={index * 80}
                      className="delivery-card"
                      style={{ "--delivery-color": item.color }}
                    >
                      <span className="delivery-card__icon">
                        <DeliveryIcon size={20} color={item.color} />
                      </span>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.desc}</p>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="process sec">
            <div className="wrap">
              <Reveal className="sec-head sec-head--white">
                <Eyebrow>How It Works</Eyebrow>
                <h2>A simple, four-step process.</h2>
              </Reveal>
              <div className="process-row">
                {PROCESS.map((s, i) => (
                  <Reveal delay={i * 100} key={s.n} className="p-step">
                    <div className="p-step__top">
                      <div className="p-step__ic">
                        <s.icon size={22} color={s.color} />
                      </div>
                      <span className="p-step__num" style={{ color: s.color }}>{s.n}</span>
                    </div>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section className="cta-banner">
            <div className="wrap cta-row">
              <div>
                <h3>Not sure what you need?</h3>
                <p>Tell me about the project and I'll point you in the right direction.</p>
              </div>
              <button className="btn btn-grad" onClick={() => navigateTo("contact", "page")}>
                Start a Conversation <ArrowRight size={15} />
              </button>
            </div>
          </section>
        </>
      )}

      {/* ================================================================ */}
      {/* PROJECTS PAGE                                                    */}
      {/* ================================================================ */}
      {page === "projects" && (
        <>
          <Masthead
            crumb="Projects"
            title="Real websites built around real business needs."
            subtitle="A selected archive of live and staged work across editorial publishing, clean energy, hospitality, financial services, digital agencies, and Shopify commerce."
          />

          <section className="projects projects-page sec">
            <div className="wrap">
              <Reveal className="projects-toolbar">
                <div className="projects-toolbar__summary">
                  <span>Selected work</span>
                  <strong>{filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"}</strong>
                </div>
                <div className="filter-row" role="group" aria-label="Filter projects">
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      className={`filter-pill ${activeFilter === f ? "active" : ""}`}
                      onClick={() => setActiveFilter(f)}
                      aria-pressed={activeFilter === f}
                    >
                      <span>{f}</span>
                    </button>
                  ))}
                </div>
              </Reveal>

              {filteredProjects.length > 0 ? (
                <div className="proj-grid2">
                  {filteredProjects.map((project, index) => (
                    <Reveal
                      as="div"
                      delay={(index % 2) * 90}
                      key={project.id || project.slug || project.title}
                    >
                      <ProjectCard project={project} onOpen={setSelectedProject} />
                    </Reveal>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No projects tagged "{activeFilter}" yet — check back soon.</div>
              )}

            </div>
          </section>

          <section className="sec" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <Reveal className="sec-head">
                <Eyebrow>Academic &amp; Technical</Eyebrow>
                <h2>From my engineering coursework.</h2>
                <p>A few projects from my Computer Engineering degree — the systems-and-hardware side of how I think about building things.</p>
              </Reveal>
              <div className="mini-grid">
                {ACADEMIC_PROJECTS.map((p, i) => (
                  <Reveal delay={i * 90} key={p.title} className="mini-card">
                    <div className="mini-card__ic" style={{ background: `${p.color}22` }}>
                      <p.icon size={19} color={p.color} />
                    </div>
                    <span className="tag">{p.tag}</span>
                    <h4>{p.title}</h4>
                    <p>{p.desc}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section className="cta-banner">
            <div className="wrap cta-row">
              <div>
                <h3>See something you like?</h3>
                <p>Let's talk about building something similar for you.</p>
              </div>
              <button className="btn btn-grad" onClick={() => navigateTo("contact", "page")}>
                Get In Touch <ArrowRight size={15} />
              </button>
            </div>
          </section>
        </>
      )}

      {/* ================================================================ */}
      {/* CONTACT PAGE                                                     */}
      {/* ================================================================ */}
      {page === "contact" && (
        <>
          <Masthead
            crumb="Contact"
            title="Tell me what you're building."
            subtitle="Share the goal, platform, or problem. I'll review the details and reply with clear next steps."
            meta={[
              { icon: Clock3, label: "Usually replies within one business day" },
              { icon: CheckCircle2, label: "No obligation" },
            ]}
          />
          <section className="contact sec">
            <div className="wrap">
              <div className="contact-grid">
                <div>
                  <Reveal className="contact-heading">
                    <span className="dash-eyebrow"><i />Contact Details</span>
                    <h2>Let's build something worth shipping.</h2>
                    <p>
                      Share a few details about your project — the platform, the goal, or just
                      the problem you're trying to solve — and I'll get back to you within a day
                      with clear next steps, no obligation.
                    </p>
                  </Reveal>

                  <Reveal delay={90}>
                    {CONTACT_INFO.map((c) => {
                      const Wrap = c.href ? "a" : "div";
                      return (
                        <Wrap className="c-info-card" key={c.label} href={c.href || undefined}>
                          <div className="c-info-card__ic"><c.icon size={18} /></div>
                          <div>
                            <div className="label">{c.label}</div>
                            <div className="value">{c.value}</div>
                          </div>
                        </Wrap>
                      );
                    })}
                  </Reveal>
                </div>

                <Reveal delay={100} className="c-form">
                  <h3>Send project details</h3>
                  <p className="c-form__intro">A few useful details help me understand the scope before I reply.</p>
                  <form onSubmit={handleFormSubmit} noValidate aria-busy={isSubmitting}>
                    <div className="hp-field" aria-hidden="true">
                      <label htmlFor="cf-website">Website</label>
                      <input
                        id="cf-website"
                        name="website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>
                    <div className="c-form-row two">
                      <div className="c-field">
                        <label htmlFor="cf-name">Name</label>
                        <input
                          id="cf-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          maxLength={80}
                          aria-invalid={Boolean(formError) && !form.name.trim()}
                          placeholder="Your name"
                          value={form.name}
                          onChange={(e) => updateFormField("name", e.target.value)}
                        />
                      </div>
                      <div className="c-field">
                        <label htmlFor="cf-email">Email</label>
                        <input
                          id="cf-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          maxLength={120}
                          aria-invalid={Boolean(formError) && !form.email.trim()}
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => updateFormField("email", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="c-form-row two">
                      <div className="c-field">
                        <label htmlFor="cf-project-type">Project type</label>
                        <select
                          id="cf-project-type"
                          name="projectType"
                          value={form.projectType}
                          onChange={(e) => updateFormField("projectType", e.target.value)}
                        >
                          <option value="">Select a project type</option>
                          {PROJECT_TYPE_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      <div className="c-field">
                        <label htmlFor="cf-budget">Budget range</label>
                        <select
                          id="cf-budget"
                          name="budget"
                          value={form.budget}
                          onChange={(e) => updateFormField("budget", e.target.value)}
                        >
                          <option value="">Select a range</option>
                          {BUDGET_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="c-form-row">
                      <div className="c-field">
                        <label htmlFor="cf-subject">Subject</label>
                        <input
                          id="cf-subject"
                          name="subject"
                          type="text"
                          maxLength={140}
                          placeholder="What's this about?"
                          value={form.subject}
                          onChange={(e) => updateFormField("subject", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="c-form-row">
                      <div className="c-field">
                        <label htmlFor="cf-message">Message</label>
                        <textarea
                          id="cf-message"
                          name="message"
                          required
                          minLength={20}
                          maxLength={3000}
                          aria-invalid={Boolean(formError) && !form.message.trim()}
                          placeholder="Tell me about your project, goals, timeline, and any existing website..."
                          value={form.message}
                          onChange={(e) => updateFormField("message", e.target.value)}
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-grad" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send Project Details"} <Send size={14} />
                    </button>
                    <div className="c-form__reply-note">
                      <Clock3 size={14} /> Usually replies within one business day. No obligation.
                    </div>
                    {formSent && (
                      <div className="c-success" role="status" aria-live="polite">
                        <CheckCircle2 size={15} /> Message sent successfully. I'll reply as soon as possible.
                      </div>
                    )}
                    {formError && <div className="c-error" role="alert">{formError}</div>}
                  </form>
                </Reveal>
              </div>
            </div>
          </section>
        </>
      )}

      {page === "cms" && dynamicPage && (
        <DynamicCmsPage
          cmsPage={dynamicPage}
          preview={cmsPreview}
          onContact={() =>
            navigateTo("contact", "page")
          }
        />
      )}

      {page === "not-found" &&
        cmsConfigLoaded && (
          <section className="masthead">
            <div className="wrap">
              <div className="crumb">
                Haseeb.dev / 404
              </div>
              <h1>Page not found.</h1>
              <p>
                This page does not exist or is not
                published.
              </p>
              <button
                type="button"
                className="btn btn-grad"
                onClick={() =>
                  navigateTo("home", "page")
                }
              >
                Back to Home{" "}
                <ArrowRight size={14} />
              </button>
            </div>
          </section>
        )}
      </main>

      <ProjectCaseStudy project={selectedProject} onClose={() => setSelectedProject(null)} onContact={goToContact} />

      {/* ============ FOOTER ============ */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">
                <span className="logo__mark" />
                <span className="logo__text">Haseeb<span>.dev</span></span>
              </div>
              <p>Building responsive React, WordPress, Shopify, and CMS experiences with clean implementation and practical delivery.</p>
            </div>

            <div>
              <h5>Quick Links</h5>
              <div className="footer-links">
                <a href="/about" onClick={(event) => { event.preventDefault(); navigateTo("about", "page"); }}>About</a>
                <a href="/services" onClick={(event) => { event.preventDefault(); navigateTo("services", "page"); }}>Services</a>
                <a href="/projects" onClick={(event) => { event.preventDefault(); navigateTo("projects", "page"); }}>Projects</a>
                <a href="/process" onClick={(event) => { event.preventDefault(); navigateTo("process", "section"); }}>Process</a>
                <a href="/contact" onClick={(event) => { event.preventDefault(); navigateTo("contact", "page"); }}>Contact</a>
              </div>
            </div>

            <div>
              <h5>Services</h5>
              <div className="footer-links">
                {SERVICES.slice(0, 5).map((s) => (
                  <a
                    key={s.title}
                    href="/services"
                    onClick={(event) => {
                      event.preventDefault();
                      navigateTo("services", "page");
                    }}
                  >
                    {s.title}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h5>Let's Connect</h5>
              <div className="footer-contact">
                <a href="mailto:haseebmujeeb360@gmail.com"><Mail size={14} /> haseebmujeeb360@gmail.com</a>
                <a href="tel:+923353832477"><Phone size={14} /> +92 335 3832477</a>
                <div><MapPin size={14} /> Karachi, Pakistan</div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Haseeb Mujeeb Ansari. All rights reserved.</span>
                     </div>
        </div>
      </footer>
    </div>
  );
}