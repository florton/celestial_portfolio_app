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
  | "sextant"
  | "galaxy";

export type Category = {
  id: string;
  label: string;
  /** Short line shown under the active label. */
  tagline: string;
  /** Accent color (hex). Tints this category's celestial body + the sky glow. */
  accent: string;
  /** Optional companion hues [arm, wisp] for multi-tone bodies (see galaxy). */
  hues?: [string, string];
  /** Which celestial body represents this category on the wheel. */
  body: CelestialKind;
  /** Relative size of this body on the wheel (1 = base). */
  scale: number;
  /** Time-of-day sky gradient [top, mid, horizon]. Glides between categories. */
  sky: [string, string, string];
  projects: Project[];
};

// Shared between Featured Work and their home categories.
const edwin: Project = {
  title: "Edwin: K-12 Platform for Thousands of Students",
  blurb:
    "A K-12 learning platform serving thousands of students across Canada. I led the fullstack work and rewrote it from the ground up twice as the architecture aged out, as one of two frontend developers on an 8–10 person team shipping every two weeks. Also drove the performance work across the stack: caching, pagination, lazy loading, payload reduction, and MongoDB aggregation tuning.",
  stack: ["React", "TypeScript", "Go", "GraphQL", "gRPC", "MongoDB"],
  href: "https://www.edwin.app/resources-articles/edwin101",
};

const ratchet: Project = {
  title: "Ratchet: Regression Memory for AI Coding",
  blurb:
    "A CLI that keeps AI-assisted codebases from sliding backwards. Failures become permanent counterexamples in a committed corpus, checks are written as plain-English heuristics, and git hooks enforce the whole gate the way a type check does. It gates its own repo. Zero runtime dependencies, 237 tests. Part of Flux, a design for moving LLM inference from runtime to build time.",
  stack: ["TypeScript", "Node", "CLI", "Dev Tooling"],
  href: "https://github.com/florton/flux",
};

const particles: Project = {
  title: "2,000,000 Particle Simulator",
  blurb:
    "Up to two million particles simulated and drawn in real time in the browser. A WebGPU compute shader integrates the whole population on-GPU — including a mesh solver for a self-gravitating galaxy — with a WebGL2 transform-feedback fallback and a virtualized sidebar that scrolls every row on ~33 live DOM nodes.",
  stack: ["WebGPU", "WGSL", "TypeScript", "WebGL2", "Vite"],
  href: "https://flanderslorton.com/particles/",
};

/**
 * The wheel renders one node per category, evenly spaced around the rim.
 * Order matters twice over: it sets each body's position on the wheel AND the
 * order the sky cycles through. Arranged as a day → dusk → night → dawn loop,
 * with the sun (Featured) at index 0 and the moon (Music) at index 4, the
 * position nearest half a turn away, where the stars are brightest.
 */
