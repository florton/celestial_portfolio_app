import type { Metadata } from "next";
import { Cinzel, EB_Garamond } from "next/font/google";
import { AUTHOR, SITE_URL } from "@/app/lib/site";
import "./globals.css";

const display = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = EB_Garamond({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const title = `${AUTHOR.name} | ${AUTHOR.jobTitle}`;
const description =
  "Portfolio of Flanders Lorton, Senior Fullstack Developer: production web apps, custom WebGL rendering, and interactive work, charted as a celestial atlas.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: "/" },
  authors: [{ name: AUTHOR.name, url: SITE_URL }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: AUTHOR.name,
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
};

/**
 * Person schema, so search results and profile-aware crawlers get the title and
 * the canonical set of profiles rather than inferring them from the copy.
 */
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: AUTHOR.name,
  jobTitle: AUTHOR.jobTitle,
  email: `mailto:${AUTHOR.email}`,
  url: SITE_URL,
  sameAs: AUTHOR.profiles,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
