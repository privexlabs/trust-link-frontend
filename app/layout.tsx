import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/providers/WalletProvider";
import I18nProvider from "@/components/providers/I18nProvider";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrustLink",
  description: "The Web2 experience. The Web3 guarantee.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <WalletProvider>
          <I18nProvider>
            {/* pb-20 on mobile gives room for the fixed BottomNav; md:pb-0 removes it on desktop */}
            <div className="flex flex-1 flex-col pb-20 md:pb-0">
              {children}
            </div>
            <Footer />
            <BottomNav />
            <Toaster richColors position="top-right" />
          </I18nProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
