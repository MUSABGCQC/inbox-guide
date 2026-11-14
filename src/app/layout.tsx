import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inbox guide",
  description: "How to carry out a face-to-face inbox instruction.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
