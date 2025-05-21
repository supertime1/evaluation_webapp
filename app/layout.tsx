import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FortiEval",
  description: "A platform for evaluating LLM models using deepeval",
  icons: {
    icon: [
      { url: '/favicon-large.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' }
    ],
    apple: { url: '/apple-touch-icon.png', type: 'image/png' },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 