export const categories: Category[] = [
  {
    id: "featured",
    label: "Featured Work",
    tagline: "Production apps & serious engineering",
    accent: "#f0a72e",
    body: "sun",
    scale: 1.35,
    sky: ["#103a72", "#3f86c4", "#ffe0a0"],
    projects: [edwin, ratchet, particles],
  },
  {
    id: "art",
    label: "Art",
    tagline: "Rooms, instruments & poems",
    accent: "#e06a9c",
    hues: ["#c9a6f0", "#f0b98a"],
    body: "galaxy",
    scale: 1.15,
    sky: ["#1a3a6e", "#6a7ec0", "#f2c2a6"],
    projects: [
      {
        title: "Interactive Gallery",
        blurb:
          "Eight rooms of drawings, paintings, collages, and photos. You walk through it instead of scrolling it.",
        stack: ["Drawing", "Painting", "Design"],
        href: "https://art-gallery-orcin-six.vercel.app/",
      },
      {
        title: "Feelings Typewriter",
        blurb:
          "A keyboard where the keys are ideas instead of letters. Sixteen material words compose into a point in an authored 8-dimensional space, rendered as a star chart you navigate, and every gesture resolves to a short poem that replays exactly from its seed. Zero dependencies, no build step, 18ms p99 from keypress to paint.",
        stack: ["JavaScript", "Canvas", "ES Modules", "Interaction Design"],
        href: "https://flanderslorton.com/emotions/",
      },
      {
        title: "Margin: Poetry Generator",
        blurb:
          "A second poem writes in the margin of yours. It reads your stanza, moves somewhere adjacent in the same authored space, and answers from there — related, never a paraphrase. No model, no API, no network: the same stanza returns the same answer, forever, offline.",
        stack: ["JavaScript", "ES Modules", "Generative Text"],
        href: "https://flanderslorton.com/margin/",
      },
    ],
  },
  {
    id: "engineering",
    label: "Engineering Projects",
    tagline: "Tools, libraries & simulations",
    accent: "#b78be6",
    body: "sextant",
    scale: 1.1,
    sky: ["#123866", "#4f82b8", "#f6d8aa"],
    projects: [
      ratchet,
      {
        title: "Odds: Card-Game Probability Engine",
        blurb:
          "Card-game probability from first principles. A blackjack solver that re-derives published basic strategy (268 of 270 cells), a shoe simulator that reports house edge with standard errors over 10M hands, and a Hold'em engine whose evaluator is checked against all 133,784,560 seven-card hands, with a player model fitted to real population stats. Plain Node, zero dependencies.",
        stack: ["JavaScript", "Node", "Simulation", "Statistics"],
        href: "https://github.com/florton/odds",
      },
      {
        title: "Next Bridge",
        blurb:
          "A library for typed signals across the Next.js server/client boundary. Server Actions return plain-data instructions and a slice store applies them with inference intact, so a wrong payload fails tsc instead of production. ~1.4 kB min+gzip, zero dependencies, built only on documented App Router surfaces.",
        stack: ["TypeScript", "React", "Next.js", "Library Design"],
        href: "https://github.com/florton/NextBridge",
      },
    ],
  },
  {
    id: "webgl",
    label: "3D / WebGL",
    tagline: "Custom rendering from scratch",
    accent: "#2ec5db",
    body: "planet",
    scale: 1.2,
    sky: ["#06202e", "#1d7d8e", "#6fd0c0"],
    projects: [
      particles,
      {
        title: "Custom WebGL Framework",
        blurb:
          "A 3D engine written from nothing. Object3D, Matrix, Polygon, and PolygonMesh classes, stacked transform matrices, Blinn-Phong shading in GLSL, and a JSON keyframe tweener on top.",
        stack: ["WebGL", "GLSL", "JavaScript"],
        href: "https://flanderslorton.com/webGL.html",
      },
      {
        title: "Three.js Planets",
        blurb: "A procedurally generated planet scene you can move around in.",
        stack: ["Three.js", "WebGL", "3D"],
        href: "https://flanderslorton.com/planets",
      },
    ],
  },
  {
    id: "music",
    label: "Music",
    tagline: "Original tracks & releases",
    accent: "#cdd9e8",
    body: "moon",
    scale: 1.05,
    sky: ["#05060f", "#171734", "#463a70"],
    projects: [
      {
        title: "Bandcamp",
        blurb: "Original tracks I wrote, recorded, and produced myself.",
        stack: ["Bandcamp", "Original"],
        href: "https://flanderslorton.bandcamp.com/",
      },
    ],
  },
  {
    id: "about",
    label: "About & Contact",
    tagline: "8+ years fullstack · let's build something",
    accent: "#3fc77f",
    body: "comet",
    scale: 0.95,
    sky: ["#100a32", "#3e2360", "#9a5a86"],
    projects: [
      {
        title: "Principal Fullstack Developer, Nelson Education",
        blurb:
          "2018 to 2026. Built and twice rebuilt Edwin on a team of 8 to 10, shipping every two weeks. Wrote the GraphQL, gRPC, and Go services behind it, and owned most of the performance work, from caching and pagination to MongoDB query tuning. Before that: frontend intern at Taboola, and a B.S. in Computer Science from Loyola Marymount, cum laude and with honors.",
        stack: ["React", "TypeScript", "Node", "Go", "AWS"],
        href: "https://www.linkedin.com/in/flanders-lorton/",
      },
      {
        title: "Download Résumé",
        blurb: "One page with the whole history, if you'd rather skim than click.",
        stack: ["PDF"],
        href: "/flanders-lorton-resume.pdf",
      },
      {
        title: "Email",
        blurb: "Quickest way to get me. I answer within a day.",
        stack: ["flanders.lorton@gmail.com"],
        href: "mailto:flanders.lorton@gmail.com",
      },
      {
        title: "GitHub",
        blurb: "Source for most of what's here, and a lot that never made the list.",
        stack: ["@florton"],
        href: "https://github.com/florton",
      },
      {
        title: "LinkedIn",
        blurb: "The full work history, if you want the formal version.",
        stack: ["in/flanders-lorton"],
        href: "https://www.linkedin.com/in/flanders-lorton/",
      },
    ],
  },
  {
    id: "games",
    label: "Games",
    tagline: "Fourteen games, all playable now",
    accent: "#7c83ff",
    body: "star",
    scale: 0.85,
    sky: ["#101a3a", "#5a4a8a", "#e08a66"],
    projects: [
      {
        title: "Handcrafted Industries",
        blurb:
          "My arcade: fourteen browser games, each written from scratch and playable in one click, under a front end I designed and built.",
        stack: ["Game Dev", "Interactive", "Portal"],
        href: "https://handcrafted.industries/",
      },
      {
        title: "Denver Taxi",
        blurb:
          "Four and a half kilometers of downtown Denver reconstructed 1:1 from survey data — Union Station, the 16th Street Mall, Coors Field, the Capitol. Pick up fares, follow the route line, and reach the drop-off before the tip runs down.",
        stack: ["Unity 6", "C#", "URP"],
        href: "https://handcrafted.industries/denvertaxi/",
      },
      {
        title: "Magic Duel",
        blurb:
          "A faux-3D occult desert crawl. Nothing is cast on the spot — you assemble a ritual across several rounds from ingredients drawn from real folk magic, while warding off what is already on its way.",
        stack: ["Godot 4", "GDScript", "3D"],
        href: "https://handcrafted.industries/magicduel/",
      },
      {
        title: "Dodge Your Haters 3D",
        blurb:
          "An arena crawl with no attack button. You have only movement, and passing close to an enemy fills the salt meter — grazing is the entire combat system.",
        stack: ["Godot 4", "GDScript", "3D"],
        href: "https://handcrafted.industries/dyh3d/",
      },
    ],
  },
];
