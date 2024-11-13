import type { Metadata, Viewport } from "next";

import { siteConfig } from "@/config/site";
import "@/styles/globals.css";
import { Navbar } from "@/components/navbar";

const config = siteConfig(false);

export const metadata: Metadata = {
  title: config.name,
  description: config.description,
  openGraph: {
    title: config.name,
    description: config.description,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="container mx-auto max-w-7xl pt-4 px-4 flex-grow">
        {children}
      </main>
      <footer className="w-full flex items-center justify-center py-3">
        <p>PeerPrep built by Group 47</p>
      </footer>
    </div>
  );
}
