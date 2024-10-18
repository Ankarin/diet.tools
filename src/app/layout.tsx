import Results from "@/app/form/results";
import ReactQueryProvider from "@/app/QueryProvider";
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Body Composition Calculator",
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
      <body className={`flex min-h-screen flex-col ${inter.className}`}>
        <Results />
        <ReactQueryProvider>
          {children}
          <Analytics />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
