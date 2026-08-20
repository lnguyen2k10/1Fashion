import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin", "vietnamese"], variable: "--font-playfair" });
export const metadata: Metadata = {
  title: "1Fashion | Shop Thời Trang & Phụ Kiện",
  description: "Nền tảng danh bạ mua sắm quy tụ các cửa hàng uy tín nhất tại TPHCM.",
  keywords: ["1Fashion", "Danh bạ", "Mua sắm", "Cửa hàng"],
  authors: [{ name: "1Fashion Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`h-full antialiased ${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full bg-background text-foreground font-sans">
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        {children}
      </body>
    </html>
  );
}
