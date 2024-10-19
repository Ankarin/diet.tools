import ReactQueryProvider from "@/app/QueryProvider";
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Body Composition Calculator",
  description:
    "Calculate your body composition with our easy-to-use online tool. Get accurate results for body fat percentage, lean mass, and more.",
  keywords: [
    "body composition calculator",
    "body composition ",
    "body fat",
    "lean mass",
    "health",
  ],
  openGraph: {
    title: "Body Composition Calculator",
    description:
      "Calculate your body composition with our easy-to-use online tool. Get accurate results for body fat percentage, lean mass, and more.",
    url: "https://www.bodycomposition.xyz/",
    siteName: "Body Composition Calculator",
    locale: "en_US",
    type: "website",
  },
  other: {
    "google-site-verification": "twun68fQNTTMV292k6EdGidJBwLlidG1toMs37otkZM",
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
      className="scroll-smooth antialiased"
      suppressHydrationWarning
    >
      <GoogleTagManager gtmId="GTM-PVN4L8PM" />
      <body className={`flex min-h-screen flex-col ${inter.className}`}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
      <GoogleAnalytics gaId="G-H4QR515G6D" />
    </html>
  );
}
