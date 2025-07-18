// components/SignedPdfPreviewModal.jsx
'use client';

import { useEffect, useRef } from 'react';

// Modal component to preview a signed PDF file in an iframe
export default function SignedPdfPreviewModal({ pdfBlobUrl, onClose }) {
  const iframeRef = useRef(null);

   // Set up ESC key listener to allow modal closure via keyboard
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
     // Clean up the event listener on unmount
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    // Modal backdrop: dark semi-transparent background
    <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center">
         {/* Modal container */}
      <div className="relative bg-white rounded-lg shadow-xl w-[90%] h-[90%] overflow-hidden">

         {/* Close button positioned at the top-right corner */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 bg-red-600 text-white px-3 py-1 rounded"
        >
          ✕ Close
        </button>

         {/* Embed the PDF file using an iframe */}
        <iframe
          ref={iframeRef}
          src={pdfBlobUrl}
          title="Signed PDF Preview"
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
