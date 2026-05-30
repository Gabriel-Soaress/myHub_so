import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy } from 'lucide-react';
import useUIStore from '../../store/useUIStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

function ShareModal() {
  const closeModal = useUIStore((s) => s.closeModal);
  const modalData = useUIStore((s) => s.modalData);
  const [copied, setCopied] = useState(false);

  // modalData can optionally pass the path, otherwise we use the current window location
  const shareUrl = modalData?.url || window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Modal isOpen={true} onClose={closeModal} title="Compartilhar Link" size="sm">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '1rem 0' }}>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          Escaneie o QR Code abaixo ou copie o link para compartilhar este portfólio.
        </p>

        <div style={{ padding: '1rem', background: 'white', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
          <QRCodeSVG value={shareUrl} size={180} />
        </div>

        <div style={{ width: '100%', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input 
            type="text" 
            readOnly 
            value={shareUrl} 
            className="admin-form__input" 
            style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
          />
          <Button variant={copied ? "primary" : "secondary"} icon={copied ? Check : Copy} onClick={handleCopy}>
            {copied ? "Copiado!" : "Copiar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ShareModal;
