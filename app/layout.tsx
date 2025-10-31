import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import Provider from "./Provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "CareerHub+",
  description: "AI-powered career pathway navigator for students",
};

const outfit = Outfit({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className}>
        <ClerkProvider>
          <ConvexClientProvider>
            <Provider>
              {children}
              <Toaster />
            </Provider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
