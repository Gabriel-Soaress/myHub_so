import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Loader, AlertCircle } from 'lucide-react';
import { getFile } from '../../services/storageService';
import { base64ToBlob } from '../../utils/helpers';
import './Viewers.css';

function SpreadsheetViewer({ nodeId }) {
  const [data, setData] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!nodeId) return;

    const loadSpreadsheet = async () => {
      setLoading(true);
      setError(false);
      try {
        const fileData = await getFile(nodeId);
        if (fileData) {
          const blob = base64ToBlob(fileData);
          const arrayBuffer = await blob.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });

          const sheetNames = workbook.SheetNames;
          const parsedSheets = sheetNames.map(name => {
            const worksheet = workbook.Sheets[name];
            // Get data as an array of arrays
            return {
              name,
              data: XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })
            };
          });

          setSheets(parsedSheets);
          if (parsedSheets.length > 0) {
            setData(parsedSheets[0].data);
            setActiveSheet(0);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Falha ao renderizar planilha', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadSpreadsheet();
  }, [nodeId]);

  if (loading) {
    return (
      <div className="spreadsheet-viewer" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size={32} className="pdf-viewer__spinner" />
        <p style={{ marginTop: '1rem', color: 'var(--gray-600)' }}>Processando planilha...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="spreadsheet-viewer" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <AlertCircle size={40} color="var(--danger-500)" />
        <h3 style={{ marginTop: '1rem' }}>Erro ao ler Planilha</h3>
        <p style={{ color: 'var(--gray-500)' }}>O arquivo não é compatível ou está corrompido.</p>
      </div>
    );
  }

  return (
    <div className="spreadsheet-viewer" style={{ width: '100%', backgroundColor: '#fff', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      {sheets.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', overflowX: 'auto' }}>
          {sheets.map((sheet, idx) => (
            <button
              key={sheet.name}
              onClick={() => {
                setActiveSheet(idx);
                setData(sheet.data);
              }}
              style={{
                padding: '0.4rem 0.8rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: activeSheet === idx ? 'var(--primary-600)' : 'transparent',
                color: activeSheet === idx ? 'white' : 'var(--text-secondary)',
                fontWeight: activeSheet === idx ? '600' : 'normal',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {sheet.name}
            </button>
          ))}
        </div>
      )}

      <div style={{ width: '100%', overflowX: 'auto', maxHeight: '70vh' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '600px' }}>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td 
                    key={cellIndex} 
                    style={{ 
                      padding: '0.5rem', 
                      border: '1px solid var(--border-color)', 
                      backgroundColor: rowIndex === 0 ? 'var(--bg-secondary)' : 'transparent',
                      fontWeight: rowIndex === 0 ? '600' : 'normal',
                      whiteSpace: 'nowrap',
                      maxWidth: '300px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={cell}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SpreadsheetViewer;
