import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/Components/Navbar";
import FooterElegant from "@/Components/Footer";
import CartDebug from "@/Components/CartDebug";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Pyaari Naari - Clothing Store",
  description: "Premium clothing store for women",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <>    
        <Navbar/>
          {children}
        <FooterElegant />
        {/* <CartDebug /> */}
          </> 
          </Providers>
      </body>
    </html>
  );
}
