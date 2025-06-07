import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HR of One - Your Personal HR Department",
  description: "Stop drowning in HR tasks. Let AI handle the paperwork while you focus on your people. Full HR toolkit with automation for routine tasks and compliance.",
  keywords: "HR automation, AI HR, small business HR, HR compliance, employee management, HR software",
  openGraph: {
    title: "HR of One - Your Personal HR Department",
    description: "Stop drowning in HR tasks. Let AI handle the paperwork while you focus on your people.",
    images: ["/og-image.png"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
