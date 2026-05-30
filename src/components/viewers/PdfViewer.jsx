import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Loader,
  AlertCircle,
} from 'lucide-react';
import { getFile } from '../../services/storageService';
import { base64ToBlob } from '../../utils/helpers';
import './Viewers.css';

// Configuração correta do worker para o Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function PdfViewer({ nodeId }) {
  const [fileData, setFileData] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!nodeId) return;
    setLoading(true);
    setError(false);

    try {
      const data = getFile(nodeId);
      if (data) {
        setFileData(data);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [nodeId]);

  const onDocumentLoadSuccess = ({ numPages: total }) => {
    setNumPages(total);
    setPageNumber(1);
  };

  const onDocumentLoadError = () => {
    setError(true);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleDownload = () => {
    if (!fileData) return;
    const blob = base64ToBlob(fileData);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'documento.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="pdf-viewer__loading">
        <Loader size={32} className="pdf-viewer__spinner" />
        <p>Carregando documento...</p>
      </div>
    );
  }

  if (error || !fileData) {
    return (
      <div className="pdf-viewer__error">
        <AlertCircle size={40} />
        <h3>Não foi possível carregar o PDF</h3>
        <p>O documento pode estar corrompido ou não foi encontrado.</p>
        {fileData && (
          <button
            type="button"
            className="pdf-viewer__download-btn"
            onClick={handleDownload}
          >
            <Download size={16} />
            Baixar PDF
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-viewer__toolbar">
        <div className="pdf-viewer__nav">
          <button
            type="button"
            className="pdf-viewer__toolbar-btn"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            title="Página anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="pdf-viewer__page-info">
            {pageNumber} / {numPages || '—'}
          </span>
          <button
            type="button"
            className="pdf-viewer__toolbar-btn"
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 1)}
            title="Próxima página"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="pdf-viewer__zoom">
          <button
            type="button"
            className="pdf-viewer__toolbar-btn"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            title="Reduzir zoom"
          >
            <ZoomOut size={18} />
          </button>
          <span className="pdf-viewer__zoom-level">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            className="pdf-viewer__toolbar-btn"
            onClick={zoomIn}
            disabled={scale >= 3}
            title="Aumentar zoom"
          >
            <ZoomIn size={18} />
          </button>
        </div>

        <button
          type="button"
          className="pdf-viewer__toolbar-btn"
          onClick={handleDownload}
          title="Baixar PDF"
        >
          <Download size={18} />
        </button>
      </div>

      <div className="pdf-viewer__document">
        <Document
          file={fileData}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="pdf-viewer__loading">
              <Loader size={24} className="pdf-viewer__spinner" />
              <p>Carregando...</p>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            loading={
              <div className="pdf-viewer__loading">
                <Loader size={20} className="pdf-viewer__spinner" />
              </div>
            }
          />
        </Document>
      </div>
    </div>
  );
}

export default PdfViewer;
