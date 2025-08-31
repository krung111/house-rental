// app/layout.tsx (Server Component)
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ApolloWrapper } from "@/components/ApolloWrapper";
import Sidebar from "@/components/Dashboard/Sidebar";
import { cookies } from "next/headers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard App",
  description: "Next.js dashboard with Apollo & Supabase",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Await cookies since it's typed as Promise in your setup
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken");

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ApolloWrapper>
          <div className="flex h-screen">
            {/* Show Sidebar only if user has a token */}
            {token && <Sidebar />}

            {/* Main content area */}
            <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {children}
            </main>
          </div>
        </ApolloWrapper>
      </body>
    </html>
  );
}
