import axios from "axios";

// Base API URL from environment variables
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Custom Axios instance with credentials enabled for cookie-based auth (JWT, session, etc.)
const axiosInstance = axios.create({
  baseURL: API_BASE, 
  withCredentials: true,  // Required to send/receive cookies (e.g., JWT tokens)
});

// ==================== AUTH APIs ====================

/**
 * Signup API
 * Registers a new user
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {Object} user data
 */
export async function signup(username, email, password) {
  try {
    const response = await axiosInstance.post("/auth/signup", {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Signup failed" };
  }
}

/**
 * Login API
 * Authenticates user and sets cookie
 * @param {string} email
 * @param {string} password
 * @returns {Object} user data
 */
export async function login(email, password) {
  try {
    const response = await axiosInstance.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
}

/**
 * Logout API
 * Clears user session cookie
 * @returns {Object} success message
 */
export async function logout() {
  try {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Logout failed" };
  }
}

/**
 * Fetch Current User
 * Retrieves the authenticated user's info from /user/me
 * @returns {Object} user data
 */
export async function getCurrentUser() {
  try {
    const response = await axiosInstance.get("/user/me");
    return response.data.user;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch user" };
  }
}

// ==================== DOCS APIs ====================

/**
 * Upload a PDF file to the server and Supabase storage
 * @param {File} file - The PDF file
 * @param {string} userId - Authenticated user's ID
 * @returns {Object} - Uploaded PDF metadata and public URL
 */
export async function uploadPDF(file, userId) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    const response = await axiosInstance.post("/docs/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "PDF upload failed" };
  }
}

/**
 * Retrieve all PDFs uploaded by a specific user
 * @param {string} userId - Authenticated user's ID
 * @returns {Array} - List of uploaded document objects
 * @throws {Object} - Error response from server
 */
export async function getUserDocuments(userId) {
  try {
    const res = await axiosInstance.get(`/docs/list?userId=${userId}`);
    return res.data.documents;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to fetch documents' };
  }
}

//=====Save a new signature=======

/**
 * Save a new signature entry (typed, drawn, or uploaded)
 * @param {Object} payload - Signature metadata
 * @returns {Object} - Saved signature object
 * @throws {Object} - Error response from server
 */
export async function saveSignature({
  documentId,
  x,
  y,
  page_number,
  signature_url = null,
  name = null,
  font = null,
  color = null,
  width = 160,
  height = 64,
  type = 'upload',
}) {
  try {
    const res = await axiosInstance.post('/signatures', {
      documentId,
      x,
      y,
      page_number,
      signature_url,
      name,
      font,
      color,
      width,
      height,
      type,
    });
    return res.data.signature;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to save signature' };
  }
}


/**
 * Fetch all signature objects associated with a document
 * @param {string} docId - Document ID
 * @returns {Array} - List of signature objects
 * @throws {Object} - Error response from server
 */
export async function getDocumentSignatures(docId) {
  try {
    const res = await axiosInstance.get(`/signatures/${docId}`);
    return res.data.signatures;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to fetch signatures' };
  }
}

/**
 * Upload a signature image file with additional metadata
 * Used for both drawn and uploaded signature images
 * @param {File} file - Signature image file
 * @param {Object} metadata - Associated signature data
 * @returns {Object} - Saved signature object
 */
export async function uploadSignatureImage(file, metadata) {
  const formData = new FormData();
   formData.append('file', file);

   
  // Append all required metadata for Supabase DB insertion
  
  formData.append('documentId', metadata.documentId);
  formData.append('x', metadata.x);
  formData.append('y', metadata.y);
  formData.append('page_number', metadata.page_number || 1);
  formData.append('width', metadata.width || 160);
  formData.append('height', metadata.height || 64);
  formData.append('font', metadata.font || '');
  formData.append('color', metadata.color || '');
  formData.append('name', metadata.name || '');
  formData.append('type', metadata.type || 'upload');

  const res = await axiosInstance.post('/signatures/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data.signature; // Now returns full saved record
}

/**
 * Update an existing signature (e.g., font, color, type, name)
 * @param {string} id - Signature ID
 * @param {Object} updates - Fields to update
 * @returns {Object} - Updated signature object
 * @throws {Object} - Error response from server
 */
export async function updateSignature(id, updates) {
  try {
    const res = await axiosInstance.put(`/signatures/${id}`, updates);
    return res.data.signature;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to update signature' };
  }
}

/**
 * Update position and dimensions of a signature
 * @param {string} id - Signature ID
 * @param {number} x - New X coordinate
 * @param {number} y - New Y coordinate
 * @param {number} width - New width
 * @param {number} height - New height
 * @returns {Object} - Updated signature object
 * @throws {Object} - Error response from server
 */
export async function updateSignaturePosition(id, x, y, width, height) {
  try {
    const res = await axiosInstance.put(`/signatures/${id}`, {
      x,
      y,
      width,
      height,
    });

    return res.data.signature;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to update signature position' };
  }
}

/**
 * Delete a signature by ID
 * @param {string} id - Signature ID
 * @returns {Object} - Success message
 * @throws {Object} - Error response from server
 */
export async function deleteSignature(id) {
  try {
    const res = await axiosInstance.delete(`/signatures/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to delete signature' };
  }
}

/**
 * Upload a finalized, signed PDF to server storage
 * @param {Uint8Array} finalPdfBytes - Byte array of final PDF
 * @param {string} docId - Document ID
 * @returns {Object} - Uploaded PDF metadata including file name
 * @throws {Error} - Upload or server error
 */
export async function uploadFinalizedPdf(finalPdfBytes, docId) {
  const fileName = `signed-${Date.now()}.pdf`;
  const formData = new FormData();
  formData.append('pdf', new Blob([finalPdfBytes], { type: 'application/pdf' }), fileName);
  formData.append('docId', docId);

  try {
    const res = await axiosInstance.post('/pdf/finalize', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return { ...res.data, fileName };
  } catch (err) {
    console.error('❌ Finalize API Error Response:', err?.response?.data || err);
    throw new Error(err?.response?.data?.details || err?.response?.data?.error || 'Failed to upload finalized PDF');
  }
}

/**
 * Soft-delete a document (moves to trash)
 * @param {string} id - Document ID
 * @returns {Object} - Success response
 * @throws {Object} - Error response from server
 */
export async function softDeleteDocument(id) {
  try {
    const res = await axiosInstance.put(`/docs/soft-delete/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Soft delete failed' };
  }
}


/**
 * Restore a previously soft-deleted document
 * @param {string} id - Document ID
 * @returns {Object} - Success response
 * @throws {Object} - Error response from server
 */
export async function restoreDocument(id) {
  try {
    const res = await axiosInstance.put(`/docs/restore/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Restore failed' };
  }
}

/**
 * Permanently delete a document from storage and database
 * @param {string} id - Document ID
 * @returns {Object} - Success response
 * @throws {Object} - Error response from server
 */
export async function permanentlyDeleteDocument(id) {
  try {
    const res = await axiosInstance.delete(`/docs/permanent-delete/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Permanent delete failed' };
  }
}
