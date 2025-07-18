// components/SignedSuccessModal.js
"use client";

/**
 * Modal component to notify the user that a PDF was successfully signed and downloaded.
 * Props:
 *  - fileName: Name of the signed PDF file
 *  - onClose: Function to close the modal
 */
export default function SignedSuccessModal({ fileName, onClose }) {
  return (
    // Fullscreen overlay with semi-transparent background to focus user attention
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-50">
      {/* Modal container with success styling */}
      <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md transform transition-all scale-100 animate-fade-in">
        {/* Success message */}
        <h2 className="text-xl font-semibold text-green-600 mb-2">
          🎉 PDF Signed Successfully!
        </h2>
        {/* File information */}
        <p className="text-gray-700">
          Your signed PDF <strong>{fileName}</strong> has been saved and
          downloaded.
        </p>
        {/* Close button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
