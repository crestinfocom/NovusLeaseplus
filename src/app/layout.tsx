import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c1426",
};

export const metadata: Metadata = {
  title: {
    default: `${process.env.NEXT_PUBLIC_APP_NAME ?? "NovusLease+"} — Premium Self-Drive Car Rental & Subscription in India`,
    template: `%s · ${process.env.NEXT_PUBLIC_APP_NAME ?? "NovusLease+"}`,
  },
  description:
    "Rent a spotless, brand-new car by the hour, day, or month — insurance, maintenance and doorstep delivery included. From ₹60/hr.",
  keywords: [
    "car rental",
    "self drive",
    "car subscription",
    "NovusLease",
    "lease vs buy",
    "India",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}