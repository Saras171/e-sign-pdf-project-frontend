"use client"; // Enables client-side interactivity (e.g., useEffect, animations) in Next.js App Router

// Animation library for smooth transitions
import { motion } from "framer-motion";


// List of features to highlight (imported from utils)
import { esealTrustFeatures } from '@/utils/authUtils';

/**
 * AuthFeatures Component
 * ------------------------
 * Displays a styled and animated list of benefits/features for joining the app.
 * Used on both Login and Signup pages.
 */
export default function AuthFeatures() {
  return (
      // Container animation for overall fade-in and slide-up effect
    <motion.div
      className="flex-1 max-w-xl text-left"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >

         {/* Animated heading */}
      <motion.h2
        className="text-4xl font-bold mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Why join eSealTrust?
      </motion.h2>


 {/* Animated list of features with staggered entrance */}
      <motion.ul
        className="space-y-4 text-lg"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.2 } },
        }}
      >

                {/* Map over feature array and animate each one */}
        {esealTrustFeatures.map(({ icon, text }, index) => (
  <motion.li
    key={index}
    className="flex items-center gap-3"
    variants={{
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
    }}
    transition={{ duration: 0.5 }}
  >
    {icon}
    <span>{text}</span>
  </motion.li>
))}

      </motion.ul>
    </motion.div>
  );
}
