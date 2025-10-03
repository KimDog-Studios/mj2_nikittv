
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBarClient from "../Components/NavBarClient";
import Footer from "../Components/Footer";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MJ2 Studios",
  description: "Offical MJ2 Studios Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
  <NavBarClient />
        <main style={{ paddingTop: 'var(--navbar-height)', background: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)' }}>
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
