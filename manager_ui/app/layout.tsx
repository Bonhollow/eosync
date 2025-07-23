import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConfigProvider, theme } from "antd";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EOSync",
  description: "Project management tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} full-screen`}>
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm,
            token: {
              colorPrimary: "var(--primary)",
              colorText: "var(--text)",
              colorBgBase: "var(--background)",
              colorLink: "var(--primary)",
              colorTextSecondary: "var(--secondary)",
              colorSuccess: "var(--accent)",
              fontSize: 14,
            },
            components: {
              Input: {
                colorBgContainer: "#1f1f1f",          
                colorText: "#e0e0e0",                 
                colorBorder: "#3a3a3a",               
                colorTextPlaceholder: "#888888",     
              },
              DatePicker: {
                colorBgContainer: "#1f1f1f",
                colorText: "#e0e0e0",
                colorBorder: "#3a3a3a",
                colorTextPlaceholder: "#888888",
              },
              Modal: {
                colorBgElevated: "#2a2a2a",
                colorText: "#eaeaea",
                colorIcon: "#ffffff",
                headerBg: "#2a2a2a",
                footerBg: "#2a2a2a",
                titleColor: "#ffffff",
              },
              Button: {
                colorPrimary: "var(--primary)",
              },
              Layout: {
                headerBg: "var(--background)",
                siderBg: "var(--background)",
                bodyBg: "var(--background)",
              },
              Menu: {
                itemBg: "var(--background)",
                itemColor: "var(--text)",
                itemSelectedColor: "var(--primary)",
                itemHoverColor: "var(--primary)",
                itemSelectedBg: "var(--primary)",
              },
            },
          }}
        >
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
