import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";

export const metadata: Metadata = {
  title: "Udomljavanje životinja",
  description: "Aplikacija za udomljavanje životinja",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
