'use client';

import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';


import DraggableSignature from './draggableSign';
import SignatureSidebar from './signSideBar';
import { downloadSignedPdf } from '@/utils/downloadSignedPdf';
import {
  getDocumentSignatures,
  saveSignature,
  updateSignaturePosition,
  deleteSignature,
} from '@/utils/api';

// Set the worker script for PDF.js (needed for parsing PDFs)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

export default function PdfViewer({ url, docId, refreshTrigger = 0, selectedPage, setSelectedPage, onPdfSigned }) {
  const [signatures, setSignatures] = useState([]);
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [internalTrigger, setInternalTrigger] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [pdfReady, setPdfReady] = useState(false);
  const [currentPageEl, setCurrentPageEl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
const [sidebarOpen, setSidebarOpen] = useState(false);
const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

const containerRef = useRef(null);
  const canvasRef = useRef(null);
const renderTaskRef = useRef(null);
  const fixedWidth = 1000;

  // Adjust sidebar state based on device view and selected signature
  useEffect(() => {
  if (selectedSignature) {
    setSidebarCollapsed(!isMobileView); // Sidebar collapsed by default on desktop
  }
}, [selectedSignature, isMobileView]);

 // Detect screen size changes
useEffect(() => {
  const updateMobileView = () => setIsMobileView(window.innerWidth <= 500);
  updateMobileView();
  window.addEventListener('resize', updateMobileView);
  return () => window.removeEventListener('resize', updateMobileView);
}, []);

// Fetch all saved signatures whenever document or trigger changes
  useEffect(() => {
    const fetch = async () => {
      const sigs = await getDocumentSignatures(docId);
      setSignatures(sigs || []);
    };
    fetch();
  }, [docId, refreshTrigger, internalTrigger]);

  // Renders a single PDF page on canvas
  useEffect(() => {
    const renderSinglePage = async () => {
      setIsLoading(true);

      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      setPageCount(pdf.numPages);

      const page = await pdf.getPage(selectedPage);
      const unscaledViewport = page.getViewport({ scale: 1 });
      const scale = fixedWidth / unscaledViewport.width;
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      if (!canvas) {
  console.warn('🟡 canvasRef is null, skipping render');
  return;
}
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.width = `${fixedWidth}px`;

      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (err) {
          console.warn('🟡 Could not cancel previous render', err);
        }
      }

      try {
        renderTaskRef.current = page.render({ canvasContext: context, viewport });
        await renderTaskRef.current.promise;
        setCurrentPageEl(canvas);
        setPdfReady(true);
      } catch (err) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('🟥 Render error:', err);
        }
      }
      setIsLoading(false);
    };

    renderSinglePage();
  }, [url, selectedPage]);

  
  // Trigger a re-render on window resize
  useEffect(() => {
    const handleResize = () => {
      setPdfReady(false);
      setTimeout(() => {
        setSelectedPage((prev) => prev); // Re-triggers rendering
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSelectedPage]);

    // Render page thumbnails in the sidebar
   useEffect(() => {
    const renderThumbnails = async () => {
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      setPageCount(pdf.numPages);
      const sidebar = document.getElementById('thumbnail-sidebar');
      if (!sidebar) return;
      sidebar.innerHTML = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');

        await page.render({ canvasContext: context, viewport }).promise;

        const wrapper = document.createElement('div');
        wrapper.className = `mb-2 cursor-pointer border p-1 rounded hover:ring ${i === selectedPage ? 'ring-2 ring-blue-500' : ''}`;
        wrapper.onclick = () => setSelectedPage(i);

        wrapper.appendChild(canvas);
        const label = document.createElement('div');
        label.innerText =   `Page ${i}`;
        label.className = 'text-center text-xs mt-1 text-gray-600';
        wrapper.appendChild(label);

        sidebar.appendChild(wrapper);
      }
    };

    renderThumbnails();
  }, [url, selectedPage, setSelectedPage]);

  
  // Handle drag-and-drop signature placement
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = async (e) => {
      e.preventDefault();
      if (!currentPageEl) return;

      const canvasRect = currentPageEl.getBoundingClientRect();
      const x = e.clientX - canvasRect.left;
      const y = e.clientY - canvasRect.top;

      try {
        const droppedData = JSON.parse(e.dataTransfer.getData('application/json'));

        const payload = {
          documentId: docId,
          x,
          y,
          page_number: selectedPage,
          signature_url: droppedData.signature_url,
          signerId: droppedData.signerId || droppedData.userId,
          name: droppedData.name || null,
          font: droppedData.font || null,
          color: droppedData.color || null,
       width: typeof droppedData.width === 'number' ? droppedData.width : 160,
height: typeof droppedData.height === 'number' ? droppedData.height : 64,

          type: droppedData.type === 'typed' ? 'typed' : 'upload',
        };

        const saved = await saveSignature(payload);
        setSignatures((prev) => [...prev, saved]);
      } catch (err) {
        console.error('🟥 Failed to drop signature:', err);
      }
    };

    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);
 
    return () => {
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('drop', handleDrop);
    };
  }, [docId, selectedPage, currentPageEl]);

    // Handle custom event for previewing the signed PDF
  useEffect(() => {
  const handlePreview = () => {
    downloadSignedPdf({ url, docId, signatures, previewOnly: true }).catch((err) =>
      console.error('❌ Preview error:', err)
    );
  };

  document.addEventListener('open-pdf-preview', handlePreview);
  return () => document.removeEventListener('open-pdf-preview', handlePreview);
}, [url, docId, signatures]);

  // Collapse the sidebar when clicking outside of it
