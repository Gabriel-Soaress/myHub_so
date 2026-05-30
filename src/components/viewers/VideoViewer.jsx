import { Download } from 'lucide-react';
import Button from '../ui/Button';

function VideoViewer({ nodeId, name, fileData }) {
  if (!fileData) {
    return (
      <div className="viewer-placeholder">
        Não foi possível carregar o vídeo.
      </div>
    );
  }

  return (
    <div className="viewer-video" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
      <video 
        controls 
        playsInline
        preload="metadata"
        src={fileData} 
        style={{ 
          maxWidth: '100%', 
          maxHeight: '70vh', 
          borderRadius: 'var(--radius-md)', 
          boxShadow: 'var(--shadow-md)',
          backgroundColor: 'var(--bg-tertiary)'
        }}
      >
        Seu navegador não suporta a tag de vídeo.
      </video>
    </div>
  );
}

export default VideoViewer;
