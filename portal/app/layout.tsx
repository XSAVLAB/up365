import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/public/scss/style.scss";
import MainFooter from "@/components/Shared/MainFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "Game Of Gem - Sports Betting Platform",
  description: "Made with actualities",
};
export const viewport: Viewport = {
  themeColor: "#000000",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body className={inter.className}>
        <main>
          {children}
          <MainFooter />
        </main>
      </body>
      <script dangerouslySetInnerHTML={{
        __html: `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod ?
      n.callMethod.apply(n, arguments) : n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '662507706361280');
    fbq('track', 'PageView');
  `
      }} />
      <noscript><img height="1" width="1" style={{ display: "none" }}
        src="https://www.facebook.com/tr?id=662507706361280&ev=PageView&noscript=1"
      /></noscript>
    </html>
  );
}
