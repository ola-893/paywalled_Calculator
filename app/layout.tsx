import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayCalc • The Paywalled Calculator",
  description: "Calculate anything you want. Pay to see the answer. Powered by Stripe.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">{children}</body>
    </html>
  );
}
