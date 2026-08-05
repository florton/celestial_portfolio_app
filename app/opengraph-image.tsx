import { ImageResponse } from "next/og";
import { AUTHOR } from "@/app/lib/site";
import { categories } from "@/app/data/portfolio";

export const alt = `${AUTHOR.name} — ${AUTHOR.jobTitle}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social card: the site's own sky, flattened to a still. Uses the sun
 * category's palette so a shared link previews as the scene people land on.
 */
export default function Image() {
  const sun = categories[0];
  const [top, mid, horizon] = sun.sky;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          position: "relative",
          background: `linear-gradient(180deg, ${top} 0%, ${mid} 46%, ${horizon} 100%)`,
          color: "#fdf6e3",
          padding: "72px",
        }}
      >
        {/* The sun, low and to the right, mirroring the live scene. */}
        <div
          style={{
            position: "absolute",
            top: 118,
            right: 118,
            width: 260,
            height: 260,
            borderRadius: 260,
            background: sun.accent,
            boxShadow: `0 0 140px 60px ${sun.accent}88`,
            display: "flex",
          }}
        />
        {/* Hills, matching the three silhouette bands in the Backdrop. */}
        <svg
          width={1200}
          height={260}
          viewBox="0 0 100 46"
          preserveAspectRatio="none"
          style={{ position: "absolute", bottom: 0, left: 0 }}
        >
          <path
            d="M0 20 Q12 11 25 17 Q38 23 50 16 Q62 9 75 17 Q88 24 100 15 L100 46 L0 46 Z"
            fill="rgba(46,34,78,0.55)"
          />
          <path
            d="M0 28 Q15 20 30 26 Q45 32 60 25 Q75 18 88 26 Q95 30 100 26 L100 46 L0 46 Z"
            fill="rgba(20,16,40,0.78)"
          />
          <path
            d="M0 36 Q20 29 40 35 Q60 41 80 34 Q92 30 100 35 L100 46 L0 46 Z"
            fill="rgba(6,5,14,0.96)"
          />
        </svg>

        <div style={{ display: "flex", flexDirection: "column", zIndex: 1 }}>
          <div
            style={{
              fontSize: 26,
              letterSpacing: 10,
              textTransform: "uppercase",
              opacity: 0.7,
            }}
          >
            Atlas Cœlestis
          </div>
          <div
            style={{
              fontSize: 82,
              letterSpacing: 6,
              textTransform: "uppercase",
              marginTop: 14,
            }}
          >
            {AUTHOR.name}
          </div>
          <div style={{ fontSize: 34, opacity: 0.82, marginTop: 12 }}>
            {AUTHOR.jobTitle}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
