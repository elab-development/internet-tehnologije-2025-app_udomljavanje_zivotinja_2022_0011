import "./globals.css";
import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
