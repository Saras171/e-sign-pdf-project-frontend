"use client"; // Enables client-side interactivity (useRouter, useEffect) in Next.js App Router
 
import { useRouter } from "next/navigation";
import { logout } from "@/utils/api";
import { toast } from "react-hot-toast";

/**
 * LogoutButton Component
 * ----------------------
 * - Provides a logout button for authenticated users.
 * - Calls backend logout API to clear the session cookie.
 * - On success, redirects the user to the login page and shows a toast message.
 * - On failure, logs the error and notifies the user.
 */
export default function LogoutButton() {
  const router = useRouter();

   // Handler for logout logic
  const handleLogout = async () => {
    try {
      await logout();  // Call logout API to clear session
      router.push("/login"); // Redirect to login after logout
     toast.success("Successfully logged out");
    } catch (err) {
      console.error("Logout failed:", err.message);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium"
    >
      Logout
    </button>
  );
}