useEffect(() => {
  const handleOutsideClick = (e) => {
    if (
      sidebarOpen &&
      !e.target.closest('#thumbnail-sidebar') &&
      !e.target.closest('button')
    ) {
      setSidebarOpen(false);
    }
  };

  if (sidebarOpen) {
    document.addEventListener('mousedown', handleOutsideClick);
  }

  return () => {
    document.removeEventListener('mousedown', handleOutsideClick);
  };
}, [sidebarOpen]);

// Called when a signature is dragged and repositioned
  const handleUpdatePosition = async (id, x, y, width, height) => {
    await updateSignaturePosition(id, x, y, width, height);
    setInternalTrigger((prev) => prev + 1);
  };

  // Called when a signature is deleted from the canvas
  const handleDeleteSignature = async (id) => {
    await deleteSignature(id);
    setSignatures((prev) => prev.filter((s) => s.id !== id));
  };

    // Finalize the PDF and notify parent
   const handleDownload = () =>
    downloadSignedPdf({ url, docId, signatures })
     .then(() => {
      if (typeof onPdfSigned === 'function') {
        onPdfSigned();
      }
    })
   .catch((err) => {
      console.error('❌ Finalize error:', err.message);
      alert(`Failed to finalize PDF: ${err.message}`);
    });
  
    return (
  <div className="flex h-full w-full overflow-hidden">

    {/* Mobile toggle for sidebar */}
    <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className="md:hidden fixed top-4 left-4 z-[10000] bg-white border rounded-full p-2 shadow-md"
    >
      {/* Hamburger or X icon depending on open state */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-gray-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {sidebarOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        )}
      </svg>
    </button>

      {/* Thumbnails sidebar */}
    <div
      id="thumbnail-sidebar"
      className={`fixed md:static top-0 left-0 h-full w-48 bg-white border-r p-2 z-[9999] transform transition-transform duration-300 ease-in-out overflow-y-auto ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:block`}
      style={{ maxHeight: '100%' }}
    ></div>

  {/* Main PDF canvas area */}
    <div
      className="relative flex-1 h-full overflow-y-auto bg-white flex items-center justify-center transition-all duration-300 ease-in-out"
      ref={containerRef}
    >
      {/* Show loading indicator while rendering */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-[9999]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
          <p className="ml-4 text-blue-700 font-medium">Loading page...</p>
        </div>
      )}

{/* Rendered PDF canvas */}
      <canvas
        ref={canvasRef}
        id="main-pdf-canvas"
        className="shadow-md rounded max-w-4/5 max-h-full"
      />

 {/* Overlay draggable signatures */}
      {pdfReady && currentPageEl && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50">
          {signatures
            .filter((s) => s.page_number === selectedPage)
            .map((sign) => {
              const rect = currentPageEl.getBoundingClientRect();
              const containerRect = containerRef.current?.getBoundingClientRect();
              const offsetX = rect.left - containerRect.left;
              const offsetY = rect.top - containerRect.top;

              return (
                <DraggableSignature
                  key={`sig-${sign.id}`}
                  id={sign.id}
                  imageUrl={sign.signature_url}
                  initialX={sign.x + offsetX}
                  initialY={sign.y + offsetY}
                  width={sign.width || 160}
                  height={sign.height || 64}
                  font={sign.font}
                  name={sign.name}
                  color={sign.color}
                  type={sign.type}
                  pageRef={currentPageEl}
                  onUpdatePosition={(id, x, y, w, h) =>
                    handleUpdatePosition(id, x - offsetX, y - offsetY, w, h)
                  }
                  onEdit={(sigData) => setSelectedSignature(sigData)}
                  onDelete={handleDeleteSignature}
                />
              );
            })}
        </div>
      )}

 {/* Edit sidebar for selected signature */}    
  {selectedSignature && (
        <div className="absolute top-4 right-4 z-[99999] bg-white border shadow-lg rounded-lg p-4 w-[340px] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-lg font-semibold">Edit Signature</h4>
            <button
              onClick={() => setSelectedSignature(null)}
              className="text-gray-600 hover:text-red-500 text-xl font-bold"
            >
              ×
            </button>
          </div>
          <SignatureSidebar
            docId={docId}
            editingSignature={selectedSignature}
            selectedPage={selectedPage}
            onSignatureSaved={() => {
              setSelectedSignature(null);
              setInternalTrigger((prev) => prev + 1);
            }}
            setRefreshTrigger={(fn) =>
              setInternalTrigger((prev) =>
                typeof fn === 'function' ? fn(prev) : prev + 1
              )
            }
          />
        </div>
      )}
  </div>
  </div>
);
}
