import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AppProvider } from "@/context/AppProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CarWise — Find the car you can actually afford",
    template: "%s | CarWise",
  },
  description:
    "Personal car-affordability advisor for India. Ex-showroom, estimated on-road, EMI and ownership costs — planned for Indian cities.",
  applicationName: "CarWise",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "CarWise",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white font-sans text-foreground">
        <ThemeProvider>
          <AppProvider>
            <AppShell>{children}</AppShell>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
