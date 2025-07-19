import React, { useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.worker.min.js";

function CanvaConvater() {
  const canvasRef = useRef(null);
  const [code, setCode] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.type.split("/").pop().toLowerCase();

    if (["png", "jpeg", "jpg"].includes(extension)) {
      setPdfFile(null);
      convertImg(file);
    } else if (extension === "pdf") {
      setCode("");
      setPdfFile(file);
      renderPdfToCanvas(file);
    } else if (extension === "svg+xml") {
      setPdfFile(null);
      converSvg(file);
    } else if (extension === "fig") {
      setPdfFile(null);
      converFigma(file);
    } else {
      alert("Only PNG, JPEG, JPG, PDF, SVG, FIG files are supported.");
    }
  };

  function convertImg(file) {
    const img = new Image();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      generateCanvasJSObject(canvas);
    };

    img.src = URL.createObjectURL(file);
  }

  const converFigma = async (file) => {
    const filekey = prompt("Enter Figma File Key");
    const nodeId = prompt("Enter Node ID");

    const url = `https://api.figma.com/v1/images/${filekey}?ids=${nodeId}&format=svg`;
    const response = await fetch(url, {
      headers: { "X-Figma-Token": process.env.FIGMA_TOKEN }
    });

    const data = await response.json();
    const svgUrl = data.images[nodeId];
    if (svgUrl) {
      converSvg(svgUrl);
    } else {
      alert("Failed to fetch Figma image");
    }
  };

  function converSvg(file) {
    const reader = new FileReader();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    reader.onload = () => {
      const svgText = reader.result;
      const img = new Image();
      const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        generateCanvasJSObject(canvas);
      };

      img.onerror = (err) => {
        console.error("Error loading SVG image", err);
      };

      img.src = url;
    };

    reader.readAsText(file);
  }

  function generateCanvasJSObject(canvas) {
    const base64 = canvas.toDataURL("image/png");
    const canvasObject = {
      stageId: "canvasId",
      objects: [
        {
          type: "Bitmap",
          src: base64
        }
      ]
    };

    setCode(JSON.stringify(canvasObject, null, 2)); 
  }

  function generateCanvasJSObjectFromMultipleCanvases(canvases) {
    const canvasObject = {
      stageId: "canvasId",
      objects: canvases.map((canvas) => ({
        type: "Bitmap",
        src: canvas.toDataURL("image/png")
      }))
    };

    setCode(JSON.stringify(canvasObject, null, 2));
  }

  const renderPdfToCanvas = async (file) => {
    const fileReader = new FileReader();
    fileReader.onload = async function () {
      const typedArray = new Uint8Array(this.result);
      const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
      const newCanvasList = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });

        const tempCanvas = document.createElement("canvas");
        const context = tempCanvas.getContext("2d");

        tempCanvas.width = viewport.width;
        tempCanvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        newCanvasList.push(tempCanvas);
      }

      generateCanvasJSObjectFromMultipleCanvases(newCanvasList);
    };

    fileReader.readAsArrayBuffer(file);
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      alert("Canvas object copied to clipboard!");
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <h1 className="text-center text-3xl font-bold text-gray-800 mb-8">
        Canvas.js Converter
      </h1>

      <div className="mx-auto max-w-4xl bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <label
            htmlFor="fileUpload"
            className="block p-2 text-sm font-medium text-gray-700 mb-2"
          >
            Upload File (PNG, JPEG, JPG, PDF, SVG, FIG):
          </label>
          <input
            id="fileUpload"
            type="file"
            accept=".png, .jpeg, .jpg, .pdf, .svg, .fig"
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleFile}
          />
        </div>

        {pdfFile ? (
          <>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              PDF Preview
            </h2>
            <div className="border rounded-md overflow-hidden bg-white p-4 mb-6 max-h-[500px] overflow-y-auto">
              <Document
                file={pdfFile}
                onLoadSuccess={onDocumentLoadSuccess}
                loading="Loading PDF..."
              >
                {[...Array(numPages)].map((_, i) => (
                  <Page key={`page_${i + 1}`} pageNumber={i + 1} />
                ))}
              </Document>
            </div>
          </>
        ) : (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Canvas Preview
            </h2>
            <div className="border rounded bg-gray-100 p-2">
              <canvas ref={canvasRef} className="w-full h-auto" id="canvasId" />
            </div>
          </div>
        )}

        {code && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Canvas.js Object
            </h2>
            <textarea
              className="w-full h-60 border border-gray-300 rounded-md p-3 font-mono text-sm bg-gray-50 resize-none"
              value={code}
              readOnly
            />
            <button
              onClick={handleCopy}
              className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CanvaConvater;
