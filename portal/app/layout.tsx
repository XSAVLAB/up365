import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/public/scss/style.scss";
import MainFooter from "@/components/Shared/MainFooter";
import FooterCard from "@/components/Shared/FooterCard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UP365 - Sports Betting Platform",
  description: "Made with actualities",
};

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
          <FooterCard />
          <MainFooter />
        </main>
      </body>
    </html>
  );
}
