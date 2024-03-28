import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { TranslationProvider } from "@/context/translation-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IntersectionAI",
  description: "Translate text with the power of AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <TranslationProvider>
        <html lang="en">
          <body className={`${inter.className} text-sm`}>
            <Header />

            <main className="max-w-7xl w-11/12 mx-auto py-12 pt-8">{children}</main>
          </body>
        </html>
      </TranslationProvider>
    </ClerkProvider>
  );
}
