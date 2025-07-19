"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutButton from "./LogoutButton";

export default function Header({ username, day, date }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const toggleNav = () => setNavOpen(!navOpen);
  const isAuthenticated = !!username;

  return (
    <header className="w-full bg-[#F0F6FF] shadow-md border-b border-[#C7D2FE] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-10">

        {/* Logo + Title */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-start">
          <Image
            src="/images/logo.jpeg"
            alt="Logo"
            width={60}
            height={60}
            className="rounded-full object-contain drop-shadow-md"
              style={{ height: "auto" }}
          />
          <span className="text-4xl sm:text-3xl font-bold text-[#1E3A8A] font-[Kaushan_Script] tracking-wide">
            eSealTrust
          </span>

          {/* Hamburger Button */}
          <button
            className="sm:hidden text-2xl text-[#1E3A8A] ml-auto absolute top-5 right-5"
            onClick={toggleNav}
            aria-label="Toggle Navigation"
          >
            {navOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Authenticated Greeting */}
        {isAuthenticated && (
          <div className="text-center sm:text-left w-full sm:w-auto">
            <p className="text-sm font-medium text-gray-600 mb-1">
              {day}, {date}
            </p>
            <p className="text-lg sm:text-xl font-semibold text-[#1E3A8A]">
              👋 Hello, <span className="text-[#2563EB]">{username}</span>
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <nav
            className={`absolute sm:static top-[70px] right-4 sm:top-0 bg-white rounded-md shadow-lg sm:shadow-none p-4 sm:p-0 z-50 transition-all duration-300 text-[#1E3A8A] ${
              navOpen ? "flex flex-col sm:flex-row gap-3" : "hidden sm:flex gap-4"
            }`}
          >
            {isAuthenticated ? (
              <>
                <NavLink href="/dashboard" label="Dashboard" onClick={() => setNavOpen(false)} />
                <LogoutButton />
              </>
            ) : (
              <>
                {pathname !== "/login" && (
                  <NavLink href="/login" label="Login" onClick={() => setNavOpen(false)} />
                )}
                {pathname !== "/signup" && (
                  <NavLink href="/signup" label="Sign Up" onClick={() => setNavOpen(false)} />
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="px-4 py-2 rounded-md hover:bg-[#DBEAFE] transition font-medium text-sm"
    >
      {label}
    </Link>
  );
}

