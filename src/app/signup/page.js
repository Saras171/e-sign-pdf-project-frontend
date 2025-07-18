"use client"; // Enables React Client Component behavior in Next.js App Router

import { toast } from "react-hot-toast"; // For user feedback (toasts)
import { useRouter } from "next/navigation"; // For programmatic navigation in Next.js

import AuthForm from "@/components/AuthForm"; // Reusable login/signup form component
import Header from "@/components/Header";  // Application header component
import AuthFeatures from "@/components/AuthFeatures";  // Right-side animated feature highlights
import { signup } from "@/utils/api";    // Signup API utility function

/**
 * Signup Page
 * -----------
 * This page handles new user registration:
 * - Left: Signup form for username, email, password
 * - Right: Animated feature highlights of the app
 */
export default function SignupPage() {
  const router = useRouter(); // Next.js router for navigation

  /**
   * Handles user signup
   * - Calls backend API with new user data
   * - On success: shows toast and redirects to dashboard
   * - On failure: shows error toast
   */
  const handleSignup = async ({ username, email, password }) => {
    try {
      const res = await signup(username, email, password);
      toast.success("Signup successful!"); //  Notify user
  router.push("/dashboard");
 return res;
    } catch (err) {
      toast.error(err?.message || "Signup failed. Please try again.");
      throw err; // Optional: For further error handling
    }
  };

  return (
    <> 
         {/* Top Navigation/Header */}
      <Header />

      {/* Main Container */}
      <div className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-10 px-6 py-10 bg-[#E6F0FA] text-[#1E3A8A]">
      
        {/* Left Section: Signup Form */}
        <div className="flex-1 flex justify-center">
          <AuthForm type="signup" onSubmit={handleSignup} />
        </div>

        {/* Right Section: Feature Highlights */}
        <AuthFeatures />
      </div>
    </>
  );
}
