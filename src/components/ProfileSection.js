// components/ProfileSection.js
'use client'; // Enables client-side rendering in Next.js

import { UserCircle } from 'lucide-react';
import Image from 'next/image';

// Displays a user's profile information including avatar, name, and email.
export default function ProfileSection({ user }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
      <div className="flex items-center gap-5 mb-6">
      {/* Avatar section with fallback icon if image is unavailable */}
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-blue-500 shadow-md">
          {user?.avatarUrl ? (
            <Image src={user.avatarUrl} alt="Avatar" fill className="object-cover" />
          ) : (
            <UserCircle className="text-blue-400 w-full h-full p-2" />
          )}
        </div>
        
 {/* User's name and email */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {user?.username || 'Unnamed User'}
          </h2>
          <p className="text-gray-600">{user?.email || 'No email provided'}</p>
        </div>
      </div>
    </div>
  );
}
