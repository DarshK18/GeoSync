import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "AIO & GEO Platform | Artificial Intelligence & Generative Engine Optimization",
  description:
    "Dedicated platform to analyze and rewrite content for maximum Citation Probability and RAG-readiness in Gemini, ChatGPT, Claude, and Perplexity. Powered by LangGraph & FastAPI.",
  keywords: [
    "AIO",
    "Artificial Intelligence Optimization",
    "GEO",
    "Generative Engine Optimization",
    "RAG Readiness",
    "Direct Answer Density",
    "Semantic Entity Saturation",
    "Information Gain",
    "LangGraph"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#07090e] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black font-sans">
        <Header />
        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
          {children}
        </main>
        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}
