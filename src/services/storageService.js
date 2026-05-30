import { generateId } from '../utils/helpers';

/**
 * Serviço de persistência remoto (API Vercel + Neon) com cache em memória
 */

let activeTenant = 'default';
let memoryTree = [];

export function setTenant(slug) {
  activeTenant = slug;
}

/**
 * Carrega a árvore do backend e armazena em memória
 */
export async function fetchTree(tenant) {
  try {
    const res = await fetch(`/api/nodes?tenant=${tenant}`);
    if (res.ok) {
      memoryTree = await res.json();
    } else {
      memoryTree = [];
    }
  } catch (err) {
    console.error('Failed to fetch tree', err);
    memoryTree = [];
  }
}

function getTree() {
  return Array.isArray(memoryTree) ? memoryTree : [];
}

export function getAllNodes() {
  return getTree();
}

export function getNodeById(id) {
  const tree = getTree();
  return tree.find((node) => node.id === id) || null;
}

export function getChildren(parentId = null) {
  const tree = getTree();
  return tree
    .filter((node) => node.parentId === parentId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

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

export function isNodeLockedCascading(id, isAuthenticated, unlockedNodes = []) {
  if (isAuthenticated) return { locked: false, lockedNode: null };
  
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

export async function createNode(nodeData) {
  const siblings = memoryTree.filter((n) => n.parentId === (nodeData.parentId || null));
  
  const node = {
    id: nodeData.id || generateId(),
    type: nodeData.type || 'folder',
    name: nodeData.name || 'Sem título',
    parentId: nodeData.parentId || null,
    order: siblings.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: nodeData.content || null,
    metadata: nodeData.metadata || {},
  };
  
  // Optimistic UI
  memoryTree.push(node);
  
  try {
    await fetch(`/api/nodes?tenant=${activeTenant}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(node)
    });
  } catch (err) {
    console.error('Failed to create node in DB', err);
  }
  
  return node;
}

export async function updateNode(id, updates) {
  const index = memoryTree.findIndex((n) => n.id === id);
  if (index === -1) return null;
  
  memoryTree[index] = {
    ...memoryTree[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  try {
    await fetch(`/api/node?id=${id}&tenant=${activeTenant}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  } catch (err) {
    console.error('Failed to update node in DB', err);
  }
  
  return memoryTree[index];
}

export async function deleteNodeRecursive(id) {
  // Coleta IDs a remover (nó + descendentes)
  const idsToRemove = new Set();
  function collectIds(nodeId) {
    idsToRemove.add(nodeId);
    memoryTree
      .filter((n) => n.parentId === nodeId)
      .forEach((child) => collectIds(child.id));
  }
  collectIds(id);
  
  memoryTree = memoryTree.filter((n) => !idsToRemove.has(n.id));
  
  try {
    await fetch(`/api/node?id=${id}&tenant=${activeTenant}`, { method: 'DELETE' });
  } catch (err) {
    console.error('Failed to delete node in DB', err);
  }
  
  return true;
}

export async function moveNode(id, newParentId) {
  return updateNode(id, { parentId: newParentId });
}

export async function reorderNodes(parentId, orderedIds) {
  orderedIds.forEach((id, index) => {
    const node = memoryTree.find((n) => n.id === id);
    if (node) node.order = index;
  });
  
  // No mundo ideal, seria um batch update. Para o MVP, aceitável localmente e ignora backend.
  // Pode causar dessincronização de ordem no refresh.
}

export function searchNodes(query) {
  if (!query?.trim()) return [];
  const q = query.toLowerCase();
  return memoryTree.filter(
    (n) =>
      n.name?.toLowerCase().includes(q) ||
      n.metadata?.description?.toLowerCase().includes(q)
  );
}

export function countByType() {
  return memoryTree.reduce((acc, node) => {
    const type = node.type === 'folder' ? 'folders' : (node.content?.type || 'other');
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
}

export async function saveFile(nodeId, base64Data) {
  try {
    await fetch(`/api/file?nodeId=${nodeId}&tenant=${activeTenant}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: base64Data })
    });
  } catch (err) {
    console.error('Failed to save file in DB', err);
  }
}

export async function getFile(nodeId) {
  try {
    const res = await fetch(`/api/file?nodeId=${nodeId}&tenant=${activeTenant}`);
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
    return null;
  } catch (err) {
    console.error('Failed to get file from DB', err);
    return null;
  }
}

export async function deleteFile(nodeId) {
  // Tratado pelo cascade do banco
}

export function isSeeded() {
  return true; // We don't seed in real DB for now
}

export function markSeeded() {}
