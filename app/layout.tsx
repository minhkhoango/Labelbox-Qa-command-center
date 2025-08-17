import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QA Command Center",
  description: "Project Chimera QA Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
