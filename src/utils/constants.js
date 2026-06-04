// Constantes do sistema
export const APP_NAME = 'myHubSo';
export const STUDENT_NAME = 'Gabriel';
export const COURSE_NAME = 'Engenharia de Software';
export const INSTITUTION_NAME = 'Universidade';

export const STORAGE_KEYS = {
  TREE: 'portfolio-tree',
  AUTH: 'portfolio-auth',
  SEEDED: 'portfolio-seeded',
  FILES: 'portfolio-files',
};

// Senha admin — hash SHA-256 de "admin123"
// Para mudar a senha, gere o hash em: https://emn178.github.io/online-tools/sha256.html
export const ADMIN_PASSWORD_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

export const CONTENT_TYPES = {
  FOLDER: 'folder',
  RICHTEXT: 'richtext',
  PDF: 'pdf',
  IMAGE: 'image',
  SPREADSHEET: 'spreadsheet',
  GALLERY: 'gallery',
  DOWNLOAD: 'download',
  CODE: 'code',
};

export const FILE_ICONS = {
  folder: 'Folder',
  richtext: 'FileText',
  pdf: 'FileText',
  image: 'Image',
  spreadsheet: 'Table',
  gallery: 'Images',
  download: 'FileDown',
  code: 'FileCode',
};

export const ACCEPTED_FILE_TYPES = {
  pdf: '.pdf',
  image: '.jpg,.jpeg,.png,.gif,.webp,.svg',
  spreadsheet: '.xls,.xlsx,.csv',
  download: '.doc,.docx,.ppt,.pptx,.zip,.rar,.txt',
  code: '.js,.jsx,.ts,.tsx,.html,.css,.cpp,.c,.py,.java,.json,.md',
};

export const FOLDER_COLORS = [
  { name: 'Índigo', value: '#4f46e5' },
  { name: 'Violeta', value: '#7c3aed' },
  { name: 'Azul', value: '#2563eb' },
  { name: 'Esmeralda', value: '#059669' },
  { name: 'Âmbar', value: '#d97706' },
  { name: 'Rosa', value: '#db2777' },
  { name: 'Cinza', value: '#64748b' },
  { name: 'Amarelo', value: '#eab308' },
  { name: 'Preto', value: '#0f172a' },
  { name: 'Vermelho', value: '#ef4444' },
];
