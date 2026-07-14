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
 * with the sun (Web Apps) and moon (Music) placed 180° apart (indices 0 & 3).
 */
export const categories: Category[] = [
  {
    id: "web",
    label: "Web Apps",
    tagline: "Production fullstack, shipped",
    accent: "#f0a72e",
    body: "sun",
    scale: 1.35,
    sky: ["#103a72", "#3f86c4", "#ffe0a0"],
    projects: [
      {
        title: "Edwin — K-12 Education Platform",
        blurb:
          "Led fullstack development of a K-12 learning platform serving thousands of students across Canada — rewrote the app from the ground up twice to modernize the architecture, backed by GraphQL, gRPC, and Go microservices with MongoDB aggregation tuning.",
        stack: ["React", "TypeScript", "Go", "GraphQL", "gRPC", "MongoDB"],
        href: "https://www.edwin.app/resources-articles/edwin101",
      },
      {
        title: "Mile Hay Souk",
        blurb:
          "Production marketing and commerce site built and shipped for a live client.",
        stack: ["Next.js", "React", "Client work"],
        href: "https://milehaysouk.com/",
      },
      {
        title: "Ceres Ceive",
        blurb:
          "Streetwear brand concept site — art direction, layout, and interaction design.",
        stack: ["Design", "Frontend", "Branding"],
        href: "https://flanderslorton.com/ceresceive.html",
      },
      {
        title: "Floss More",
        blurb: "Playful product concept site exploring motion and micro-interactions.",
        stack: ["HTML/CSS", "JS", "Concept"],
        href: "https://flanderslorton.com/flossmore.html",
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
        title: "Principal Fullstack Developer — Nelson Education",
        blurb:
          "2018–2026: architected and twice-rewrote Edwin, a K-12 platform serving thousands of students. Built GraphQL/gRPC/Go microservices on an 8–10 person team shipping biweekly, and drove stack-wide performance work — caching, pagination, lazy loading, and MongoDB tuning.",
        stack: ["React", "TypeScript", "Node", "Go", "AWS"],
        href: "https://www.linkedin.com/in/flanders-lorton/",
      },
      {
        title: "Earlier — Taboola & LMU",
        blurb:
          "Frontend intern at Taboola shipping content-control features and API endpoints (React/Redux/Node/Java Spring). B.S. Computer Science with Honors, Cum Laude, from Loyola Marymount University.",
        stack: ["React", "Redux", "Java Spring"],
        href: "https://www.linkedin.com/in/flanders-lorton/",
      },
      {
        title: "Download résumé",
        blurb: "Full experience, education, and tech stack as a one-page PDF.",
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
        blurb: "Fastest way to reach me — I reply within a day.",
        stack: ["flanders.lorton@gmail.com"],
        href: "mailto:flanders.lorton@gmail.com",
      },
      {
        title: "GitHub",
        blurb: "Source for the projects above and plenty that isn't listed.",
        stack: ["@florton"],
        href: "https://github.com/florton",
      },
      {
        title: "LinkedIn",
        blurb: "Full work history and 8+ years of experience.",
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
        blurb: "Original music — writing, recording, and production.",
        stack: ["Bandcamp", "Original"],
        href: "https://flanderslorton.bandcamp.com/",
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
        title: "Custom WebGL Framework",
        blurb:
          "Hand-built 3D engine: Object3D, Matrix, Polygon, and PolygonMesh classes with stacked transform matrices, GLSL Blinn-Phong shading, and a JSON keyframe tweener.",
        stack: ["WebGL", "GLSL", "JavaScript"],
        href: "https://flanderslorton.com/webGL.html",
      },
      {
        title: "Three.js Planets",
        blurb: "Interactive procedural planets scene built with Three.js.",
        stack: ["Three.js", "WebGL", "3D"],
        href: "https://flanderslorton.com/planets",
      },
    ],
  },
  {
    id: "games",
    label: "Games",
    tagline: "Interactive & playable work",
    accent: "#7c83ff",
    body: "star",
    scale: 0.85,
    sky: ["#101a3a", "#5a4a8a", "#e08a66"],
    projects: [
      {
        title: "Handcrafted Industries",
        blurb: "Game design and development — playable projects and experiments.",
        stack: ["Game Dev", "Interactive"],
        href: "https://handcrafted.industries/",
      },
    ],
  },
];
