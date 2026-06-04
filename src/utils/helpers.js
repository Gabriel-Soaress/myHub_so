// Funções utilitárias

/**
 * Gera um UUID v4 simples
 */
export function generateId() {
  return crypto.randomUUID?.() ?? 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
}

/**
 * Hash SHA-256 de uma string
 */
export async function hashPassword(password) {
  if (!crypto || !crypto.subtle) {
    // Fallback inseguro caso o usuário acesse por HTTP local onde crypto.subtle é null
    return btoa(password).split('').reverse().join('');
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Formata bytes para leitura humana
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Formata data para exibição
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Formata data curta
 */
export function formatDateShort(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Extrai extensão do nome de arquivo
 */
export function getFileExtension(filename) {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Retorna o tipo MIME com base na extensão
 */
export function getMimeType(filename) {
  const ext = getFileExtension(filename);
  const mimeMap = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    txt: 'text/plain',
    csv: 'text/csv',
    js: 'text/javascript',
    ts: 'text/typescript',
    jsx: 'text/javascript',
    tsx: 'text/typescript',
    html: 'text/html',
    css: 'text/css',
    cpp: 'text/x-c++src',
    c: 'text/x-csrc',
    py: 'text/x-python',
    java: 'text/x-java',
    json: 'application/json',
    md: 'text/markdown',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

/**
 * Converte File para base64 data URL
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Converte base64 data URL para Blob
 */
export function base64ToBlob(dataUrl) {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
  const byteString = atob(parts[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mime });
}

/**
 * Debounce simples
 */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function detectContentType(mimeType) {
  if (mimeType?.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') return 'docx';
  if (mimeType === 'application/vnd.ms-excel' || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimeType === 'text/csv') return 'spreadsheet';
  
  if (
    mimeType?.startsWith('text/') || 
    mimeType === 'application/json' || 
    mimeType === 'text/javascript' || 
    mimeType === 'text/typescript' || 
    mimeType === 'text/x-c++src' || 
    mimeType === 'text/x-csrc' || 
    mimeType === 'text/x-python' || 
    mimeType === 'text/x-java'
  ) {
    if (mimeType !== 'text/csv') return 'code';
  }
  return 'download';
}
