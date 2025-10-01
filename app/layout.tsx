import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";

import Header from "./_components/Header";
import "@/app/_styles/globals.css";

// ✅ Load Google Font
const josefin = Josefin_Sans({
  subsets: ["latin"],
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
    icon: "/logo.png", // 👈 Place logo.png in /public folder
    shortcut: "/favicon.ico", // 👈 fallback favicon
    apple: "/apple-touch-icon.png", // 👈 optional for iOS
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
