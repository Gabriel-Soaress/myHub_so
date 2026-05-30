import { useState, useEffect, useRef } from 'react';
import { renderAsync } from 'docx-preview';
import { Loader, AlertCircle, Download } from 'lucide-react';
import { getFile } from '../../services/storageService';
import { base64ToBlob } from '../../utils/helpers';
import './Viewers.css';

function DocxViewer({ nodeId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!nodeId || !containerRef.current) return;
    
    let isMounted = true;
    
    const renderDoc = async () => {
      setLoading(true);
      setError(false);
      try {
        const data = getFile(nodeId);
        if (data) {
          const blob = base64ToBlob(data);
          if (isMounted && containerRef.current) {
            await renderAsync(blob, containerRef.current, null, {
              inWrapper: true,
              ignoreWidth: false,
              ignoreHeight: true,
              useBase64URL: true,
            });
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Falha ao renderizar DOCX', err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    renderDoc();

    return () => {
      isMounted = false;
    };
  }, [nodeId]);

  return (
    <div className="docx-viewer" style={{ position: 'relative', minHeight: '300px', backgroundColor: '#fff', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      {loading && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.8)', zIndex: 10 }}>
          <Loader size={32} className="pdf-viewer__spinner" />
          <p style={{ marginTop: '1rem', color: 'var(--gray-600)' }}>Processando documento Word...</p>
        </div>
      )}
      
      {error && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <AlertCircle size={40} color="var(--danger-500)" />
          <h3 style={{ marginTop: '1rem' }}>Erro ao ler DOCX</h3>
          <p style={{ color: 'var(--gray-500)' }}>O arquivo não é compatível ou está corrompido.</p>
        </div>
      )}
      
      <div ref={containerRef} style={{ width: '100%', minHeight: '100%' }} />
    </div>
  );
}

export default DocxViewer;
