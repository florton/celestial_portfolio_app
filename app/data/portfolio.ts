export type Project = {
  title: string;
  blurb: string;
  stack: string[];
  href?: string;
};

export type CelestialKind =
  | "sun"
  | "planet"
  | "comet"
  | "star"
  | "moon"
  | "constellation";

export type Category = {
  id: string;
  label: string;
  /** Short line shown under the active label. */
  tagline: string;
  /** Accent color (hex). Tints this category's celestial body + the sky glow. */
  accent: string;
  /** Which celestial body represents this category on the wheel. */
  body: CelestialKind;
  /** Relative size of this body on the wheel (1 = base). */
  scale: number;
  /** Time-of-day sky gradient [top, mid, horizon]. Glides between categories. */
  sky: [string, string, string];
  projects: Project[];
};

/**
 * The wheel renders one node per category, evenly spaced around the rim.
 * Order matters twice over: it sets each body's position on the wheel AND the
 * order the sky cycles through. Arranged as a day → dusk → night → dawn loop,
 * with the sun (Design) and moon (Writing) placed 180° apart (indices 0 & 3).
 */
export const categories: Category[] = [
  {
    id: "design",
    label: "Design",
    tagline: "Tokens, primitives & a11y",
    accent: "#f0a72e",
    body: "sun",
    scale: 1.35,
    sky: ["#103a72", "#3f86c4", "#ffe0a0"],
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
    id: "oss",
    label: "Open Source",
    tagline: "Tools the community ships with",
    accent: "#3fc77f",
    body: "comet",
    scale: 0.95,
    sky: ["#0c2a22", "#2f7a55", "#e0b258"],
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
    id: "contact",
    label: "Contact",
    tagline: "Let's build something",
    accent: "#b78be6",
    body: "constellation",
    scale: 0.9,
    sky: ["#100a32", "#3e2360", "#9a5a86"],
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
  {
    id: "writing",
    label: "Writing",
    tagline: "Talks & deep dives",
    accent: "#cdd9e8",
    body: "moon",
    scale: 1.05,
    sky: ["#05060f", "#171734", "#463a70"],
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
    id: "webgl",
    label: "3D / WebGL",
    tagline: "Shaders, scenes & motion",
    accent: "#2ec5db",
    body: "planet",
    scale: 1.2,
    sky: ["#06202e", "#1d7d8e", "#6fd0c0"],
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
    id: "web",
    label: "Web Apps",
    tagline: "Production React at scale",
    accent: "#7c83ff",
    body: "star",
    scale: 0.85,
    sky: ["#101a3a", "#5a4a8a", "#e08a66"],
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
];
