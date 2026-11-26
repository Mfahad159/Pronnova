import type { Metadata, Viewport } from "next";
import { Quicksand } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { PageLoader } from "@/components/brand/page-loader";
import "./globals.css";

// Single font across the entire app (body, headings, and code/phonetics): Quicksand, variable weight.
const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Pronnova", template: "%s · Pronnova" },
  description: "Practice English pronunciation and get instant word-by-word feedback.",
  // Brand icon set (public/): ICO for old browsers, SVG for modern ones (adapts to dark mode), PNG fallbacks.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#FF594B", // brand coral; matches site.webmanifest
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${quicksand.variable} h-full antialiased`}>
      <body className={`${quicksand.className} min-h-full`}>
        <PageLoader />
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
