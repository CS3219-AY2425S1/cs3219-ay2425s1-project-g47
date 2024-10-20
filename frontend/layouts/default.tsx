import { Head } from "@/layouts/head";
import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
  isLoggedIn,
}: {
  children: React.ReactNode;
  isLoggedIn: boolean;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <Head />
      <Navbar isLoggedIn={isLoggedIn} />
      <main className="container mx-auto max-w-7xl px-4 flex-grow pt-4">
        {children}
      </main>
      <footer className="w-full flex items-center justify-center py-3">
        <p>PeerPrep built by Group 47</p>
      </footer>
    </div>
  );
}
