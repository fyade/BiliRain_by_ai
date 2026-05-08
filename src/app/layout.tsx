import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BiliRain - B站博主更新日历",
  description: "追踪你关注的B站博主动态",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="h-full antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
