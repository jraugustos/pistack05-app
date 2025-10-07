import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/foundation";
import { TooltipProvider } from "@/components/foundation";
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PIStack — Transform Ideas into Action",
  description: "Transforme ideias em planos acionáveis com IA e templates guiados",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pt-BR" className={inter.variable}>
        <body className="antialiased">
          <TooltipProvider delayDuration={300}>
            {children}
            <Toaster />
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
