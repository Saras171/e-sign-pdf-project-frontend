"use client"; // Enables React Client Component behavior in Next.js App Router

import { toast } from "react-hot-toast"; // For user feedback (toasts)
import { useRouter } from "next/navigation"; // For programmatic navigation in Next.js

// Component imports
import AuthForm from "@/components/AuthForm";  // Reusable login/signup form component
import Header from "@/components/Header";   // Application header component
import AuthFeatures from "@/components/AuthFeatures"; // Right-side animated feature highlights
import { login } from "@/utils/api";    // Login API utility function


/**
 * Login Page
 * ----------
 * This page handles user authentication via email/password.
 * - Left side: Login form
 * - Right side: Animated feature benefits of the app
 */
export default function LoginPage() {
  const router = useRouter();  // Next.js router for navigation

    /**
   * Handles user login
   * - Sends credentials to backend
   * - On success: Shows toast and redirects to dashboard
   * - On failure: Displays error toast
   */
  const handleLogin = async ({ email, password }) => {
    try {
      const res = await login(email, password);
      toast.success("Login successful!"); //  Notify user
 router.push("/dashboard");
  return res;
    } catch (err) {
      toast.error(err?.message || "Invalid credentials. Please sign up first.");
      throw err;  // Optional: For further error handling
    }
  };

  return ( 
    <> 
     {/* Top Navigation/Header */}
      <Header />

       {/* Main Container */}
      <div className="min-h-screen flex flex-col md:flex-row md:py-4 items-center justify-center gap-10 px-6 py-10 bg-[#E6F0FA] text-[#1E3A8A]">
       
        {/* Left Section: Login Form */}
        <div className="flex w-1/2 justify-center">
          <AuthForm type="login" onSubmit={handleLogin} />
        </div>

        {/* Right Section: Feature Highlights */}
        <AuthFeatures />
      </div>
    </>
  );
}
