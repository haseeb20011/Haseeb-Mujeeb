const ensureObject = (value) =>
  value && typeof value === "object" ? value : {};

export function createEmptyCmsEdit() {
  return {
    meta: {},
    content: {
      eyebrow: "",
      heading: "",
      description: "",
      primaryButton: "",
      primaryButtonUrl: "",
      secondaryButton: "",
      secondaryButtonUrl: "",
      imageUrl: "",
      imageAlt: "",
    },
    style: {
      enabled: false,
      background: "",
      text: "",
      heading: "",
      align: "",
    },
    advanced: {
      enabled: false,
      desktopTop: "",
      desktopBottom: "",
      mobileTop: "",
      mobileBottom: "",
      hideDesktop: false,
      hideTablet: false,
      hideMobile: false,
    },
  };
}

const findButtons = (element) =>
  Array.from(
    element.querySelectorAll(
      "a.btn, button.btn, .nav-cta, a[class*='button'], button[class*='button']"
    )
  );

const firstTextElement = (element, selectors, excluded = []) => {
  for (const selector of selectors) {
    const matches = Array.from(element.querySelectorAll(selector));

    const match = matches.find(
      (node) =>
        !excluded.includes(node) &&
        node.textContent?.trim()
    );

    if (match) return match;
  }

  return null;
};

const findContentTargets = (element, mode = "section") => {
  const buttons = findButtons(element);

  const eyebrow = firstTextElement(element, [
    ".hi-badge",
    ".eyebrow2",
    ".crumb",
    "[class*='eyebrow']",
    "[class*='badge']",
  ]);

  // Blocks such as the Hero statistics and skill bars use <b>, while
  // regular section headings use semantic heading tags. Keep block
  // targeting richer without allowing a section to accidentally capture
  // arbitrary bold text from one of its nested cards.
  const headingSelectors =
    mode === "block"
      ? [
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          ".stat-item b",
          ".code-skill b",
          ".about-card strong",
          ".tech-group strong",
          ".p-step strong",
          ".service-card strong",
          ".delivery-card strong",
          ".journey-card strong",
          ".principle-card strong",
          ".mini-card strong",
          ".beyond-item b",
          ".beyond-item strong",
          "[class*='title']",
          "b",
          "strong",
        ]
      : [
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "[class*='title']",
        ];

  const heading = firstTextElement(
    element,
    headingSelectors,
    [eyebrow]
  );

  const descriptionSelectors =
    mode === "block"
      ? [
          "p",
          ".stat-item small",
          ".stat-item span",
          ".code-skill small",
          ".code-skill span",
          ".beyond-item small",
          "[class*='desc']",
          "[class*='subtitle']",
          "small",
          "span",
        ]
      : [
          "p.lead",
          ".sec-head p",
          ".about-copy p",
          ".opportunity-copy p",
          ".masthead p",
          "p",
          "[class*='desc']",
          "[class*='subtitle']",
        ];

  const description = firstTextElement(
    element,
    descriptionSelectors,
    [eyebrow, heading]
  );

  return {
    eyebrow,
    heading,
    description,
    primaryButton: buttons[0] || null,
    secondaryButton: buttons[1] || null,
    image: element.querySelector("img"),
  };
};

const captureElement = (element, meta = {}) => {
  const targets = findContentTargets(
    element,
    meta.kind === "block" ? "block" : "section"
  );
  const edit = createEmptyCmsEdit();

  edit.meta = meta;
  edit.content.eyebrow =
    targets.eyebrow?.textContent?.trim() || "";
  edit.content.heading =
    targets.heading?.textContent?.trim() || "";
  edit.content.description =
    targets.description?.textContent?.trim() || "";
  edit.content.primaryButton =
    targets.primaryButton?.textContent?.trim() || "";
  edit.content.primaryButtonUrl =
    targets.primaryButton?.getAttribute?.("href") || "";
  edit.content.secondaryButton =
    targets.secondaryButton?.textContent?.trim() || "";
  edit.content.secondaryButtonUrl =
    targets.secondaryButton?.getAttribute?.("href") || "";
  edit.content.imageUrl =
    targets.image?.getAttribute?.("src") || "";
  edit.content.imageAlt =
    targets.image?.getAttribute?.("alt") || "";

  return {
    edit,
    capabilities: {
      eyebrow: Boolean(targets.eyebrow),
      heading: Boolean(targets.heading),
      description: Boolean(targets.description),
      primaryButton: Boolean(targets.primaryButton),
      primaryButtonUrl:
        targets.primaryButton?.tagName === "A",
      secondaryButton: Boolean(targets.secondaryButton),
      secondaryButtonUrl:
        targets.secondaryButton?.tagName === "A",
      image: Boolean(targets.image),
    },
  };
};

