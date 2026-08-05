/**
 * Canonical origin, used for metadataBase, the sitemap, robots.txt, and the
 * absolute URLs in the OpenGraph/JSON-LD payloads.
 *
 * Set NEXT_PUBLIC_SITE_URL in the deploy environment; the fallback is only
 * there so local builds and previews resolve to something valid.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://flanderslorton.com";

export const AUTHOR = {
  name: "Flanders Lorton",
  jobTitle: "Senior Fullstack Developer",
  email: "flanders.lorton@gmail.com",
  profiles: [
    "https://github.com/florton",
    "https://www.linkedin.com/in/flanders-lorton/",
  ],
} as const;
