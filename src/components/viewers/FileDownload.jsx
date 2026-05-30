import { FileDown, HardDrive } from 'lucide-react';
import { getFile } from '../../services/storageService';
import { base64ToBlob, formatFileSize } from '../../utils/helpers';
import './Viewers.css';

function FileDownload({ nodeId, node }) {
  const handleDownload = async () => {
    if (!nodeId) return;

    const data = await getFile(nodeId);
    if (!data) return;

    const blob = base64ToBlob(data);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = node?.content?.originalName || node?.name || 'arquivo';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fileName = node?.content?.originalName || node?.name || 'Arquivo';
  const fileSize = node?.content?.size ? formatFileSize(node.content.size) : null;
  const fileType = node?.content?.mimeType || 'Arquivo';

  return (
    <div className="file-download">
      <div className="file-download__card">
        <div className="file-download__icon">
          <HardDrive size={40} />
        </div>

        <div className="file-download__info">
          <h3 className="file-download__name">{fileName}</h3>
          <div className="file-download__meta">
            {fileType && (
              <span className="file-download__type">{fileType}</span>
            )}
            {fileSize && (
              <span className="file-download__size">{fileSize}</span>
            )}
          </div>
        </div>

        {!node?.metadata?.downloadBlocked ? (
          <button
            type="button"
            className="file-download__btn"
            onClick={handleDownload}
          >
            <FileDown size={18} />
            Baixar Arquivo
          </button>
        ) : (
          <div style={{ marginTop: '1.5rem', color: 'var(--gray-500)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
            <FileDown size={18} /> Download Bloqueado
          </div>
        )}
      </div>
    </div>
  );
}

export default FileDownload;
