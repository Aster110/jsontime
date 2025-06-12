import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JSON Time - 开发者工具箱",
  description: "一个简约高效的开发者工具箱，提供 JSON 格式化、文本处理等功能",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className={`${inter.className} bg-white dark:bg-black`}>
        {children}
      </body>
    </html>
  );
}