const resolveSectionElement = (doc, section) => {
  if (section.selector) {
    return doc.querySelector(section.selector);
  }

  if (section.contains) {
    return doc
      .querySelector(section.contains)
      ?.closest("section");
  }

  return null;
};

const cssEscape = (doc, value) => {
  const escape =
    doc?.defaultView?.CSS?.escape ||
    globalThis.CSS?.escape;

  if (escape) return escape(value);

  return String(value).replace(
    /[^a-zA-Z0-9_-]/g,
    "\\$&"
  );
};

const safeIdSelector = (doc, element) =>
  element.id
    ? `#${cssEscape(doc, element.id)}`
    : "";

export function getCmsTargets(doc, schema = {}) {
  if (!doc) return [];

  const targets = [];
  const schemaSections = Array.isArray(schema?.sections)
    ? schema.sections
    : [];

  if (schemaSections.length > 0) {
    schemaSections.forEach((section, sectionIndex) => {
      const element = resolveSectionElement(doc, section);
      if (!element) return;

      const selector =
        section.selector ||
        safeIdSelector(doc, element) ||
        `main#main-content > section:nth-of-type(${sectionIndex + 1})`;

      const key =
        section.id ||
        element.id ||
        `section-${sectionIndex + 1}`;

      const meta = {
        kind: "section",
        selector,
        label: section.label || `Section ${sectionIndex + 1}`,
      };

      const captured = captureElement(element, meta);

      targets.push({
        key,
        parentKey: null,
        kind: "section",
        label: meta.label,
        element,
        meta,
        captured: captured.edit,
        capabilities: captured.capabilities,
      });

      (section.blocks || []).forEach((block) => {
        if (!block.selector) return;

        const blockElements = Array.from(
          element.querySelectorAll(block.selector)
        );

        blockElements.forEach((blockElement, blockIndex) => {
          const blockKey = `${key}::${block.id || "block"}::${blockIndex}`;
          const blockMeta = {
            kind: "block",
            rootSelector: selector,
            selector: block.selector,
            index: blockIndex,
            label: `${block.label || "Block"} ${blockIndex + 1}`,
          };

          const blockCaptured = captureElement(
            blockElement,
            blockMeta
          );

          targets.push({
            key: blockKey,
            parentKey: key,
            kind: "block",
            label: blockMeta.label,
            element: blockElement,
            meta: blockMeta,
            captured: blockCaptured.edit,
            capabilities: blockCaptured.capabilities,
          });
        });
      });
    });

    return targets;
  }

  const genericSections = Array.from(
    doc.querySelectorAll(
      "main#main-content.main-content > section, main.main-content > section"
    )
  );

  genericSections.forEach((element, index) => {
    const key =
      element.id || `cms-section-${index + 1}`;
    const selector =
      safeIdSelector(doc, element) ||
      `main#main-content > section:nth-of-type(${index + 1})`;
    const label =
      element.querySelector("h1, h2, h3")?.textContent?.trim() ||
      `Section ${index + 1}`;
    const meta = {
      kind: "section",
      selector,
      label,
    };

    const captured = captureElement(element, meta);

    targets.push({
      key,
      parentKey: null,
      kind: "section",
      label,
      element,
      meta,
      captured: captured.edit,
      capabilities: captured.capabilities,
    });
  });

  return targets;
}

const locateElement = (doc, key, meta = {}) => {
  if (!doc) return null;

  if (
    meta.kind === "block" &&
    meta.rootSelector &&
    meta.selector
  ) {
    const root = doc.querySelector(meta.rootSelector);
    if (!root) return null;

    return (
      root.querySelectorAll(meta.selector)[
        Number(meta.index) || 0
      ] || null
    );
  }

  if (meta.selector) {
    return doc.querySelector(meta.selector);
  }

  if (key && !key.includes("::")) {
    try {
      return doc.querySelector(
        `#${cssEscape(doc, key)}`
      );
    } catch {
      return null;
    }
  }

  return null;
};

