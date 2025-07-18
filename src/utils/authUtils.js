// utils/authUtils.js

import {
  PenLine,
  FileSignature,
  MousePointerClick,
  Leaf,
  Gift,
  Building2,
} from "lucide-react";

/**
 * Feature list displayed on login/signup pages.
 * Each feature includes:
 * - icon: React icon component from Lucide
 * - text: Description of the feature
 */
export const esealTrustFeatures = [
  {
    icon: <PenLine size={20} className="text-[#3A7BF5]" />,
    text: "Digitally sign your documents in seconds",
  },

  {
    icon: <FileSignature size={20} className="text-[#3A7BF5]" />,
    text: "Multi-signature support with custom signing order",
  },
  {
    icon: <MousePointerClick size={20} className="text-[#3A7BF5]" />,
    text: "Easy-to-use interface for fast uploads and signing",
  },
  {
    icon: <Leaf size={20} className="text-[#3A7BF5]" />,
    text: "Paperless and eco-friendly digital documentation",
  },
  {
    icon: <Gift size={20} className="text-[#3A7BF5]" />,
    text: "Free to use for individuals and personal needs",
  },
  {
    icon: <Building2 size={20} className="text-[#3A7BF5]" />,
    text: "Enterprise-grade reliability and access control",
  },
];

