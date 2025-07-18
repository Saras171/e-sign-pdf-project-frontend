// Import Google fonts with Next.js built-in font optimization
import {
  Geist,
  Geist_Mono,
  Merriweather,
  Kaushan_Script,
  Great_Vibes,
  Sacramento,
  Pacifico,
  Satisfy,
  Dancing_Script,
  Parisienne,
  Calligraffitti,
  Herr_Von_Muellerhoff,
  Allura,
} from "next/font/google";

import "./globals.css";
import { Toaster } from "react-hot-toast";
import Footer from "../components/Footer";


// Base sans-serif and monospace fonts for general UI
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const merriweather = Merriweather({ variable: "--font-merriweather", subsets: ["latin"], weight: ["300", "400", "700"] });

// Pre-load all signature fonts used in the application
const kaushan = Kaushan_Script({ variable: "--font-kaushan", subsets: ["latin"], weight: "400" });
const greatVibes = Great_Vibes({ variable: "--font-great-vibes", subsets: ["latin"], weight: "400" });
const sacramento = Sacramento({ variable: "--font-sacramento", subsets: ["latin"], weight: "400" });
const pacifico = Pacifico({ variable: "--font-pacifico", subsets: ["latin"], weight: "400" });
const satisfy = Satisfy({ variable: "--font-satisfy", subsets: ["latin"], weight: "400" });
const dancingScript = Dancing_Script({ variable: "--font-dancing-script", subsets: ["latin"], weight: "400" });
const parisienne = Parisienne({ variable: "--font-parisienne", subsets: ["latin"], weight: "400" });
const calligraffitti = Calligraffitti({ variable: "--font-calligraffitti", subsets: ["latin"], weight: "400" });
const herrVon = Herr_Von_Muellerhoff({ variable: "--font-herr-von", subsets: ["latin"], weight: "400" });
const allura = Allura({ variable: "--font-allura", subsets: ["latin"], weight: "400" });

// App-wide metadata
export const metadata = {
  title: "eSealTrust",
  description: "Documents Signature App",
};

// Root layout wrapper applied globally to all pages
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          merriweather.variable,
          kaushan.variable,
          greatVibes.variable,
          sacramento.variable,
          pacifico.variable,
          satisfy.variable,
          dancingScript.variable,
          parisienne.variable,
          calligraffitti.variable,
          herrVon.variable,
          allura.variable,
          "bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen",
        ].join(" ")}
      >

          {/* Main app content */}
        <main className="flex-grow">{children}</main>
            {/* Toast notifications */}
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
         {/* App footer */}
        <Footer />
      </body>
    </html>
  );
}

