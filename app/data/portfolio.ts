export type Project = {
  title: string;
  blurb: string;
  stack: string[];
  href?: string;
};

export type Category = {
  id: string;
  label: string;
  /** Short line shown under the active label. */
  tagline: string;
  /** Accent color (hex). Drives the backdrop glow + active node ring. */
  accent: string;
  projects: Project[];
};

/**
 * The wheel renders one node per category, evenly spaced around the rim.
 * Keep this list small (4–8) so each node stays comfortably tappable.
 */
export const categories: Category[] = [
  {
    id: "web",
    label: "Web Apps",
    tagline: "Production React at scale",
    accent: "#6366f1",
    projects: [
      {
        title: "Ledger",
        blurb: "Realtime collaborative finance dashboard handling 50k+ live rows without dropping a frame.",
        stack: ["React 19", "Next.js", "WebSocket", "Virtualized lists"],
      },
      {
        title: "Atlas CMS",
        blurb: "Headless content platform with optimistic editing and offline-first sync.",
        stack: ["TypeScript", "IndexedDB", "tRPC"],
      },
      {
        title: "Pulse",
        blurb: "Analytics suite with streaming charts and sub-100ms interaction budget.",
        stack: ["Canvas", "Web Workers", "D3"],
      },
    ],
  },
  {
    id: "webgl",
    label: "3D / WebGL",
    tagline: "Shaders, scenes & motion",
    accent: "#06b6d4",
    projects: [
      {
        title: "Nebula",
        blurb: "GPU particle field of 1M points driven by custom GLSL compute shaders.",
        stack: ["Three.js", "GLSL", "WebGL2"],
      },
      {
        title: "Terraform",
        blurb: "Procedural terrain explorer with LOD streaming and dynamic lighting.",
        stack: ["React Three Fiber", "Noise", "Postprocessing"],
      },
    ],
  },
  {
    id: "oss",
    label: "Open Source",
    tagline: "Tools the community ships with",
    accent: "#10b981",
    projects: [
      {
        title: "use-orbit",
        blurb: "Tiny hook for physics-based radial menus. 4kb, zero deps, 1.2k stars.",
        stack: ["React", "TypeScript"],
      },
      {
        title: "stricter",
        blurb: "Incremental ESLint config that auto-tightens rules as a codebase matures.",
        stack: ["Node", "AST", "ESLint"],
      },
    ],
  },
  {
    id: "design",
    label: "Design Systems",
    tagline: "Tokens, primitives & a11y",
    accent: "#f59e0b",
    projects: [
      {
        title: "Forge",
        blurb: "Cross-platform token pipeline feeding web, iOS, and Figma from one source.",
        stack: ["Style Dictionary", "Radix", "Storybook"],
      },
      {
        title: "Motion Kit",
        blurb: "Accessible animation primitives that honor prefers-reduced-motion by default.",
        stack: ["Motion", "ARIA"],
      },
    ],
  },
  {
    id: "writing",
    label: "Writing",
    tagline: "Talks & deep dives",
    accent: "#ec4899",
    projects: [
      {
        title: "The 60fps Mindset",
        blurb: "Conference talk on building heavy interactions that never drop a frame.",
        stack: ["Talk", "Performance"],
      },
      {
        title: "Reading the Compositor",
        blurb: "Long-form series on how the browser actually paints your animations.",
        stack: ["Essay", "Rendering"],
      },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    tagline: "Let's build something",
    accent: "#a855f7",
    projects: [
      {
        title: "Email",
        blurb: "Fastest way to reach me — I reply within a day.",
        stack: ["hello@example.com"],
        href: "mailto:hello@example.com",
      },
      {
        title: "GitHub",
        blurb: "Source for everything above and a lot that isn't.",
        stack: ["@flanders"],
        href: "https://github.com",
      },
    ],
  },
];
