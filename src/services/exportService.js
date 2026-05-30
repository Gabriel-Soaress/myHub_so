import { zipSync, strToU8 } from 'fflate';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import HTMLtoDOCX from 'html-to-docx';
import { getFile, getChildren } from './storageService';
import { CONTENT_TYPES } from '../utils/constants';

/**
 * Coleta recursivamente arquivos de uma pasta para montagem do ZIP
 * @param {string} folderId 
 * @param {string} currentPath 
 * @param {object} zipData 
 */
async function collectFilesRecursive(folderId, currentPath, zipData) {
  const children = getChildren(folderId);
  
  for (const child of children) {
    if (child.metadata?.downloadBlocked) continue;

    const path = currentPath ? `${currentPath}/${child.name}` : child.name;

    if (child.type === 'folder') {
      await collectFilesRecursive(child.id, path, zipData);
    } else {
      if (child.content?.type === CONTENT_TYPES.RICHTEXT) {
        // Texto rico exportado como HTML
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>${child.name}</title>
            <style>body { font-family: sans-serif; padding: 20px; }</style>
          </head>
          <body>
            <h1>${child.name}</h1>
            ${child.content.body}
          </body>
          </html>
        `;
        zipData[`${path}.html`] = strToU8(htmlContent);
      } 
      else if (child.content?.type === CONTENT_TYPES.CODE) {
        // Código exportado com sua extensão original (salvo no metadata ou padrão .txt)
        const ext = child.metadata?.extension || '.txt';
        zipData[`${path}${ext}`] = strToU8(child.content.body);
      }
      else {
        // Arquivo binário (PDF, Imagem, Download)
        const base64 = getFile(child.id);
        if (base64) {
          const parts = base64.split(',');
          if (parts.length > 1) {
            const byteString = atob(parts[1]);
            const u8 = new Uint8Array(byteString.length);
            for (let i = 0; i < byteString.length; i++) {
              u8[i] = byteString.charCodeAt(i);
            }
            // Extensão baseada no nome original (se tiver no metadata)
            const ext = child.metadata?.originalName ? '' : (child.content?.type === 'pdf' ? '.pdf' : '');
            const filename = child.metadata?.originalName ? path : `${path}${ext}`;
            zipData[filename] = u8;
          }
        }
      }
    }
  }
}

/**
 * Baixa uma pasta inteira como ZIP
 */
export async function downloadFolderAsZip(folderNode) {
  if (folderNode.metadata?.downloadBlocked) {
    alert('Download bloqueado pelo administrador.');
    return;
  }

  const zipData = {};
  await collectFilesRecursive(folderNode.id, folderNode.name, zipData);
  
  const zipped = zipSync(zipData);
  const blob = new Blob([zipped], { type: 'application/zip' });
  saveAs(blob, `${folderNode.name}.zip`);
}

/**
 * Exporta conteúdo HTML para PDF usando html2pdf.js
 */
export function exportHtmlToPdf(elementId, filename) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const opt = {
    margin:       10,
    filename:     `${filename}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}

/**
 * Exporta conteúdo HTML para arquivo .docx compatível com Word
 */
export async function exportHtmlToDocx(htmlContent, filename) {
  try {
    const sourceHTML = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${htmlContent}</body></html>`;
    const docData = await HTMLtoDOCX(sourceHTML, null, {
      margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
    });
    
    let finalBlob = docData;
    // html-to-docx under node-polyfills returns a Buffer or ArrayBuffer
    if (!(docData instanceof Blob)) {
      finalBlob = new Blob([docData], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    }
    
    saveAs(finalBlob, `${filename}.docx`);
  } catch (err) {
    console.error('Falha ao exportar DOCX:', err);
    alert('Erro ao exportar arquivo DOCX. ' + err.message);
  }
}
