import CodeEditor from '@uiw/react-textarea-code-editor';
import { getFile, updateNode, saveFile } from '../../services/storageService';
import { useState, useEffect } from 'react';
import useUIStore from '../../store/useUIStore';
import useAuthStore from '../../store/useAuthStore';
import Button from '../ui/Button';
import { Save } from 'lucide-react';

function CodeViewer({ nodeId, node }) {
  const [code, setCode] = useState('');
  const [originalCode, setOriginalCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const refreshKey = useUIStore(s => s.refreshKey);
  const triggerRefresh = useUIStore(s => s.triggerRefresh);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  useEffect(() => {
    // Para conteúdo criado via UI
    if (node.content?.body) {
      setCode(node.content.body);
      setOriginalCode(node.content.body);
    } else {
      // Para arquivo salvo (ex: upload)
      const base64 = getFile(nodeId);
      if (base64) {
        const parts = base64.split(',');
        if (parts.length > 1) {
          try {
            // Decodifica base64 (lidando com unicode corretamente)
            const binary = atob(parts[1]);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            const decoder = new TextDecoder('utf-8');
            const decoded = decoder.decode(bytes);
            setCode(decoded);
            setOriginalCode(decoded);
          } catch (e) {
            console.error('Falha ao decodificar código base64', e);
            setCode('Erro ao ler arquivo.');
            setOriginalCode('Erro ao ler arquivo.');
          }
        }
      }
    }
  }, [nodeId, node, refreshKey]);

  // Infer language from extension or metadata
  let language = 'javascript';
  const ext = node.metadata?.extension || node.metadata?.originalName?.split('.').pop() || '';
  if (ext.match(/^(js|jsx)$/i)) language = 'jsx';
  if (ext.match(/^(ts|tsx)$/i)) language = 'tsx';
  if (ext.match(/^(html|htm)$/i)) language = 'html';
  if (ext.match(/^(css|scss|sass)$/i)) language = 'css';
  if (ext.match(/^(cpp|c|cc)$/i)) language = 'cpp';
  if (ext.match(/^(py)$/i)) language = 'python';
  if (ext.match(/^(java)$/i)) language = 'java';
  if (ext.match(/^(json)$/i)) language = 'json';

  const hasChanges = code !== originalCode;

  const handleSave = async () => {
    if (!isAuthenticated) return;
    setIsSaving(true);
    
    if (node.content?.type === 'code') {
      // Atualiza body diretamente
      updateNode(nodeId, {
        content: {
          ...node.content,
          body: code,
        }
      });
    } else {
      // Atualiza base64 para arquivos de código
      const encoder = new TextEncoder();
      const bytes = encoder.encode(code);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const newBase64 = btoa(binary);
      // Mantemos o mimetype original ou derivamos um
      const mime = node.content?.type || 'text/plain';
      const dataUrl = `data:${mime};base64,${newBase64}`;
      saveFile(nodeId, dataUrl);
      
      // Update fileSize
      updateNode(nodeId, {
        metadata: {
          ...node.metadata,
          fileSize: bytes.byteLength + ' B', // simple format for now
        }
      });
    }
    
    setOriginalCode(code);
    setIsSaving(false);
    triggerRefresh();
  };

  return (
    <div className="viewer-code">
      {isAuthenticated && hasChanges && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <Button variant="primary" size="sm" icon={Save} onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      )}
      <CodeEditor
        value={code}
        language={language}
        placeholder="Nenhum código disponível."
        disabled={!isAuthenticated}
        onChange={(evn) => setCode(evn.target.value)}
        padding={15}
        style={{
          fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
          fontSize: 14,
          borderRadius: 'var(--radius-md)',
          minHeight: '200px',
        }}
      />
    </div>
  );
}

export default CodeViewer;
