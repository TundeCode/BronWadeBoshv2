import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "BronWadeBosh AI Car Buyer",
  description: "AI-assisted car listing analysis and comparison"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 md:px-8">{children}</main>
      </body>
    </html>
  );
}
