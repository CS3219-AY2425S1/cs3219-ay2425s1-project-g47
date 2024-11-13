import "react-toastify/dist/ReactToastify.css";

import type { Metadata, Viewport } from "next";

import { SocketProvider } from "@/context/SockerIOContext";
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
      <main className="container mx-auto max-w-9xl pt-4 px-4 flex-grow">
        <SocketProvider>{children}</SocketProvider>
      </main>
      <footer className="w-full flex items-center justify-center py-3">
        <p>PeerPrep built by Group 47</p>
      </footer>
    </div>
  );
}
