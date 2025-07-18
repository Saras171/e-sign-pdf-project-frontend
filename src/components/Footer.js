/**
 * Footer Component
 * -----------------
 * Global site footer displayed at the bottom of all pages.
 * Includes copyright, app name, and author attribution.
 */
export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 text-gray-500 py-4 text-sm text-center animate-fade-in">
      <div className="container mx-auto">
             {/* Dynamic copyright */}
        &copy; {new Date().getFullYear()}{" "}
        <p>
             {/* App name with styled brand */}
        <span className="font-medium text-blue-600">e-Sign Pdf Doc App</span>. All rights reserved.
        </p>
           {/* Developer attribution */}
        <p>Made with love by: <strong><i>Saraswati Rawat</i></strong></p>
      </div>
    </footer>
  );
}
