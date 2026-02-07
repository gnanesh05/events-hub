import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import Prism from "@/components/ui/Prism/Prism";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Events Hub",
  description: "Events Hub is a one stop for all the events you don't want to miss",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${schibstedGrotesk.variable} ${martianMono.variable} min-h-screen  antialiased`}
      >
        <div className="fixed inset-0 z-0 h-screen w-screen">
          <Prism
            animationType="rotate"
            timeScale={0.5}
            height={3.5}
            baseWidth={5.5}
            scale={3.6}
            hueShift={0}
            colorFrequency={1}
            noise={0}
            glow={0.4}
          />
        </div>
        <div className="relative z-10">
          <Navbar />
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
