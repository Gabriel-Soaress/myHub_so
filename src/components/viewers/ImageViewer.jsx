import { useState, useEffect } from 'react';
import { Loader, ImageOff } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { getFile } from '../../services/storageService';
import './Viewers.css';

function ImageViewer({ nodeId, name }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!nodeId) return;
    setLoading(true);
    setError(false);

    try {
      const data = getFile(nodeId);
      if (data) {
        setImageSrc(data);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [nodeId]);

  if (loading) {
    return (
      <div className="image-viewer__loading">
        <Loader size={32} className="image-viewer__spinner" />
        <p>Carregando imagem...</p>
      </div>
    );
  }

  if (error || !imageSrc) {
    return (
      <div className="image-viewer__error">
        <ImageOff size={40} />
        <h3>Imagem não encontrada</h3>
        <p>Não foi possível carregar esta imagem.</p>
      </div>
    );
  }

  return (
    <div className="image-viewer">
      <div className="image-viewer__container">
        <img
          src={imageSrc}
          alt={name || 'Imagem'}
          className="image-viewer__img"
          onClick={() => setLightboxOpen(true)}
          title="Clique para ampliar"
        />
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={[{ src: imageSrc, alt: name || 'Imagem' }]}
      />
    </div>
  );
}

export default ImageViewer;
