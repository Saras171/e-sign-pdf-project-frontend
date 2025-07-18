'use client';

import { useEffect, useRef, useState } from 'react';
import interact from 'interactjs';
import { Pencil, Trash2, Lock, Unlock } from 'lucide-react';
import Image from 'next/image';

import { updateSignature } from "@/utils/api";

/**
 * DraggableSignature Component
 * Displays a movable and resizable signature element on a PDF page.
 * Supports typed and image-based signatures with lock, edit, and delete controls.
 */
export default function DraggableSignature({
  id,
  imageUrl = null,
  initialX = 100,
  initialY = 100,
  width = 160,
  height = 64,
  pageRef = null,
  onDelete,
  onEdit,
  onUpdatePosition,
  type = 'upload',
  font = 'cursive',
  name = '',
  color = '#000000',
  page_number = 1,
}) {
  const dragRef = useRef(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const target = dragRef.current;
    if (!target || locked) return;

    // Initialize interact.js for drag & resize
    interact(target)
      .draggable({
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: pageRef || 'parent',
            endOnly: true,
          }),
        ],
        listeners: {
          move(event) {
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
          },
          end() {
            const x = parseFloat(target.getAttribute('data-x')) || 0;
            const y = parseFloat(target.getAttribute('data-y')) || 0;
            onUpdatePosition?.(id, x, y);
          },
        },
      })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
          move(event) {
            const { width, height } = event.rect;
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.deltaRect.left;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.deltaRect.top;
            target.style.width = `${width}px`;
            target.style.height = `${height}px`;
            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
            onUpdatePosition?.(id, x, y, width, height);
          },
        },
        modifiers: [
          interact.modifiers.restrictSize({
            min: { width: 120, height: 40 },
            max: { width: 600, height: 300 },
          }),
        ],
      });

    return () => {
       // Clean up interact.js instance on unmount
      interact(target).unset();
    };
  }, [pageRef, id, onUpdatePosition, locked]);

  // Toggle lock/unlock state for this signature
const toggleLock = async () => {
  const newLocked = !locked;
  setLocked(newLocked);

  try {
     // Save updated lock status to backend
    await updateSignature(id, { locked: newLocked });
  } catch (err) {
    console.error("Failed to update lock state:", err);
  }
};

  return (
    <div
      ref={dragRef}
      className={`absolute border ${locked ? 'border-gray-400' : 'border-blue-400'} shadow-md rounded-md bg-white overflow-visible group flex items-center justify-center`}
      style={{
        width,
        height,
        top: 0,
left: 0,
        transform: `translate(${initialX}px, ${initialY}px)`,
        touchAction: 'none',
        pointerEvents: 'auto',
        zIndex: 9999,
      }}
      data-x={initialX}
      data-y={initialY}
      draggable={false}
    >
       {/* Render typed signature */}
      {type === 'typed' && name?.trim() ? (
        <div
          className="text-center text-xl w-full h-full flex items-center justify-center"
          style={{ fontFamily: font, color: color, fontWeight: 500, whiteSpace: 'nowrap' }}
        >
          {name}
        </div>
      ) : imageUrl ? (
        <Image
          src={imageUrl}
          alt="Signature"
          width={width}
          height={height}
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />
      ) : (
                // Placeholder if no signature is provided
        <div className="text-gray-400 text-sm">No Signature</div>
      )}

    
      {/* Hover controls for lock, edit, delete */}
      <div className="absolute top-1 right-1 flex gap-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={toggleLock}
          className={`p-1 rounded-full shadow border ${locked ? 'bg-gray-300 border-gray-500' : 'bg-green-300 border-green-600'}`}
          title={locked ? 'Unlock Signature' : 'Lock Signature'}
        >
          {locked ? <Unlock size={14} /> : <Lock size={14} />}
        </button>
        <button
          onClick={() => onEdit?.({ id, signature_url: imageUrl, type, font, name, color, width, height, page_number, x: initialX, y: initialY })}
          className="bg-yellow-300 hover:bg-yellow-400 p-1 rounded-full shadow border border-yellow-600"
          title="Edit"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete?.(id)}
          className="bg-red-500 hover:bg-red-600 p-1 rounded-full shadow text-white border border-red-700"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}




