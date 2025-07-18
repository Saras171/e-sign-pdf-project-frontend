import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import download from "downloadjs";

import { uploadFinalizedPdf } from "./api";

/**
 * Converts a hex color (e.g. #000000) to RGB [0–1] format for use in pdf-lib
 * @param {string} hex - Hexadecimal color string
 * @returns {number[]} - RGB array with normalized values
 */
function hexToRgb(hex) {
  const stripped = hex.replace("#", "");
  const bigint = parseInt(stripped, 16);
  return [
    ((bigint >> 16) & 255) / 255,
    ((bigint >> 8) & 255) / 255,
    (bigint & 255) / 255,
  ];
}

// Font cache to avoid redundant fetches
const fontCache = {};

/**
 * Loads and caches font file bytes from the local `/fonts/` directory
 * Prevents redundant fetches by caching fonts in memory
 * @param {string} fontName - Font name (e.g. "Pacifico")
 * @returns {Promise<ArrayBuffer>} - Font binary data
 * @throws {Error} - If the font file fails to load or is invalid
 */
async function loadFontBytes(fontName) {
  if (fontCache[fontName]) return fontCache[fontName];

  const fileName = fontName.replace(/\s+/g, "") + ".ttf";
  const fontUrl = `${window.location.origin}/fonts/${fileName}`;

  const res = await fetch(fontUrl);
  if (!res.ok || res.status >= 400) {
    throw new Error(`⚠️ Could not fetch font "${fontName}" from ${fontUrl}`);
  }

  const buffer = await res.arrayBuffer();
  if (!buffer.byteLength || buffer.byteLength < 100) {
    throw new Error(`⚠️ Font "${fontName}" seems corrupted or incomplete.`);
  }

  fontCache[fontName] = buffer;
  return buffer;
}

/**
 * Finalizes a signed PDF by embedding typed or image signatures and either:
 * - previews the result in-browser
 * - downloads the signed file locally
 * - uploads the finalized PDF to Supabase for persistent storage
 *
 * @param {Object} options
 * @param {string} options.url - Public URL to the original PDF
 * @param {string} options.docId - Unique document ID (used for saving metadata)
 * @param {Array} options.signatures - Array of signature objects (typed or image)
 * @param {boolean} [options.previewOnly=false] - If true, skip download/upload and preview in a new tab
 * @param {boolean} [options.returnBlob=false] - If true and previewOnly, return a Blob instead of opening a new tab
 * @returns {Promise<Object>} - File name and/or preview blob or URL depending on flags
 */
export async function downloadSignedPdf({
  url,
  docId,
  signatures,
  previewOnly = false,
  returnBlob = false,
}) {
  try {
    // Load the original PDF as byte stream
    const pdfBytes = await fetch(url).then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.status}`);
      return res.arrayBuffer();
    });

    // Parse PDF and enable custom fonts
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    pdfDoc.registerFontkit(fontkit);
    // Identify unique fonts used across all typed signatures
    const usedFonts = [
      ...new Set(
        signatures
          .filter((s) => s.type === "typed")
          .map((s) => s.font || "Pacifico")
      ),
    ];

    const fontMap = {};

    // Embed all fonts and fallback to Helvetica if a custom font fails
    for (const fontName of usedFonts) {
      try {
        const fontBytes = await loadFontBytes(fontName);
        const embeddedFont = await pdfDoc.embedFont(fontBytes);
        fontMap[fontName] = embeddedFont;
      } catch (err) {
        console.warn(
          `❌ Failed to load font "${fontName}", falling back to Helvetica`,
          err
        );
        fontMap[fontName] = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }
    }

    // Iterate through all signature layers and embed them into the document
    for (const sign of signatures) {
      try {
        const pageIndex = Math.max(0, (sign.page_number || 1) - 1);
        const page = pdfDoc.getPage(pageIndex);
        const { height: pageHeight } = page.getSize();

        const x = typeof sign.x === "number" ? sign.x : 0;
        const yRaw = typeof sign.y === "number" ? sign.y : 0;
        const width = typeof sign.width === "number" ? sign.width : 160;
        const height = typeof sign.height === "number" ? sign.height : 64;
        const y = pageHeight - yRaw - height;

        // If typed signature: render using chosen font
        if (sign.type === "typed" && sign.name?.trim()) {
          const fontName = sign.font || "Pacifico";
          const color = sign.color
            ? rgb(...hexToRgb(sign.color))
            : rgb(0, 0, 0);
          const font = fontMap[fontName];

          page.drawText(sign.name, {
            x,
            y,
            size: 18,
            font,
            color,
            maxWidth: width,
          });
          // If image signature: embed PNG or JPG into the page
        } else if (sign.signature_url) {
          try {
            const imageBytes = await fetch(sign.signature_url).then((res) =>
              res.arrayBuffer()
            );
            const ext = sign.signature_url.split(".").pop().toLowerCase();
            const image =
              ext === "jpg" || ext === "jpeg"
                ? await pdfDoc.embedJpg(imageBytes)
                : await pdfDoc.embedPng(imageBytes);

            page.drawImage(image, {
              x,
              y,
              width,
              height,
            });
          } catch (err) {
            console.warn(
              `⚠️ Failed to embed image sign: ${sign.signature_url}`,
              err
            );
          }
        }
      } catch (err) {
        console.error("⚠️ Error embedding a signature:", err);
      }
    }
    // Export modified PDF as bytes
    const finalPdfBytes = await pdfDoc.save();

    if (previewOnly && returnBlob) {
      const blob = new Blob([finalPdfBytes], { type: "application/pdf" });
      return { previewBlob: blob };
    } else if (previewOnly) {
      const blob = new Blob([finalPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      return { fileName: null, previewUrl: url };
    } else {
      // Upload to Supabase and save metadata
      try {
        const result = await uploadFinalizedPdf(finalPdfBytes, docId); // <--- uploads to backend

        const fileName = result?.fileName || `signed-${Date.now()}.pdf`;
        download(finalPdfBytes, fileName, "application/pdf");
        return { fileName };
      } catch (uploadErr) {
        console.error("❌ Upload to Supabase failed:", uploadErr);
        alert("Signed PDF downloaded, but failed to store in Supabase");
        download(finalPdfBytes, `signed-${Date.now()}.pdf`, "application/pdf");
        return { fileName: null };
      }
    }
  } catch (err) {
    console.error("❌ [downloadSignedPdf] error:", err);
    alert(`Failed to finalize PDF: ${err.message}`);
    throw err;
  }
}
