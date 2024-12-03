import ReactQueryProvider from "@/app/QueryProvider";
import Auth from "@/components/auth";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ai Diet Planner",
  description: "",
  keywords: ["Ai Diet Planner"],
  openGraph: {
    title: "Ai Diet Planner",
    description: "",
    url: "https://www.diet.tools/",
    siteName: "Ai Diet Planner",
    locale: "en_US",
    type: "website",
  },
  other: {
    "google-site-verification": "twun68fQNTTMV292k6EdGidJBwLlidG1toMs37otkZM",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="scroll-smooth antialiased"
      suppressHydrationWarning
    >
      <head>
      <GoogleTagManager gtmId="GTM-W88XTQH3" />
      </head>
      <body className={`flex min-h-screen flex-col ${inter.className}`}>
        <header className="z-[50] sticky top-0 w-full bg-background/95 border-b backdrop-blur-sm border-border/40">
          <div className="container h-14 flex items-center justify-between">
            <Link
              href="/?step=1"
              className="flex justify-start items-center hover:opacity-85 transition-opacity duration-300"
            >
              <h2 className="font-bold text-xl">Ai Diet Planner</h2>
            </Link>
            <Auth />
          </div>
        </header>
        <ReactQueryProvider>
          <Toaster></Toaster>
          {children}
        </ReactQueryProvider>
        <Analytics />
      </body>
      <GoogleAnalytics gaId="G-L3P8378940" />
    </html>
  );
}
