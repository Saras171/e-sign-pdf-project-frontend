  'use client';

  import { useRef, useState, useEffect , useCallback } from 'react';
  import dynamic from 'next/dynamic';
  import Image from 'next/image';
  import { toast } from 'react-hot-toast';
import { Keyboard, PencilLine, Camera, Eye, FileSignature } from 'lucide-react';

import SignedPdfPreviewModal from './SignedPdfPreviewModal'; // Modal for previewing signed PDF
import { downloadSignedPdf } from '@/utils/downloadSignedPdf';
import SignedSuccessModal from './SignedSuccessModal'; // Modal shown after successful signing
  import { signatureFonts, signatureColors } from '@/utils/signatureFonts';
import {
    uploadSignatureImage,
    saveSignature,
    getDocumentSignatures,
    deleteSignature,
    updateSignature,
  } from '@/utils/api';

// Dynamically load signature canvas on client only (avoids SSR issues)
  const SignatureCanvas = dynamic(() => import('react-signature-canvas').then(mod => mod.default), {
    ssr: false,
  });

  export default function SignatureSidebar({ docId, userId, url, onSignatureSaved, setRefreshTrigger, editingSignature = null,   selectedPage = 1,   onPdfSigned}) {
      // Signature input mode: 'type', 'draw', 'upload'
    const [mode, setMode] = useState(null);
    const [typedName, setTypedName] = useState('');
    const [font, setFont] = useState(signatureFonts[0]);
    const [color, setColor] = useState(signatureColors[0]);
    const [uploadedImg, setUploadedImg] = useState(null);
    const [savedSignatures, setSavedSignatures] = useState([]);

const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [editMode, setEditMode] = useState(false);

    const [successModalOpen, setSuccessModalOpen] = useState(false);
const [generatedFileName, setGeneratedFileName] = useState('');
const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);


    const canvasRef = useRef(null);

    // Fetch existing saved signatures for this document
    const loadSignatures = useCallback(async () => {
      try {
        const res = await getDocumentSignatures(docId);
        setSavedSignatures(res || []);
        // onSignatureSaved?.();
      } catch (err) {
        console.error('Failed to load signatures:', err);
      }
    }, [docId]);

    // Load signatures when component mounts or when docId changes
    useEffect(() => {
      loadSignatures();
    }, [loadSignatures]);

      // Populate fields when editing an existing signature
  useEffect(() => {
      if (!editingSignature) {
    reset();  // clear everything if modal is closed
  }
  if (editingSignature) {
    let correctedType = null;

    if (editingSignature.type === 'typed') {
      correctedType = 'type';
    } else if (editingSignature.type === 'upload') {
      //  Read 'correctType' passed from draggableSign
      if (editingSignature.correctType === 'draw') {
        correctedType = 'draw';
      } else {
        correctedType = 'upload';
      }
    }

    setMode(correctedType);
    setTypedName(editingSignature.name || '');
    setFont(editingSignature.font || signatureFonts[0]);
    setColor(editingSignature.color || signatureColors[0]);
    setEditMode(true);
    setUploadedImg(editingSignature.signature_url || null);
  }
}, [editingSignature]);

 

      // Save or update a signature based on mode and edit state
    const handleSave = async () => {
      try {
        let name = typedName || null;

        // Update Existing Signature 
        if (editMode && editingSignature) {
          const id = editingSignature.id;

          if (mode === 'type') {
            await updateSignature(id, {
              name,
              font,
              color,
              type: 'typed',
            });
          } else if (mode === 'upload' && uploadedImg instanceof File) {
            await uploadSignatureImage(uploadedImg, {
              documentId: docId,
              x: editingSignature.x,
              y: editingSignature.y,
              page_number: editingSignature.page_number,
              width: editingSignature.width,
              height: editingSignature.height,
              name,
              font,
              color,
              type: 'upload',
            });
          } else if (mode === 'draw') {
            const canvas = canvasRef.current;
            if (!canvas || canvas.isEmpty()) {
              toast.error('Please draw your signature.');
              return;
            }

            const dataUrl = canvas.toDataURL();
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], `sign-${Date.now()}.png`, { type: 'image/png' });

            await uploadSignatureImage(file, {
              documentId: docId,
              x: editingSignature.x,
              y: editingSignature.y,
              page_number: editingSignature.page_number,
              width: editingSignature.width,
              height: editingSignature.height,
              name,
              font,
              color,
              type: 'drawn',
            });
          }

          toast.success('Signature updated');
          reset();
          await loadSignatures();
          setRefreshTrigger?.(prev => prev + 1);
          return;
        }

        // Create New Signature
        if (mode === 'draw') {
          const canvas = canvasRef.current;
          if (!canvas || canvas.isEmpty()) {
            toast.error('Please draw your signature.');
            return;
          }

          const dataUrl = canvas.toDataURL();
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `sign-${Date.now()}.png`, { type: 'image/png' });

          await uploadSignatureImage(file, {
            documentId: docId,
            x: 200,
            y: 300,
             page_number: selectedPage,
            width: 160,
            height: 64,
            name,
            font,
            color,
            type: 'upload',
          });
        } else if (mode === 'upload' && uploadedImg instanceof File) {
          await uploadSignatureImage(uploadedImg, {
            documentId: docId,
            x: 200,
            y: 300,
             page_number: selectedPage,
            width: 160,
            height: 64,
            name,
            font,
            color,
            type: 'upload',
          });
        } else if (mode === 'type') {
          const payload = {
            documentId: docId,
            x: 200,
            y: 300,
             page_number: selectedPage,
            signature_url: null,
            width: 160,
            height: 64,
            type: 'typed',
            font,
            color,
            name,
          };

          await saveSignature(payload);
        }

        toast.success('Signature saved');
        reset();
        await loadSignatures();
        setRefreshTrigger?.(prev => prev + 1);
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Failed to save signature');
      }
    };

     // Handle signature deletion
    const handleDelete = async (id) => {
      try {
        await deleteSignature(id);
        toast.success('Signature deleted');
        await loadSignatures();
        setRefreshTrigger?.(prev => prev + 1);
      } catch (err) {
        toast.error(err.message || 'Failed to delete');
      }
    };

      // Reset form to initial state
    const reset = () => {
      setMode(null);
      setTypedName('');
      setFont(signatureFonts[0]);
      setColor(signatureColors[0]);
      setUploadedImg(null);
      setEditMode(false);
      canvasRef.current?.clear();
    };

    return (

      <div className="h-full flex flex-col justify-between">
 
  {/* Signature creation section */}
              <div>
        <h3 className="text-xl font-semibold mb-4">{editMode ? 'Edit Signature' : 'Add Signature'}</h3>


        {/* Signature Mode Selection */}
        {!mode && (
          <div className="space-y-3">

             {/* Each mode button has appropriate icon and label */}
            <button
  onClick={() => setMode('type')}
  className="flex items-center justify-center gap-2 w-full bg-[#F5F5F5]  text-[#3A7BF5] border border-[#3A7BF5] hover:bg-[#eaeaea] py-2 px-2 rounded"
  title="Type Signature"
>
             <Keyboard className="w-5 h-5" />
             <span className="hidden md:inline"> Type Signature </span>
            </button>
<button
  onClick={() => setMode('draw')}
  className="flex items-center justify-center  gap-2 w-full bg-[#F5F5F5]  text-[#3A7BF5] border border-[#3A7BF5] hover:bg-[#eaeaea] py-2 px-2 rounded "
  title="Draw Signature"
>
            <PencilLine className="w-5 h-5" />
            <span className="hidden md:inline">  Draw Signature </span>
            </button>
            <button
  onClick={() => setMode('upload')}
  className="flex items-center justify-center gap-2 w-full bg-[#F5F5F5]  text-[#3A7BF5] border border-[#3A7BF5] hover:bg-[#eaeaea] py-2 px-2  rounded"
  title="Upload Stamp/Sign"
>
             <Camera className="w-5 h-5" /> 
             <span className="hidden md:inline"> Upload Stamp/Sign </span>
            </button>
          </div>
        )}

 {/* Type Mode UI */}
        {mode === 'type' && (
          <div className="mt-4 space-y-4">
            <input
              type="text"
              placeholder="Enter your name"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <select value={font} onChange={(e) => setFont(e.target.value)} className="w-full p-2 border rounded">
              {signatureFonts.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <div className="flex gap-2">
              {signatureColors.map((c) => (
                <div
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 cursor-pointer ${color === c ? 'border-black' : 'border-white'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="border p-2 rounded bg-gray-100 text-center" style={{ fontFamily: font, color }}>
              <span className="text-2xl">✍ {typedName || 'Preview'}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded">
                {editMode ? 'Update' : 'Save'}
              </button>
              <button onClick={reset} className="bg-red-500 text-white px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        )}

 {/* Draw Mode UI */}
        {mode === 'draw' && (
          <div className="mt-4 space-y-2">
            <SignatureCanvas
              ref={canvasRef}
              penColor="black"
              canvasProps={{
                width: 600,
                height: 150,
                className: 'border border-gray-300 rounded w-full',
              }}
              minWidth={0.8}
              maxWidth={2.5}
              velocityFilterWeight={0.6}
            />
            <div className="flex gap-2 mt-2">
              <button onClick={() => canvasRef.current?.clear()} className="bg-gray-200 px-3 py-1 rounded">Clear</button>
              <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded">{editMode ? 'Update' : 'Save'}</button>
              <button onClick={reset} className="bg-red-500 text-white px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        )}

  {/* Upload Mode UI */}
        {mode === 'upload' && (
  <div className="mt-4 space-y-4 border p-4 rounded bg-gray-50 shadow-inner transition-all duration-300">
    <h4 className="text-lg font-semibold text-gray-800">Upload Image / Company Stamp</h4>
    
    <div className="flex items-center justify-between">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setUploadedImg(e.target.files[0])}
        className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0 file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    </div>

    {uploadedImg && (
      <div className="mt-4">
        <Image
          src={uploadedImg instanceof File ? URL.createObjectURL(uploadedImg) : uploadedImg}
          alt="Preview"
          width={300}
          height={100}
          className="object-contain mt-2 border rounded shadow"
        />
      </div>
    )}

    <div className="flex gap-3 mt-4">
      {uploadedImg && (
        <button
          onClick={handleSave}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
        >
          {editMode ? 'Update' : 'Save'}
        </button>
      )}

      <button
        onClick={reset}
        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
      >
        Cancel
      </button>
    </div>
  </div>
)}

</div>
{/* Preview & Generate Buttons (only if not in edit mode) */}
{!editMode && (
  <div className="mt-10 pt-8 border-t  border-gray-300">
    <div className="space-y-3">
      {/* Preview Button */}
      <button
        className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-2 rounded"
       title='Preview Signed Pdf'
        onClick={async () => {
          try {
            const latestSignatures = await getDocumentSignatures(docId);
            const { previewBlob } = await downloadSignedPdf({
              url,
              docId,
              signatures: latestSignatures,
              previewOnly: true,
              returnBlob: true,
            });

            const blobUrl = URL.createObjectURL(previewBlob);
            setPdfPreviewUrl(blobUrl);
          } catch (err) {
            console.error('❌ Failed to generate preview:', err);
            toast.error('Failed to generate preview');
          }
        }}
      >
     <Eye className="w-5 h-5" />
     <span className="hidden md:inline">    Preview Signed PDF </span>
      </button>

      {/* Generate Button */}
     
      <button
  className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-2 rounded disabled:opacity-60 disabled:cursor-not-allowed"
  title="Generate Signed Pdf"
  onClick={async () => {
    setIsGeneratingPdf(true); // Start loading
    try {
      const latestSignatures = await getDocumentSignatures(docId);
      const { fileName } = await downloadSignedPdf({
        url,
        docId,
        signatures: latestSignatures,
      });
      if (fileName) {
        setGeneratedFileName(fileName);
        setSuccessModalOpen(true);
      }
      toast.success('Signed PDF downloaded');
      setRefreshTrigger?.((prev) => prev + 1);
      onSignatureSaved?.();
      onPdfSigned?.();
    } catch (err) {
      console.error('❌ Failed to generate signed PDF:', err);
      toast.error('Failed to generate signed PDF');
    } finally {
      setIsGeneratingPdf(false); // End loading
    }
  }}
  disabled={isGeneratingPdf}
>
  {isGeneratingPdf ? (
    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4l5-5-5-5v4a12 12 0 00-12 12h4z"
      />
    </svg>
  ) : (
    <>
      <FileSignature className="w-5 h-5" />
      <span className="hidden md:inline">Generate Signed PDF</span>
    </>
  )}
</button>

    </div>
  </div>
)}

 {/* Preview Modal (when preview blob is ready) */}
{pdfPreviewUrl && (
  <SignedPdfPreviewModal
    pdfBlobUrl={pdfPreviewUrl}
    onClose={() => {
      // Clean up the blob URL and close the preview modal
      URL.revokeObjectURL(pdfPreviewUrl); // Cleanup the blob URL
      setPdfPreviewUrl(null); // Clear the preview URL state
    }}
  />
)}

   {/* Success Modal (on final signed PDF generation) */}
{successModalOpen && (
  <SignedSuccessModal
    fileName={generatedFileName}
    onClose={() => setSuccessModalOpen(false)}
  />
)}

     </div>
);

  }

 