import React from "react";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="w-full max-w-4xl mx-auto py-10 px-3">{children}</div>;
}
