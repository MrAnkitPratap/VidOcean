import "./globals.css";
// import { Inter } from "next/font/google";
import { Navbar } from "./components/navbar";

// const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "VidOcean - Futuristic Ocean Experience",
  description: "Download social media content with stunning underwater effects",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* className={inter.className} */}
      <body>
        {/* Enhanced Futuristic Ocean Background */}
        <div className="ocean-background">
          <div className="underwater-light"></div>
          <div className="light-rays"></div>
          <div className="water-particles"></div>
          <div className="ocean-wave"></div>
          <div className="ocean-wave"></div>
          <div className="ocean-wave"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
        </div>

        <Navbar />
        {/* Updated spacing for different screen sizes */}
        <main className="pt-20 md:pt-24 lg:pt-32 pb-28 md:pb-8 px-4 relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