const rememberOriginalStyles = (element) => {
  if (element.dataset.cmsOriginalStyles) return;

  const heading = element.querySelector("h1, h2, h3");

  element.dataset.cmsOriginalStyles = JSON.stringify({
    backgroundColor: element.style.backgroundColor || "",
    color: element.style.color || "",
    textAlign: element.style.textAlign || "",
    paddingTop: element.style.paddingTop || "",
    paddingBottom: element.style.paddingBottom || "",
    display: element.style.display || "",
    headingColor: heading?.style.color || "",
  });
};

const restoreOriginalStyles = (element) => {
  rememberOriginalStyles(element);

  let original = {};

  try {
    original = JSON.parse(
      element.dataset.cmsOriginalStyles || "{}"
    );
  } catch {
    original = {};
  }

  element.style.backgroundColor =
    original.backgroundColor || "";
  element.style.color = original.color || "";
  element.style.textAlign = original.textAlign || "";
  element.style.paddingTop = original.paddingTop || "";
  element.style.paddingBottom =
    original.paddingBottom || "";
  element.style.display = original.display || "";

  const heading = element.querySelector("h1, h2, h3");
  if (heading) {
    heading.style.color = original.headingColor || "";
  }
};

const meaningfulText = (value) =>
  typeof value === "string" ? value.trim() : "";

const directTextNodes = (element) =>
  Array.from(element?.childNodes || []).filter(
    (node) => node.nodeType === 3
  );

const setText = (element, value) => {
  if (!element || typeof value !== "string") return;

  const currentText = meaningfulText(element.textContent || "");
  const nextText = meaningfulText(value);

  // Captured values are trimmed. Comparing normalized text prevents an
  // initial hydration from replacing button contents and deleting SVG icons.
  if (currentText === nextText) return;

  const children = Array.from(element.children || []);
  const textNodes = directTextNodes(element);
  const textBearingChildren = children.filter((child) =>
    meaningfulText(child.textContent || "")
  );

  // Buttons/links usually contain a text node plus an SVG icon. Update the
  // label without replacing the icon element.
  if (
    (element.tagName === "BUTTON" || element.tagName === "A") &&
    textNodes.length > 0 &&
    textBearingChildren.length === 0
  ) {
    textNodes.forEach((node, index) => {
      node.nodeValue = index === 0 ? `${value} ` : "";
    });
    return;
  }

  // Preserve the styled accent span in the home Hero when the heading is
  // edited. The same number of trailing words stays inside the accent span.
  const accent = element.querySelector(":scope > .hero-title-accent");
  if (accent && textNodes.length > 0) {
    const accentWordCount = Math.max(
      1,
      meaningfulText(accent.textContent || "").split(/\s+/).length
    );
    const words = nextText.split(/\s+/).filter(Boolean);

    if (words.length > accentWordCount) {
      const accentText = words.slice(-accentWordCount).join(" ");
      const prefixText = words.slice(0, -accentWordCount).join(" ");
      accent.textContent = accentText;
      textNodes.forEach((node, index) => {
        node.nodeValue = index === 0 ? `${prefixText} ` : "";
      });
      return;
    }
  }

  // Preserve a single existing inline text element (for example the bold
  // name at the start of the Hero description) when its text remains part
  // of the edited value.
  if (textBearingChildren.length === 1 && textNodes.length > 0) {
    const child = textBearingChildren[0];
    const childText = meaningfulText(child.textContent || "");
    const childIndex = Array.from(element.childNodes).indexOf(child);
    const before = textNodes.filter(
      (node) => Array.from(element.childNodes).indexOf(node) < childIndex
    );
    const after = textNodes.filter(
      (node) => Array.from(element.childNodes).indexOf(node) > childIndex
    );

    if (nextText.endsWith(childText) && before.length > 0) {
      const prefix = value.slice(0, value.lastIndexOf(childText));
      textNodes.forEach((node) => {
        node.nodeValue = "";
      });
      before[0].nodeValue = prefix;
      return;
    }

    if (nextText.startsWith(childText) && after.length > 0) {
      const suffix = value.slice(value.indexOf(childText) + childText.length);
      textNodes.forEach((node) => {
        node.nodeValue = "";
      });
      after[0].nodeValue = suffix;
      return;
    }
  }

  element.textContent = value;
};

