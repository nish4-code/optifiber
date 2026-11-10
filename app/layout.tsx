import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OptiFiber (Fiberplus) — La fibra que une el Perú",
  description: "Sistema de gestión y georreferenciación de infraestructura de fibra óptica e integración SmartOLT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-[#f1f5f9] text-[#0f172a]">
        {children}
      </body>
    </html>
  );
}
