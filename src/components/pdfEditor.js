import { useState, useEffect } from 'react';
import SignatureSidebar from './signSideBar';
import dynamic from 'next/dynamic';

const PdfViewer = dynamic(() => import('./PDFViewer'), { ssr: false });

export default function PdfEditor({ url, docId, userId, onPdfSigned }) {
  const [refreshKey, setRefreshKey] = useState(0);   // State to trigger re-renders of PDF viewer when a signature is saved
  const [selectedPage, setSelectedPage] = useState(1); // Tracks the currently selected page in the PDF
  const [showPreview, setShowPreview] = useState(false);   // Toggles visibility of PDF preview (if needed externally)
  const [isMobile, setIsMobile] = useState(false);   // Detects if the screen size is mobile to adjust layout

    // Setup a resize listener to toggle between mobile and desktop layouts
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 500);
    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for custom 'open-pdf-preview' event from outside the component
  useEffect(() => {
    const openHandler = () => setShowPreview(true);
    document.addEventListener('open-pdf-preview', openHandler);
    return () => document.removeEventListener('open-pdf-preview', openHandler);
  }, []);

   // Called when a new signature is added to trigger PDF re-render
  const handleSignatureSaved = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className={`flex ${isMobile ? 'flex-col h-[100vh]' : 'flex-row'} gap-4 mt-6 h-[80vh]`}>
          {/* PDF Viewer Section */}
      <div className={`${isMobile ? 'w-full h-full' : 'w-4/5'} border rounded shadow overflow-auto w-4/5 h-[90vh]`}>
        <PdfViewer
          url={url}
          docId={docId}
          refreshTrigger={refreshKey}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
          onPdfSigned={onPdfSigned}
        />
      </div>

         {/* Signature Tools Sidebar */}
      <div className={`${isMobile ? 'w-full overflow-scroll' : 'w-1/5'} bg-white p-4 rounded shadow overflow-auto`}>
        <SignatureSidebar
          docId={docId}
          userId={userId}
          url={url}
          onSignatureSaved={handleSignatureSaved}
          selectedPage={selectedPage}
          setRefreshTrigger={(fn) => setRefreshKey(prev => typeof fn === 'function' ? fn(prev) : prev + 1)}
          onPdfSigned={onPdfSigned}
        />
      </div>
    </div>
  );
}
