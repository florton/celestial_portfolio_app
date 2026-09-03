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
  | "constellation"
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

/**
 * The wheel renders one node per category, evenly spaced around the rim.
 * Order matters twice over: it sets each body's position on the wheel AND the
 * order the sky cycles through. Arranged as a day → dusk → night → dawn loop,
 * with the sun (Web Apps) and moon (Music) placed 180° apart (indices 0 & 3).
 */
export const categories: Category[] = [
  {
    id: "web",
    label: "Web Apps & Custom Sites",
    tagline: "Apps people actually use",
    accent: "#f0a72e",
    body: "sun",
    scale: 1.35,
    sky: ["#103a72", "#3f86c4", "#ffe0a0"],
    projects: [
      {
        title: "Edwin: K-12 Education Platform",
        blurb:
          "A K-12 learning platform used by thousands of students across Canada. I led the fullstack work and rebuilt it from scratch twice as the architecture aged out. GraphQL and Go services underneath, plus a lot of time spent getting MongoDB aggregations to behave.",
        stack: ["React", "TypeScript", "Go", "GraphQL", "gRPC", "MongoDB"],
        href: "https://www.edwin.app/resources-articles/edwin101",
      },
      {
        title: "Next Bridge",
        blurb:
          "A library for typed signals across the Next.js server/client boundary. Server Actions return plain-data instructions and a slice store applies them with inference intact, so a wrong payload fails tsc instead of production. ~1.4 kB min+gzip, zero dependencies, built only on documented App Router surfaces.",
        stack: ["TypeScript", "React", "Next.js", "Library Design"],
        href: "https://github.com/florton/NextBridge",
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
    id: "art",
    label: "Art",
    tagline: "Rooms you walk through",
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
      {
        title: "1,000,000 Particle Simulator",
        blurb:
          "A million particles simulated and drawn at 60 fps in the browser. A WebGPU compute shader integrates the whole population on-GPU — including a mesh solver for a self-gravitating galaxy — with a WebGL2 transform-feedback fallback and a virtualized sidebar that scrolls all million rows on ~33 live DOM nodes.",
        stack: ["WebGPU", "WGSL", "TypeScript", "WebGL2", "Vite"],
        href: "https://flanderslorton.com/particles/",
      },
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
    id: "about",
    label: "About",
    tagline: "8+ years, fullstack",
    accent: "#3fc77f",
    body: "comet",
    scale: 0.95,
    sky: ["#0c2a22", "#2f7a55", "#e0b258"],
    projects: [
      {
        title: "Principal Fullstack Developer, Nelson Education",
        blurb:
          "2018 to 2026. Built and twice rebuilt Edwin on a team of 8 to 10, shipping every two weeks. Wrote the GraphQL, gRPC, and Go services behind it, and owned most of the performance work, from caching and pagination to MongoDB query tuning.",
        stack: ["React", "TypeScript", "Node", "Go", "AWS"],
        href: "https://www.linkedin.com/in/flanders-lorton/",
      },
      {
        title: "Earlier: Taboola & LMU",
        blurb:
          "Interned on frontend at Taboola, shipping content-control features and the API endpoints behind them. Before that, a B.S. in Computer Science from Loyola Marymount, cum laude and with honors.",
        stack: ["React", "Redux", "Java Spring"],
        href: "https://www.linkedin.com/in/flanders-lorton/",
      },
      {
        title: "Download Résumé",
        blurb: "One page with the whole history, if you'd rather skim than click.",
        stack: ["PDF"],
        href: "/flanders-lorton-resume.pdf",
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
      }
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
    id: "games",
    label: "Games",
    tagline: "Eleven games, all playable now",
    accent: "#7c83ff",
    body: "star",
    scale: 0.85,
    sky: ["#101a3a", "#5a4a8a", "#e08a66"],
    projects: [
      {
        title: "Handcrafted Industries",
        blurb:
          "My arcade: eleven browser games, each written from scratch and playable in one click, under a front end I designed and built.",
        stack: ["Game Dev", "Interactive", "Portal"],
        href: "https://handcrafted.industries/",
      },
      {
        title: "Bar Party",
        blurb:
          "A deckbuilder roguelite where the deck is your regulars. Twenty nights of rising rent: develop patrons into gold-badge lifers, schedule the promo nights that suit the crowd you have built, and defuse trouble before it spreads through the room.",
        stack: ["Godot 4", "GDScript", "Game Design"],
        href: "https://handcrafted.industries/barparty/",
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
