import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://edumerge-frontend.onrender.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "EduMerge — Admission Management & CRM",
    template: "%s | EduMerge",
  },
  description:
    "Streamline college admissions with EduMerge — manage institutions, programs, seat quotas, applicants, and the entire admission lifecycle with role-based access, real-time analytics, and quota-compliant seat allocation.",
  keywords: [
    "admission management",
    "CRM",
    "college admissions",
    "seat allocation",
    "KCET",
    "COMEDK",
    "EduMerge",
    "education technology",
    "seat matrix",
    "admission tracking",
  ],
  authors: [{ name: "Rahul Singh", url: "https://github.com/rahulsingh" }],
  creator: "Rahul Singh",
  publisher: "EduMerge",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "EduMerge",
    title: "EduMerge — Admission Management & CRM",
    description:
      "Manage institutions, programs, seat quotas, applicants, and the complete admission lifecycle. Built for Indian colleges.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EduMerge — Admission Management & CRM Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EduMerge — Admission Management & CRM",
    description:
      "Streamline college admissions with real-time seat tracking, quota management, and role-based access.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  other: {
    "format-detection": "telephone=no",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
