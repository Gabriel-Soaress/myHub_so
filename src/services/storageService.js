import { STORAGE_KEYS } from '../utils/constants';
import { generateId } from '../utils/helpers';

/**
 * Serviço de persistência localStorage para a árvore de conteúdo
 */

let activeTenant = 'default';

export function setTenant(slug) {
  activeTenant = slug;
}

function getTreeKey() {
  return `portfolio-tree-${activeTenant}`;
}

function getFileKey(nodeId) {
  return `portfolio-files-${activeTenant}-${nodeId}`;
}

function getTree() {
  try {
    const data = localStorage.getItem(getTreeKey());
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTree(tree) {
  localStorage.setItem(getTreeKey(), JSON.stringify(tree));
}

/**
 * Retorna todos os nós
 */
export function getAllNodes() {
  return getTree();
}

/**
 * Busca nó por ID
 */
export function getNodeById(id) {
  const tree = getTree();
  return tree.find((node) => node.id === id) || null;
}

/**
 * Retorna filhos diretos de um nó (ou raiz se parentId = null)
 */
export function getChildren(parentId = null) {
  const tree = getTree();
  return tree
    .filter((node) => node.parentId === parentId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * Retorna caminho de ancestrais (para breadcrumb)
 */
export function getAncestors(id) {
  const tree = getTree();
  const ancestors = [];
  let current = tree.find((n) => n.id === id);
  
  while (current) {
    ancestors.unshift(current);
    current = current.parentId 
      ? tree.find((n) => n.id === current.parentId)
      : null;
  }
  
  return ancestors;
}

/**
 * Verifica se um nó está bloqueado por senha (ele ou qualquer ancestral)
 */
export function isNodeLockedCascading(id, isAuthenticated, unlockedNodes = []) {
  if (isAuthenticated) return false;
  
  const tree = getTree();
  let current = tree.find((n) => n.id === id);
  
  while (current) {
    if (current.metadata?.password && !unlockedNodes.includes(current.id)) {
      return { locked: true, lockedNode: current };
    }
    current = current.parentId 
      ? tree.find((n) => n.id === current.parentId)
      : null;
  }
  
  return { locked: false, lockedNode: null };
}

/**
 * Cria um novo nó
 */
export function createNode(nodeData) {
  const tree = getTree();
  const siblings = tree.filter((n) => n.parentId === (nodeData.parentId || null));
  
  const node = {
    id: generateId(),
    type: nodeData.type || 'folder',
    name: nodeData.name || 'Sem título',
    parentId: nodeData.parentId || null,
    order: siblings.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: nodeData.content || null,
    metadata: nodeData.metadata || {},
    ...nodeData,
    id: nodeData.id || generateId(),
  };
  
  tree.push(node);
  saveTree(tree);
  return node;
}

/**
 * Atualiza um nó existente
 */
export function updateNode(id, updates) {
  const tree = getTree();
  const index = tree.findIndex((n) => n.id === id);
  if (index === -1) return null;
  
  tree[index] = {
    ...tree[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveTree(tree);
  return tree[index];
}

/**
 * Remove um nó e todos os filhos recursivamente
 */
export function deleteNodeRecursive(id) {
  let tree = getTree();
  
  // Coleta IDs a remover (nó + descendentes)
  const idsToRemove = new Set();
  function collectIds(nodeId) {
    idsToRemove.add(nodeId);
    tree
      .filter((n) => n.parentId === nodeId)
      .forEach((child) => collectIds(child.id));
  }
  collectIds(id);
  
  // Remove arquivos associados do localStorage
  idsToRemove.forEach((nid) => {
    localStorage.removeItem(getFileKey(nid));
  });
  
  tree = tree.filter((n) => !idsToRemove.has(n.id));
  saveTree(tree);
  return true;
}

/**
 * Move nó para outro pai
 */
export function moveNode(id, newParentId) {
  return updateNode(id, { parentId: newParentId });
}

/**
 * Reordena filhos de um pai
 */
export function reorderNodes(parentId, orderedIds) {
  const tree = getTree();
  orderedIds.forEach((id, index) => {
    const node = tree.find((n) => n.id === id);
    if (node) node.order = index;
  });
  saveTree(tree);
}

/**
 * Busca nós por texto (nome ou descrição)
 */
export function searchNodes(query) {
  if (!query?.trim()) return [];
  const tree = getTree();
  const q = query.toLowerCase();
  return tree.filter(
    (n) =>
      n.name?.toLowerCase().includes(q) ||
      n.metadata?.description?.toLowerCase().includes(q)
  );
}

/**
 * Conta total de nós por tipo
 */
export function countByType() {
  const tree = getTree();
  return tree.reduce((acc, node) => {
    const type = node.type === 'folder' ? 'folders' : (node.content?.type || 'other');
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Salva arquivo (base64) associado a um nó
 */
export function saveFile(nodeId, base64Data) {
  localStorage.setItem(getFileKey(nodeId), base64Data);
}

/**
 * Recupera arquivo (base64) de um nó
 */
export function getFile(nodeId) {
  return localStorage.getItem(getFileKey(nodeId));
}

/**
 * Remove arquivo de um nó
 */
export function deleteFile(nodeId) {
  localStorage.removeItem(getFileKey(nodeId));
}

/**
 * Verifica se o seed já foi executado
 */
export function isSeeded() {
  return localStorage.getItem(`portfolio-seeded-${activeTenant}`) === 'true';
}

/**
 * Marca como seeded
 */
export function markSeeded() {
  localStorage.setItem(`portfolio-seeded-${activeTenant}`, 'true');
}
