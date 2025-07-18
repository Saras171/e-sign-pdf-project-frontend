"use client"; // Required for using React hooks in Next.js App Router

// React hooks for local state
import { useState } from "react";

// Icons for toggling password visibility
import { Eye, EyeOff } from "lucide-react";

/**
 * AuthForm Component
 * -------------------
 * Reusable form component for both Login and Signup.
 *
 * Props:
 * - type: "login" or "signup"
 * - onSubmit: function to handle form submission (API call)
 */
export default function AuthForm({ type, onSubmit }) {
   // === Form Fields ===
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

   // === UX States ===
  const [message, setMessage] = useState(null); // for success or error feedback
const [showPassword, setShowPassword] = useState(false);  // toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // toggle confirm password visibility
const [isSubmitting, setIsSubmitting] = useState(false);


  // === Form Submission Handler ===
  const handleSubmit = async (e) => {
    e.preventDefault();
 // Validation: password and confirm password must match in signup
    if (type === "signup" && password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setIsSubmitting(true);
       // Call the passed-in onSubmit function and handle result
    try {
      const res = await onSubmit({ username, email, password });
      setMessage({ type: "success", text: res.message });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
        setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F5F5F5] p-7 rounded-3xl shadow-2xl w-full max-w-md animate-fade-in border border-gray-200">
     
       {/* Heading */}
      <h2 className="text-4xl font-extrabold text-center mb-4 text-gray-800">
        {type === "login" ? "Login" : "Create Your Account"}
      </h2>

  {/* === Form Starts === */}
      <form onSubmit={handleSubmit} className="space-y-6">
         {/* Username (Signup only) */}
        {type === "signup" && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              required
              className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        )}

   {/* Email Field */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            required
            className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

     {/* Password Field with Eye Icon Toggle */}   
        <div className="flex flex-col gap-1">
  <label className="text-sm font-medium text-gray-700">Password</label>
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      placeholder="Enter your password"
      required
      className="w-full px-2 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-500"
      aria-label="Toggle password visibility"
    >
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>
</div>


        {/* Confirm Password (signup only) */}
           {type === "signup" && (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">Confirm Password</label>
    <div className="relative">
      <input
        type={showConfirmPassword ? "text" : "password"}
        placeholder="Re-enter your password"
        required
        className="w-full px-2 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-500"
        aria-label="Toggle confirm password visibility"
      >
        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  </div>
)}


        {/* Submit Button */}
        <button
  type="submit"
  disabled={isSubmitting}
  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md text-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
>
  {isSubmitting ? (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
  ) : (
    type === "login" ? "Login" : "Sign Up"
  )}
</button>

      </form>
            {/* === Form Ends === */}

 {/* Success or Error Feedback */}
      {message && (
        <p
          className={`mt-4 text-center text-sm ${
            message.type === "error" ? "text-red-500" : "text-green-500"
          }`}
        >
          {message.text}
        </p>
      )}

    {/* Footer Navigation Link */}
      <div className="text-center mt-6 text-gray-600 text-sm">
        {type === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="font-medium underline hover:text-indigo-500"
            >
              Sign up
            </a>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium underline hover:text-indigo-500"
            >
              Login
            </a>
          </>
        )}
      </div>
    </div>
  );
}

