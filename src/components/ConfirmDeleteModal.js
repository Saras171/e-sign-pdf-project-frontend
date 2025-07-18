// src/components/ConfirmDeleteModal.js
'use client';
import React from 'react';

/**
 * ConfirmDeleteModal Component
 * Displays a confirmation modal when a user attempts to delete a file.
 * 
 * Props:
 * - isOpen (boolean): Controls visibility of the modal.
 * - onConfirm (function): Called when the user confirms deletion.
 * - onCancel (function): Called when the user cancels the action.
 */
export default function ConfirmDeleteModal({ isOpen, onConfirm, onCancel }) {
  // Don't render the modal if not triggered
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-[99999] flex items-center justify-center">
      {/* Modal container */}
      <div className="bg-white p-6 rounded shadow-lg w-80 text-center">
        {/* Modal Title */}
        <h2 className="text-lg font-semibold mb-4">Permanently Delete?</h2>

        {/* Modal Message */}
        <p className="text-sm text-gray-600 mb-6">
          Do you really want to permanently delete this file?
        </p>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Yes, Delete
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
