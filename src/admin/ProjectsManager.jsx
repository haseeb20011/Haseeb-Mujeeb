import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  FileImage,
  FolderKanban,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import MediaPickerModal from "./MediaPickerModal";
import { uploadMediaFile } from "./mediaLibraryClient";
import "./ProjectsManager.css";

const STORAGE_KEY = "portfolio-cms-projects";

const seedSlugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const CASE_STUDY_SEEDS = [
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
    highlight: "Editorial taxonomy Â· Fast mobile reading Â· Content discovery",
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
    projectType: "Clean Energy Â· Lead Generation",
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
    highlight: "Lead capture Â· Funnel design Â· Appointment conversion",
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
    projectType: "Hospitality Â· Booking",
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
    highlight: "Meevo booking Â· Service catalogue Â· Local conversion",
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
    highlight: "Lead qualification Â· Funding comparison Â· Application intake",
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
    projectType: "E-commerce Â· Fashion",
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
    highlight: "Collection architecture Â· Product storytelling Â· Commerce UX",
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
    projectType: "Agency Build Â· Consulting",
    title: "Go Studio",
    domain: "Staged build Â· Pantheon environment",
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
    highlight: "Staged delivery Â· Service architecture Â· Case-study system",
    stack: ["WordPress", "Pantheon", "Component System", "Staging Workflow"],
    details: [
      "Consulting-brand homepage narrative and conversion structure.",
      "Service architecture designed for a growing studio offering.",
      "Case-study templates prepared for consistent future publishing.",
      "Reusable component patterns built ahead of client review.",
      "Pantheon Dev â†’ Test â†’ Live workflow for controlled releases.",
    ],
    image: "/images/projects/go-studio.webp",
    accent: "#FF5A36",
    badgeBg: "#C83A20",
  },
  {
    code: "DF",
    category: "WordPress",
    filters: ["WordPress", "In Development"],
    projectType: "Agency Build Â· Digital Services",
    title: "DGT Forge",
    domain: "Staged build Â· Pantheon environment",
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
    highlight: "Agency architecture Â· Staged WordPress Â· Service positioning",
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
    projectType: "B2B Consulting Â· Technology",
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
    highlight: "B2B positioning Â· Service clarity Â· Enquiry flow",
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

const seedTones = [
  "purple",
  "pink",
  "orange",
  "blue",
  "green",
  "amber",
  "red",
];

const initialProjects = CASE_STUDY_SEEDS.map(
  (project, index) => ({
    id: seedSlugify(project.title),
    title: project.title,
    slug: seedSlugify(project.title),
    legacySlugs:
      project.title === "Teknotch"
        ? ["teknotek"]
        : [],
    code: project.code,
    category: project.projectType,
    projectType: project.projectType,
    status: "published",
    publicStatus: project.status,
    statusTone: project.statusTone,
    description: project.desc,
    domain: project.domain,
    role: project.role,
    platform: project.platform,
    focus: project.focus,
    highlight: project.highlight,
    challenge: project.challenge,
    solution: project.solution,
    outcome: project.outcome,
    details: project.details,
    technologies: project.stack,
    filters: project.filters,
    image: project.image,
    liveUrl: project.liveUrl,
    caseStudyUrl: "",
    caseStudyEnabled: true,
    featured: index < 4,
    accent: project.accent,
    badgeBg: project.badgeBg,
    tone:
      seedTones[index % seedTones.length],
    sortOrder: index,
  })
);

const tones = [
  "purple",
  "pink",
  "orange",
  "blue",
  "green",
  "amber",
  "red",
];

const emptyProject = {
  title: "",
  slug: "",
  code: "",
  category: "Website",
  projectType: "",
  status: "draft",
  publicStatus: "Live",
  statusTone: "live",
  description: "",
  domain: "",
  role: "",
  platform: "",
  focus: "",
  highlight: "",
  challenge: "",
  solution: "",
  outcome: "",
  details: "",
  technologies: "",
  filters: "",
  image: "",
  liveUrl: "",
  caseStudyUrl: "",
  caseStudyEnabled: true,
  featured: false,
  accent: "#8B5CF6",
  badgeBg: "#6D28D9",
  tone: "purple",
};

const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const getInitials = (title) =>
  title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const formatUpdatedAt = (value) => {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const difference = Date.now() - date.getTime();
  const day = 24 * 60 * 60 * 1000;

  if (difference < 60 * 1000) {
    return "Just now";
  }

  if (difference < day) {
    return "Today";
  }

  if (difference < day * 2) {
    return "Yesterday";
  }

  if (difference < day * 7) {
    return `${Math.floor(difference / day)} days ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() ===
      new Date().getFullYear()
        ? undefined
        : "numeric",
  });
};

const normalizeProject = (project) => ({
  ...project,
  id: String(project.id || project._id || ""),
  technologies: Array.isArray(project.technologies)
    ? project.technologies
    : [],
  details: Array.isArray(project.details)
    ? project.details
    : [],
  filters: Array.isArray(project.filters)
    ? project.filters
    : [],
  featured: Boolean(project.featured),
  caseStudyEnabled:
    project.caseStudyEnabled !== false,
  updatedAt: formatUpdatedAt(
    project.updatedAt || project.createdAt
  ),
});

const readMigrationProjects = () =>
  initialProjects.map((project) => ({
    ...project,
  }));

const syncProjectCache = (projects) => {
  // MongoDB is now the source of truth. Remove the old browser
  // cache so large project images can never exhaust localStorage.
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be disabled by the browser. The CMS still works
    // because project data is persisted in MongoDB.
  }

  window.dispatchEvent(
    new CustomEvent("portfolio-projects-updated", {
      detail: {
        projects,
        count: projects.length,
      },
    })
  );
};

const fetchJson = async (
  endpoint,
  options = {}
) => {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    }
  );

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (response.status === 401) {
    window.location.assign("/admin/login");

    throw new Error(
      "Your admin session has expired."
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        "The project request could not be completed."
    );
  }

  return data;
};

const toProjectPayload = (form) => ({
  title: form.title.trim(),
  slug: slugify(form.slug || form.title),
  code: form.code.trim().toUpperCase(),
  category:
    form.category.trim() || "Website",
  projectType: form.projectType.trim(),
  status: form.status,
  publicStatus:
    form.publicStatus.trim() || "Live",
  statusTone: form.statusTone,
  description: form.description.trim(),
  domain: form.domain.trim(),
  role: form.role.trim(),
  platform: form.platform.trim(),
  focus: form.focus.trim(),
  highlight: form.highlight.trim(),
  challenge: form.challenge.trim(),
  solution: form.solution.trim(),
  outcome: form.outcome.trim(),
  details: form.details
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean),
  technologies: form.technologies
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  filters: form.filters
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  image: form.image,
  liveUrl: form.liveUrl.trim(),
  caseStudyUrl: form.caseStudyUrl.trim(),
  caseStudyEnabled: form.caseStudyEnabled,
  featured: form.featured,
  accent: form.accent,
  badgeBg: form.badgeBg,
  tone: form.tone,
});

export default function ProjectsManager({
  openCreateOnLoad = false,
}) {
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [categoryFilter, setCategoryFilter] =
    useState("all");
  const [modalOpen, setModalOpen] =
    useState(openCreateOnLoad);
  const [editingId, setEditingId] =
    useState(null);
  const [slugEdited, setSlugEdited] =
    useState(false);
  const [form, setForm] =
    useState(emptyProject);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  const applyProjects = (nextProjects) => {
    const normalizedProjects =
      nextProjects.map(normalizeProject);

    setProjects(normalizedProjects);
    syncProjectCache(normalizedProjects);
  };


const loadProjectsFromMongoDb = async () => {
  setLoading(true);
  setLoadError("");

  try {
    const migrationProjects =
      readMigrationProjects();

    const data = await fetchJson(
      "/api/projects/sync-defaults",
      {
        method: "POST",
        body: JSON.stringify({
          projects: migrationProjects,
        }),
      }
    );

    const nextProjects = Array.isArray(
      data.projects
    )
      ? data.projects
      : [];

    applyProjects(nextProjects);
  } catch (requestError) {
    setLoadError(requestError.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadProjectsFromMongoDb();
  }, []);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          projects
            .map((project) => project.category)
            .filter(Boolean)
        )
      ).sort(),
    [projects]
  );

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return projects.filter((project) => {
      const searchable = [
        project.title,
        project.slug,
        project.category,
        project.description,
        ...(project.technologies || []),
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        !normalizedQuery ||
        searchable.includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "all" ||
        project.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        project.category === categoryFilter;

      return (
        matchesQuery &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    projects,
    query,
    statusFilter,
    categoryFilter,
  ]);

  const publishedCount = projects.filter(
    (project) => project.status === "published"
  ).length;

  const draftCount = projects.filter(
    (project) => project.status === "draft"
  ).length;

  const featuredCount = projects.filter(
    (project) => project.featured
  ).length;

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setSlugEdited(false);
    setForm(emptyProject);
    setFormError("");
  };

  const openCreateModal = () => {
    setEditingId(null);
    setSlugEdited(false);
    setForm(emptyProject);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingId(project.id);
    setSlugEdited(true);
    setFormError("");


setForm({
  title: project.title || "",
  slug: project.slug || "",
  code: project.code || "",
  category: project.category || "Website",
  projectType: project.projectType || "",
  status: project.status || "draft",
  publicStatus: project.publicStatus || "Live",
  statusTone:
    project.statusTone || "live",
  description: project.description || "",
  domain: project.domain || "",
  role: project.role || "",
  platform: project.platform || "",
  focus: project.focus || "",
  highlight: project.highlight || "",
  challenge: project.challenge || "",
  solution: project.solution || "",
  outcome: project.outcome || "",
  details: (
    project.details || []
  ).join("\n"),
  technologies: (
    project.technologies || []
  ).join(", "),
  filters: (
    project.filters || []
  ).join(", "),
  image: project.image || "",
  liveUrl: project.liveUrl || "",
  caseStudyUrl:
    project.caseStudyUrl || "",
  caseStudyEnabled:
    project.caseStudyEnabled !== false,
  featured: Boolean(project.featured),
  accent: project.accent || "#8B5CF6",
  badgeBg: project.badgeBg || "#6D28D9",
  tone: project.tone || "purple",
});;

    setModalOpen(true);
  };

  const handleTitleChange = (event) => {
    const title = event.target.value;

    setForm((current) => ({
      ...current,
      title,
      slug: slugEdited
        ? current.slug
        : slugify(title),
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormError(
        "Project images must be an image file."
      );
      event.target.value = "";
      return;
    }

    setImageUploading(true);
    setImageUploadProgress(0);
    setFormError("");

    try {
      const mediaItem = await uploadMediaFile(
        file,
        {
          onProgress: setImageUploadProgress,
        }
      );

      setForm((current) => ({
        ...current,
        image: mediaItem.url,
      }));
    } catch (requestError) {
      setFormError(
        requestError.message ||
          "Project image upload failed."
      );
    } finally {
      setImageUploading(false);
      setImageUploadProgress(0);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = toProjectPayload(form);

    if (!payload.title || !payload.slug) {
      setFormError(
        "Project title and project slug are required."
      );
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const data = await fetchJson(
        editingId
          ? `/api/projects/${editingId}`
          : "/api/projects",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );

      const savedProject = normalizeProject(
        data.project
      );

      const nextProjects = editingId
        ? projects.map((project) =>
            project.id === editingId
              ? savedProject
              : project
          )
        : [savedProject, ...projects];

      applyProjects(nextProjects);
      setModalOpen(false);
      setEditingId(null);
      setSlugEdited(false);
      setForm(emptyProject);
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (project) => {
    if (busyId) {
      return;
    }

    setBusyId(project.id);

    try {
      const data = await fetchJson(
        `/api/projects/${project.id}/duplicate`,
        {
          method: "POST",
          body: JSON.stringify({}),
        }
      );

      applyProjects([
        normalizeProject(data.project),
        ...projects,
      ]);
    } catch (requestError) {
      window.alert(requestError.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (project) => {
    const confirmed = window.confirm(
      `Delete "${project.title}" permanently?`
    );

    if (!confirmed || busyId) {
      return;
    }

    setBusyId(project.id);

    try {
      await fetchJson(
        `/api/projects/${project.id}`,
        {
          method: "DELETE",
        }
      );

      applyProjects(
        projects.filter(
          (item) => item.id !== project.id
        )
      );
    } catch (requestError) {
      window.alert(requestError.message);
    } finally {
      setBusyId(null);
    }
  };

  const toggleFeatured = async (projectId) => {
    if (busyId) {
      return;
    }

    const project = projects.find(
      (item) => item.id === projectId
    );

    if (!project) {
      return;
    }

    setBusyId(projectId);

    try {
      const data = await fetchJson(
        `/api/projects/${projectId}/featured`,
        {
          method: "PATCH",
          body: JSON.stringify({
            featured: !project.featured,
          }),
        }
      );

      const updatedProject = normalizeProject(
        data.project
      );

      applyProjects(
        projects.map((item) =>
          item.id === projectId
            ? updatedProject
            : item
        )
      );
    } catch (requestError) {
      window.alert(requestError.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="cms-projects">
      <header className="cms-projects__header">
        <div>
          <span className="cms-projects__eyebrow">
            Portfolio content
          </span>

          <h1>Projects</h1>

          <p>
            Add, organize, feature, and publish the
            portfolio projects displayed across your
            website.
          </p>
        </div>

        <button
          type="button"
          className="cms-projects__create"
          onClick={openCreateModal}
        >
          <Plus size={17} />
          Add new project
        </button>
      </header>

      <section className="cms-projects__summary">
        <article className="cms-projects__summary-intro">
          <span>
            <Sparkles size={16} />
            Project library
          </span>

          <strong>
            Manage each project once and reuse it
            across your portfolio sections.
          </strong>

          <p>
            Projects are saved permanently in MongoDB
            and published projects are displayed
            automatically on the public website.
          </p>
        </article>

        <div className="cms-projects__stats">
          <ProjectStat
            label="Total projects"
            value={projects.length}
            detail="Portfolio records"
            icon={FolderKanban}
            tone="purple"
          />

          <ProjectStat
            label="Published"
            value={publishedCount}
            detail="Visible projects"
            icon={CheckCircle2}
            tone="green"
          />

          <ProjectStat
            label="Featured"
            value={featuredCount}
            detail="Homepage selection"
            icon={Star}
            tone="orange"
          />

          <ProjectStat
            label="Drafts"
            value={draftCount}
            detail="Not published yet"
            icon={FileImage}
            tone="blue"
          />
        </div>
      </section>

      <section className="cms-projects__management">
        <header className="cms-projects__toolbar">
          <div>
            <h2>Project library</h2>

            <p>
              {filteredProjects.length} of{" "}
              {projects.length} projects shown
            </p>
          </div>

          <div className="cms-projects__filters">
            <label className="cms-projects__search">
              <Search size={16} />

              <input
                type="search"
                placeholder="Search projects, categories, or technology..."
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </label>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              aria-label="Filter projects by category"
            >
              <option value="all">
                All categories
              </option>

              {categories.map((category) => (
                <option
                  value={category}
                  key={category}
                >
                  {category}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              aria-label="Filter projects by status"
            >
              <option value="all">
                All statuses
              </option>
              <option value="published">
                Published
              </option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </header>

        <div className="cms-projects__grid">
          {!loading &&
            filteredProjects.map((project) => (
            <article
              className="cms-project-card"
              key={project.id}
            >
              <div className="cms-project-card__media">
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.title}
                  />
                ) : (
                  <div
                    className={`cms-project-card__fallback is-${project.tone}`}
                  >
                    <span>
                      {getInitials(project.title)}
                    </span>

                    <small>{project.category}</small>
                  </div>
                )}

                <span
                  className={`cms-project-card__status is-${project.status}`}
                >
                  <i />
                  {project.status}
                </span>

                <button
                  type="button"
                  className={`cms-project-card__featured ${
                    project.featured
                      ? "is-active"
                      : ""
                  }`}
                  onClick={() =>
                    toggleFeatured(project.id)
                  }
                  title={
                    project.featured
                      ? "Remove from featured projects"
                      : "Add to featured projects"
                  }
                  aria-label={
                    project.featured
                      ? `Remove ${project.title} from featured projects`
                      : `Feature ${project.title}`
                  }
                >
                  <Star
                    size={15}
                    fill={
                      project.featured
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>
              </div>

              <div className="cms-project-card__body">
                <div className="cms-project-card__heading">
                  <div>
                    <span>{project.category}</span>
                    <h3>{project.title}</h3>
                  </div>

                  <small>{project.updatedAt}</small>
                </div>

                <p>{project.description}</p>

                <div className="cms-project-card__tags">
                  {(project.technologies || [])
                    .slice(0, 4)
                    .map((technology) => (
                      <span key={technology}>
                        {technology}
                      </span>
                    ))}
                </div>
              </div>

              <footer className="cms-project-card__actions">
                <button
                  type="button"
                  className="is-edit"
                  onClick={() =>
                    openEditModal(project)
                  }
                >
                  <Pencil size={14} />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDuplicate(project)
                  }
                  title="Duplicate project"
                  aria-label={`Duplicate ${project.title}`}
                >
                  <Copy size={14} />
                </button>

                {(project.liveUrl ||
                  project.caseStudyUrl) && (
                  <a
                    href={
                      project.liveUrl ||
                      project.caseStudyUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    title="Preview project"
                    aria-label={`Preview ${project.title}`}
                  >
                    <Eye size={14} />
                  </a>
                )}

                <button
                  type="button"
                  className="is-delete"
                  onClick={() =>
                    handleDelete(project)
                  }
                  title="Delete project"
                  aria-label={`Delete ${project.title}`}
                >
                  <Trash2 size={14} />
                </button>
              </footer>
            </article>
          ))}

          {loading && (
            <div className="cms-projects__empty">
              <span>
                <FolderKanban size={25} />
              </span>

              <strong>Loading projects</strong>

              <p>
                Reading permanent project records
                from MongoDB.
              </p>
            </div>
          )}

          {!loading && loadError && (
            <div className="cms-projects__empty">
              <span>
                <X size={25} />
              </span>

              <strong>Projects could not load</strong>

              <p>{loadError}</p>

              <button
                type="button"
                onClick={loadProjectsFromMongoDb}
              >
                Try again
              </button>
            </div>
          )}

          {!loading &&
            !loadError &&
            filteredProjects.length === 0 && (
            <div className="cms-projects__empty">
              <span>
                <Search size={25} />
              </span>

              <strong>No matching projects</strong>

              <p>
                Change your filters or add a new
                portfolio project.
              </p>

              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>

      {modalOpen && (
        <div
          className="cms-projects__modal-overlay"
          onMouseDown={closeModal}
          role="presentation"
        >
          <section
            className="cms-projects__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <header>
              <div className="cms-projects__modal-heading">
                <span>
                  {editingId ? (
                    <Pencil size={20} />
                  ) : (
                    <FolderKanban size={20} />
                  )}
                </span>

                <div>
                  <small>
                    Portfolio project
                  </small>

                  <h2 id="project-modal-title">
                    {editingId
                      ? "Edit project"
                      : "Add new project"}
                  </h2>

                  <p>
                    Project details are saved securely
                    to the MongoDB database.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="cms-projects__modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handleSubmit}>
              {formError && (
                <div
                  className="cms-projects__field cms-projects__field--wide"
                  role="alert"
                >
                  <span>{formError}</span>
                </div>
              )}

              <div className="cms-projects__form-grid">
                <label className="cms-projects__field">
                  <span>Project title</span>

                  <input
                    type="text"
                    value={form.title}
                    onChange={handleTitleChange}
                    placeholder="Example: Holiday Weekly"
                    required
                    autoFocus
                  />
                </label>

                <label className="cms-projects__field">
                  <span>Project slug</span>

                  <input
                    type="text"
                    value={form.slug}
                    onChange={(event) => {
                      setSlugEdited(true);

                      setForm((current) => ({
                        ...current,
                        slug: event.target.value,
                      }));
                    }}
                    placeholder="holiday-weekly"
                    required
                  />
                </label>

                <label className="cms-projects__field">
                  <span>Category</span>

                  <input
                    type="text"
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        category:
                          event.target.value,
                      }))
                    }
                    placeholder="News & Media"
                  />
                </label>

                <label className="cms-projects__field">
                  <span>Status</span>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status:
                          event.target.value,
                      }))
                    }
                  >
                    <option value="draft">
                      Draft
                    </option>

                    <option value="published">
                      Published
                    </option>
                  </select>
                </label>

                <label className="cms-projects__field">
                  <span>Project code</span>

                  <input
                    type="text"
                    value={form.code}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        code: event.target.value,
                      }))
                    }
                    placeholder="HW"
                    maxLength={10}
                  />
                </label>

                <label className="cms-projects__field">
                  <span>Case study type</span>

                  <input
                    type="text"
                    value={form.projectType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        projectType:
                          event.target.value,
                      }))
                    }
                    placeholder="News & Media"
                  />
                </label>

                <label className="cms-projects__field">
                  <span>Public status label</span>

                  <input
                    type="text"
                    value={form.publicStatus}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        publicStatus:
                          event.target.value,
                      }))
                    }
                    placeholder="Live"
                  />
                </label>

                <label className="cms-projects__field">
                  <span>Public status style</span>

                  <select
                    value={form.statusTone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        statusTone:
                          event.target.value,
                      }))
                    }
                  >
                    <option value="live">
                      Live
                    </option>
                    <option value="development">
                      In Development
                    </option>
                  </select>
                </label>

                <label className="cms-projects__field cms-projects__field--wide">
                  <span>Short description</span>

                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description:
                          event.target.value,
                      }))
                    }
                    placeholder="Briefly explain the project and the result."
                  />
</label>

<label className="cms-projects__field">
  <span>Website domain</span>

  <input
    type="text"
    value={form.domain}
    onChange={(event) =>
      setForm((current) => ({
        ...current,
        domain: event.target.value,
      }))
    }
    placeholder="holidayweekly.pk"
  />
</label>

<label className="cms-projects__field">
  <span>My role</span>

  <input
    type="text"
    value={form.role}
    onChange={(event) =>
      setForm((current) => ({
        ...current,
        role: event.target.value,
      }))
    }
    placeholder="Design & Development"
  />
</label>

<label className="cms-projects__field">
  <span>Platform</span>

  <input
    type="text"
    value={form.platform}
    onChange={(event) =>
      setForm((current) => ({
        ...current,
        platform:
          event.target.value,
      }))
    }
    placeholder="WordPress + Elementor"
  />
</label>

<label className="cms-projects__field">
  <span>Primary focus</span>

  <input
    type="text"
    value={form.focus}
    onChange={(event) =>
      setForm((current) => ({
        ...current,
        focus: event.target.value,
      }))
    }
    placeholder="Editorial CMS architecture"
  />
</label>

<label className="cms-projects__field cms-projects__field--wide">
  <span>Card focus text</span>

  <input
    type="text"
    value={form.highlight}
    onChange={(event) =>
      setForm((current) => ({
        ...current,
        highlight:
          event.target.value,
      }))
    }
    placeholder="Editorial taxonomy Â· Fast mobile reading"
  />
</label>

<label className="cms-projects__field cms-projects__field--wide">
  <span>Challenge</span>

  <textarea
    rows={3}
    value={form.challenge}
    onChange={(event) =>
      setForm((current) => ({
        ...current,
        challenge:
          event.target.value,
      }))
    }
    placeholder="What problem needed to be solved?"
  />
</label>

<label className="cms-projects__field cms-projects__field--wide">
  <span>Solution</span>

  <textarea
    rows={3}
    value={form.solution}
    onChange={(event) =>
      setForm((current) => ({
        ...current,
        solution:
          event.target.value,
      }))
    }
    placeholder="What solution did you build?"
  />
</label>

<label className="cms-projects__field cms-projects__field--wide">
  <span>Outcome</span>

  <textarea
    rows={3}
    value={form.outcome}
    onChange={(event) =>
      setForm((current) => ({
        ...current,
        outcome:
          event.target.value,
      }))
    }
    placeholder="What was the practical result?"
  />
</label>

<label className="cms-projects__field cms-projects__field--wide">
  <span>
    What I built
    <small>
      Add one item per line
    </small>
  </span>

  <textarea
    rows={6}
    value={form.details}
    onChange={(event) =>
      setForm((current) => ({
        ...current,
        details:
          event.target.value,
      }))
    }
    placeholder={"Homepage modules\nResponsive layouts\nLead capture forms"}
  />
</label>

<label className="cms-projects__field cms-projects__field--wide">
  <span>
    Technologies
                    <small>
                      Separate each item with a comma
                    </small>
                  </span>

                  <input
                    type="text"
                    value={form.technologies}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        technologies:
                          event.target.value,
                      }))
                    }
                    placeholder="WordPress, Elementor, Responsive"
                  />
                </label>

                <label className="cms-projects__field cms-projects__field--wide">
                  <span>
                    Project filters
                    <small>
                      Separate with commas
                    </small>
                  </span>

                  <input
                    type="text"
                    value={form.filters}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        filters:
                          event.target.value,
                      }))
                    }
                    placeholder="WordPress, Live"
                  />
                </label>

                <div className="cms-projects__image-field">
                  <span>Project image</span>

                  <div className="cms-projects__image-preview">
                    {form.image ? (
                      <img
                        src={form.image}
                        alt=""
                      />
                    ) : (
                      <ImagePlus size={30} />
                    )}
                  </div>

                  <div className="cms-projects__image-actions">
                    <label className="cms-projects__upload">
                      <UploadCloud size={15} />
                      {imageUploading
                        ? `Uploading ${imageUploadProgress}%`
                        : "Upload new"}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={imageUploading}
                      />
                    </label>

                    <button
                      type="button"
                      className="cms-projects__upload cms-projects__choose-media"
                      onClick={() =>
                        setMediaPickerOpen(true)
                      }
                      disabled={imageUploading}
                    >
                      <ImagePlus size={15} />
                      Choose from Media Library
                    </button>
                  </div>

                  <input
                    type="text"
                    value={form.image}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        image: event.target.value,
                      }))
                    }
                    placeholder="Or paste an image URL"
                  />

                  <small className="cms-projects__image-help">
                    New uploads are stored in Vercel Blob and added automatically to the Media Library.
                  </small>
                </div>

                <div className="cms-projects__links">
                  <label className="cms-projects__field">
                    <span>
                      <ExternalLink size={12} />
                      Live website URL
                    </span>

                    <input
                      type="url"
                      value={form.liveUrl}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          liveUrl:
                            event.target.value,
                        }))
                      }
                      placeholder="https://example.com"
                    />
                  </label>

                  <label className="cms-projects__field">
                    <span>
                      <ExternalLink size={12} />
                      Case study URL
                    </span>

                    <input
                      type="text"
                      value={form.caseStudyUrl}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          caseStudyUrl:
                            event.target.value,
                        }))
                      }
                      placeholder="/projects/project-name"
                    />
                  </label>

                  <label className="cms-projects__field">
                    <span>Accent color</span>

                    <input
                      type="color"
                      value={form.accent}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          accent:
                            event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="cms-projects__field">
                    <span>Badge color</span>

                    <input
                      type="color"
                      value={form.badgeBg}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          badgeBg:
                            event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="cms-projects__featured-toggle">
                    <span>
                      <strong>
                        Enable case study popup
                      </strong>

                      <small>
                        Show the View Case Study button
                        and editable popup content.
                      </small>
                    </span>

                    <input
                      type="checkbox"
                      checked={form.caseStudyEnabled}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          caseStudyEnabled:
                            event.target.checked,
                        }))
                      }
                    />
                  </label>

                  <label className="cms-projects__featured-toggle">
                    <span>
                      <strong>
                        Featured project
                      </strong>

                      <small>
                        Show this published project in
                        Homepage Featured Projects.
                      </small>
                    </span>

                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          featured:
                            event.target.checked,
                        }))
                      }
                    />
                  </label>
                </div>
              </div>

              <footer>
                <button
                  type="button"
                  className="cms-projects__cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="cms-projects__save"
                  disabled={saving}
                >
                  <CheckCircle2 size={16} />
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save project"
                      : "Create project"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
      <MediaPickerModal
        open={mediaPickerOpen}
        currentUrl={form.image}
        onClose={() =>
          setMediaPickerOpen(false)
        }
        onSelect={(item) =>
          setForm((current) => ({
            ...current,
            image: item.url,
          }))
        }
      />
    </section>
  );
}

function ProjectStat({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}) {
  return (
    <article
      className={`cms-projects__stat is-${tone}`}
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

