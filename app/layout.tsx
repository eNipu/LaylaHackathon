import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Instrument_Serif } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import { AnalyticsProvider } from "@/components/analytics-provider";
import "./globals.css";

const body = Inter({ subsets: ["latin"], display: "swap", variable: "--font-body" });
const display = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], display: "swap", variable: "--font-display-face" });

export const metadata: Metadata = {
  title: { default: "Layla | From idea to first users", template: "%s | Layla" },
  description: "A small starting point for something people actually use. Create your first-user launch plan, no signup required.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Layla" },
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#faf9f6" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const validPixel = pixelId && /^\d+$/.test(pixelId);
  return <html lang="en" className={`${body.variable} ${display.variable}`}><body className="safe-shell font-sans antialiased">
    <a href="#main" className="sr-only focus:not-sr-only focus:block focus:p-4">Skip to content</a>
    <AnalyticsProvider><MotionProvider>{children}</MotionProvider></AnalyticsProvider>
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
