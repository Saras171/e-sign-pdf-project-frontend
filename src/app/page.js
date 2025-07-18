"use client";

import Image from "next/image";
import { motion} from "framer-motion";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  
  
  // Redirects user to login page on CTA click
  const handleClick = () => {
    router.push("/login");
  };

  return (
    <main className="min-h-screen flex bg-[#E6F0FA] relative overflow-x-hidden text-[#1E3A8A]">
      {/* Main section: centers content both vertically and horizontally */}
      <div className="flex-1 w-full min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">

        {/* Logo animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative overflow-hidden rounded-full shadow-xl border-4 border-white w-48 h-48 sm:w-60 sm:h-60 bg-white"
        >
          <Image
  src="/images/logo.jpg"
  alt="eSeal Logo"
  fill
  sizes="(max-width: 768px) 240px, 192px"
  className="object-contain"
  priority
/>

        </motion.div>

          {/* Decorative line below the logo */}
        <motion.hr
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-2/3 border-t-2 border-[#3B82F6] rounded-full mt-6"
        />

   {/* App title with custom font */}
        <motion.h1
          className="text-5xl sm:text-6xl text-[#1E3A8A] font-[Kaushan_Script] tracking-wide mt-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          eSealTrust
        </motion.h1>


        {/* Introductory tagline */}
        <motion.p
          className="max-w-2xl text-lg sm:text-xl text-gray-700 px-4 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          Plan with precision. Organize with elegance. eSealTrust helps you manage and sign your documents securely and seamlessly.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-6"
        >
          <button
            onClick={handleClick}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-300"
          >
            Get Started
          </button>
        </motion.div>
      </div>
    </main>
  );
}


