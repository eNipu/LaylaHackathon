import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { AnalyticsProvider } from "@/components/analytics-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Layla | From idea to first users", template: "%s | Layla" },
  description: "A small starting point for something people actually use. Create your first-user launch plan, no signup required.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Layla" },
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#1b211b" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const validPixel = pixelId && /^\d+$/.test(pixelId);
  return <html lang="en"><body className="safe-shell antialiased">
    <a href="#main" className="sr-only focus:not-sr-only focus:block focus:p-4">Skip to content</a>
    <AnalyticsProvider>{children}</AnalyticsProvider>
    {validPixel && <Script id="meta-pixel" strategy="afterInteractive">{`
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
      (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init',${JSON.stringify(pixelId)});fbq('track','PageView');
    `}</Script>}
  </body></html>;
}
