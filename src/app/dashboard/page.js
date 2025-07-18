"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  User,
  FileSignature,
  Menu,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

import ProfileSection from "@/components/ProfileSection";
import Header from "@/components/Header";
import PdfEditor from "@/components/pdfEditor";
import {
  getCurrentUser,
  uploadPDF,
  softDeleteDocument,
  restoreDocument,
  permanentlyDeleteDocument,
  getUserDocuments,
} from "@/utils/api";

export default function Dashboard() {
  const router = useRouter();

  // User and PDF state
  const [user, setUser] = useState(null);
  const [pdfs, setPdfs] = useState([]);

  // File interaction state
  const [uploading, setUploading] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);
  const [selectedDocId, setSelectedDocId] = useState(null);

  // UI navigation state
  const [activeTab, setActiveTab] = useState("uploaded");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // ID of file to delete
  const [showConfirmModal, setShowConfirmModal] = useState(false); // toggle modal
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [nestedOpen, setNestedOpen] = useState({ signed: false, trash: false });

  // Mobile screen handling
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const sidebarRef = useRef();

  // Determine screen size on initial render and resize
  useEffect(() => {
    const checkScreen = () => setIsSmallScreen(window.innerWidth < 640);
    checkScreen(); // initial check
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Fetch current user and their documents on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);

        const userDocs = await getUserDocuments(userData.id);
        setPdfs(userDocs);
      } catch {
        toast.error("Please log in to access your dashboard.");
        router.push("/login");
      }
    };
    fetchData();
  }, [router]);

  // Toggle visibility of nested menu items
  const toggleNested = (key) => {
    setNestedOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Refetch and update PDF list
  const refreshUserDocuments = async () => {
    try {
      const userDocs = await getUserDocuments(user.id);
      setPdfs(userDocs);
    } catch (err) {
      console.error("❌ Failed to refresh documents:", err.message);
      toast.error("Failed to refresh document list.");
    }
  };

  // Upload new PDF file
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") return;

    try {
      setUploading(true);
      const result = await uploadPDF(file, user.id);
      const newPdf = {
        id: result.documentId,
        file_name: file.name,
        status: "uploaded",
        file_url: result.fileUrl,
        deleted_at: null,
      };

      setPdfs([newPdf, ...pdfs]);
      toast.success("PDF uploaded and opened!");
      setSelectedPdfUrl(result.fileUrl);
      setSelectedDocId(result.documentId);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Open PDF viewer/editor
  const handlePreview = (url, docId) => {
    setSelectedPdfUrl(url);
    setSelectedDocId(docId);
  };

  // Filter PDFs based on current tab
  const filteredPdfs = pdfs.filter((pdf) => {
    const isDeleted = !!pdf.deleted_at;
    if (activeTab === "trash") return isDeleted;
    if (activeTab === "uploaded")
      return pdf.status === "uploaded" && !isDeleted;
    if (activeTab === "signed") return pdf.status === "signed" && !isDeleted;
    return true;
  });

  // Trigger browser download for signed PDFs
  const downloadSignedFileFromUrl = (url, fileName = "signed.pdf") => {
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Download failed");
        return res.blob();
      })
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((err) => {
        console.error("❌ Download failed:", err);
        toast.error("Failed to download signed PDF.");
      });
  };

  // Refresh document list and switch to "signed" tab
  const handlePdfSigned = async () => {
    await refreshUserDocuments();
    setActiveTab("signed");
  };

  // Move document to trash
  const handleSoftDelete = async (id) => {
    try {
      await softDeleteDocument(id);
      await refreshUserDocuments();
      toast.success("Moved to trash.");
    } catch (err) {
      toast.error(err.message || "Soft delete failed.");
    }
  };

  // Restore document from trash
  const handleRestore = async (id) => {
    try {
      await restoreDocument(id);
      await refreshUserDocuments();
      toast.success("Document restored.");
    } catch (err) {
      toast.error(err.message || "Restore failed.");
    }
  };

  // Permanently delete document
  const handlePermanentDelete = async () => {
    try {
      await permanentlyDeleteDocument(confirmDeleteId);
      await refreshUserDocuments();
      toast.success("Permanently deleted.");
    } catch (err) {
      toast.error(err.message || "Permanent delete failed.");
    } finally {
      setShowConfirmModal(false);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        title="Welcome to Your Dashboard"
        day={new Date().toLocaleDateString("en-IN", { weekday: "long" })}
        date={new Date().toLocaleDateString("en-IN")}
        username={user?.username || "User"}
      />

      {/* Toggle Sidebar on small screens */}
      <button
        className="sm:hidden absolute top-4 left-4 z-50 bg-white p-2 rounded-full shadow"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="w-6 h-6 text-gray-800" />
      </button>

      <main className="flex h-[calc(100vh-80px)]">
        {/* Sidebar Backdrop on small screens */}
        {isSmallScreen && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30"
            onClick={() => setSidebarOpen(false)} // close when clicking backdrop
          />
        )}
        {/* Sidebar Navigation */}
        <motion.aside
          ref={sidebarRef}
          initial={false}
          animate={{ x: isSmallScreen && !sidebarOpen ? "-100%" : 0 }}
          transition={{ duration: 0.3 }}
          className="fixed sm:static z-40 w-64 h-full bg-white shadow-md p-4 space-y-2 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-xl font-bold mb-4">Dashboard</div>
          {/* Tabs */}
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-4 py-2 rounded ${
              activeTab === "profile" ? "bg-blue-100" : ""
            }`}
          >
            <User className="inline w-5 h-5 mr-2" /> Profile
          </button>
          <button
            onClick={() => setActiveTab("uploaded")}
            className={`w-full text-left px-4 py-2 rounded ${
              activeTab === "uploaded" ? "bg-blue-100" : ""
            }`}
          >
            <FileText className="inline w-5 h-5 mr-2" /> Uploaded PDFs
          </button>

          {/* Nested Signed PDFs */}
          <div>
            <button
              onClick={() => toggleNested("signed")}
              className={`w-full flex justify-between items-center text-left px-4 py-2 rounded ${
                activeTab === "signed" ? "bg-blue-100" : ""
              }`}
            >
              <span>
                <FileSignature className="inline w-5 h-5 mr-2" /> Signed PDFs
              </span>
              {nestedOpen.signed ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {nestedOpen.signed && (
              <div className="ml-6 space-y-1">
                <button
                  onClick={() => setActiveTab("signed")}
                  className={`block w-full text-left px-3 py-1 rounded text-sm ${
                    activeTab === "signed" ? "bg-blue-100" : ""
                  }`}
                >
                  All Signed
                </button>
              </div>
            )}
          </div>

          {/* Nested Trash */}
          <div>
            <button
              onClick={() => toggleNested("trash")}
              className={`w-full flex justify-between items-center text-left px-4 py-2 rounded ${
                activeTab === "trash" ? "bg-blue-100" : ""
              }`}
            >
              <span>
                <Trash2 className="inline w-5 h-5 mr-2" /> Trash
              </span>
              {nestedOpen.trash ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {nestedOpen.trash && (
              <div className="ml-6 space-y-1">
                <button
                  onClick={() => setActiveTab("trash")}
                  className={`block w-full text-left px-3 py-1 rounded text-sm ${
                    activeTab === "trash" ? "bg-blue-100" : ""
                  }`}
                >
                  Deleted Files
                </button>
              </div>
            )}
          </div>
        </motion.aside>

        {/* Main Content */}
        <section className="flex-1 p-6 overflow-y-auto">
          {activeTab === "profile" && <ProfileSection user={user} />}

          {/* Uploaded/Signed/Trash View */}
          {["uploaded", "signed", "trash"].includes(activeTab) && (
            <>
              <div className="mb-6">
                <label className="flex  items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition  w-full md:w-[220px]">
                  <Upload className="w-5 h-5" />
                  {uploading ? "Uploading..." : "Upload PDF"}
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Document List */}
              <div className="bg-white rounded shadow p-4">
                <h2 className="text-xl font-semibold mb-4">
                  {activeTab === "uploaded"
                    ? "Uploaded Documents"
                    : activeTab === "signed"
                    ? "Signed Documents"
                    : "Trash Bin"}
                </h2>

                {filteredPdfs.length === 0 ? (
                  <p className="text-gray-500">No documents found.</p>
                ) : (
                  <ul className="space-y-3">
                    {filteredPdfs.map((pdf) => (
                      <li
                        key={pdf.id}
                        className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:items-center p-3 border rounded hover:bg-gray-50"
                      >
                        {/* File Info Section */}
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-600" />
                          <span className="text-sm break-all">
                            {pdf.file_name}
                          </span>
                        </div>

                        {/* Status + Action Buttons */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 justify-end sm:justify-start">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              pdf.status === "signed"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {pdf.status}
                          </span>

                          {activeTab !== "trash" && (
                            <button
                              onClick={() =>
                                handlePreview(pdf.file_url, pdf.id)
                              }
                              className="text-blue-600 hover:text-blue-800"
                              title="Open"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          )}

                          {pdf.status === "signed" && !pdf.deleted_at && (
                            <button
                              onClick={() =>
                                downloadSignedFileFromUrl(
                                  pdf.file_url,
                                  pdf.file_name
                                )
                              }
                              className="text-green-600 hover:text-green-800"
                              title="Download Signed PDF"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                                />
                              </svg>
                            </button>
                          )}

                          {activeTab === "trash" ? (
                            <>
                              <button
                                onClick={() => handleRestore(pdf.id)}
                                className="text-green-600 hover:text-green-800"
                                title="Restore"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-5 h-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 10h7V3M21 14c0 4.418-3.582 8-8 8s-8-3.582-8-8a7.965 7.965 0 012.343-5.657l1.414 1.414A5.974 5.974 0 006 14a6 6 0 1012 0z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmDeleteId(pdf.id);
                                  setShowConfirmModal(true);
                                }}
                                className="text-red-600 hover:text-red-800"
                                title="Delete permanently"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleSoftDelete(pdf.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Move to trash"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>
      </main>

      {/* PDF Editor Modal */}
      {selectedPdfUrl && selectedDocId && (
        <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center">
          <div className="relative w-[96%] h-[96%] bg-white rounded-lg shadow-xl overflow-hidden">
            <button
              onClick={() => {
                setSelectedPdfUrl(null);
                setSelectedDocId(null);
              }}
              className="absolute top-2 right-3 z-50 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Close
            </button>
            <PdfEditor
              url={selectedPdfUrl}
              docId={selectedDocId}
              userId={user?.id}
              onPdfSigned={handlePdfSigned}
            />
          </div>
        </div>
      )}

      {/* Confirm Permanent Delete Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[999999] bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg p-6 w-[320px]">
            <h2 className="text-lg font-semibold mb-4">
              Confirm Permanent Delete
            </h2>
            <p className="text-sm mb-4">
              Do you really want to permanently delete this file?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handlePermanentDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
