import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OpenCal — One calendar for every chapter",
    template: "%s | OpenCal",
  },
  description:
    "Calendar synchronization for global organizations with local chapters. Keep every chapter in sync — from HQ to the ground.",
  metadataBase: new URL("https://opencal.events"),
  openGraph: {
    title: "OpenCal — One calendar for every chapter",
    description:
      "Calendar synchronization for global organizations with local chapters.",
    url: "https://opencal.events",
    siteName: "OpenCal",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
