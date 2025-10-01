import type { Metadata } from "next";
import localFont from "next/font/local";

import Header from "./_components/Header";
import "@/app/_styles/globals.css";

// ✅ Load Josefin Sans locally
const josefin = localFont({
  src: [
    {
      path: "../public/fonts/JosefinSans/JosefinSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/JosefinSans/JosefinSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
});

// ✅ Metadata with favicon/logo
export const metadata: Metadata = {
  title: {
    template: "%s / The Wild Oasis",
    default: "Welcome / The Wild Oasis",
  },
  description:
    "Luxurious cabin hotel, located in the heart of the Italian Dolomites, surrounded by beautiful mountains and dark forests",
  icons: {
    icon: "/logo.png",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${josefin.className} antialiased bg-primary-950 text-primary-100 min-h-screen flex flex-col relative`}
      >
        {/* ✅ Header with Logo + Navigation */}
        <Header />

        {/* ✅ Main content */}
        <div className="flex-1 px-8 py-12 grid">
          <main className="max-w-7xl mx-auto w-full">{children}</main>
        </div>
      </body>
    </html>
  );
}
