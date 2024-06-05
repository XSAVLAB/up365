import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/public/scss/style.scss";
import MainFooter from "@/components/Shared/MainFooter";
import FooterCard from "@/components/Shared/FooterCard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Up365 Gaming",
  description: "Made with nextjs bootstrap 5 & Sass",
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