const setAttribute = (element, name, value, { removeEmpty = false } = {}) => {
  if (!element || typeof value !== "string") return;

  if (!value && removeEmpty) {
    element.removeAttribute(name);
    return;
  }

  if (!value) return;

  if (element.getAttribute(name) !== value) {
    element.setAttribute(name, value);
  }
};

const resolveDevice = (device) => {
  if (
    device === "desktop" ||
    device === "tablet" ||
    device === "mobile"
  ) {
    return device;
  }

  const width =
    typeof device === "number"
      ? device
      : typeof window !== "undefined"
        ? window.innerWidth
        : 1440;

  if (width <= 767) return "mobile";
  if (width <= 1100) return "tablet";
  return "desktop";
};

export function applyCmsStateToDocument(
  doc,
  state,
  device = "desktop"
) {
  if (!doc || !state || typeof state !== "object") return;

  const resolvedDevice = resolveDevice(device);

  Object.entries(state).forEach(([key, rawEdit]) => {
    if (!rawEdit || typeof rawEdit !== "object") return;

    const empty = createEmptyCmsEdit();
    const edit = {
      ...empty,
      ...rawEdit,
      meta: ensureObject(rawEdit.meta),
      content: {
        ...empty.content,
        ...ensureObject(rawEdit.content),
      },
      style: {
        ...empty.style,
        ...ensureObject(rawEdit.style),
      },
      advanced: {
        ...empty.advanced,
        ...ensureObject(rawEdit.advanced),
      },
    };

    const element = locateElement(doc, key, edit.meta);
    if (!element) return;

    const targets = findContentTargets(
      element,
      edit.meta.kind === "block" ? "block" : "section"
    );

    setText(targets.eyebrow, edit.content.eyebrow);
    setText(targets.heading, edit.content.heading);
    setText(
      targets.description,
      edit.content.description
    );
    setText(
      targets.primaryButton,
      edit.content.primaryButton
    );
    setText(
      targets.secondaryButton,
      edit.content.secondaryButton
    );

    if (targets.primaryButton?.tagName === "A") {
      setAttribute(
        targets.primaryButton,
        "href",
        edit.content.primaryButtonUrl,
        { removeEmpty: true }
      );
    }

    if (targets.secondaryButton?.tagName === "A") {
      setAttribute(
        targets.secondaryButton,
        "href",
        edit.content.secondaryButtonUrl,
        { removeEmpty: true }
      );
    }

    if (targets.image && edit.content.imageUrl) {
      setAttribute(
        targets.image,
        "src",
        edit.content.imageUrl
      );
    }

    if (
      targets.image &&
      typeof edit.content.imageAlt === "string"
    ) {
      targets.image.setAttribute(
        "alt",
        edit.content.imageAlt
      );
    }

    restoreOriginalStyles(element);

    const heading =
      element.querySelector("h1, h2, h3");

    if (edit.style.enabled) {
      if (edit.style.background) {
        element.style.backgroundColor =
          edit.style.background;
      }

      if (edit.style.text) {
        element.style.color = edit.style.text;
      }

      if (edit.style.heading && heading) {
        heading.style.color = edit.style.heading;
      }

      if (edit.style.align) {
        element.style.textAlign = edit.style.align;
      }
    }

    if (edit.advanced.enabled) {
      const mobile =
        resolvedDevice === "mobile";

      const top = mobile
        ? edit.advanced.mobileTop
        : edit.advanced.desktopTop;

      const bottom = mobile
        ? edit.advanced.mobileBottom
        : edit.advanced.desktopBottom;

      if (top !== "") {
        element.style.paddingTop = `${Number(top)}px`;
      }

      if (bottom !== "") {
        element.style.paddingBottom = `${Number(
          bottom
        )}px`;
      }

      const hidden =
        (resolvedDevice === "desktop" &&
          edit.advanced.hideDesktop) ||
        (resolvedDevice === "tablet" &&
          edit.advanced.hideTablet) ||
        (resolvedDevice === "mobile" &&
          edit.advanced.hideMobile);

      if (hidden) {
        element.style.display = "none";
      }
    }
  });
}
