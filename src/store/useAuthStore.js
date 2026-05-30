import { create } from 'zustand';
import { ADMIN_PASSWORD_HASH, STORAGE_KEYS } from '../utils/constants';
import { hashPassword } from '../utils/helpers';

const getPlatformUsers = () => JSON.parse(localStorage.getItem('platform-users') || '{}');

const getActiveTenant = () => {
  // Try to parse from URL if possible, otherwise rely on a global or just localStorage for now.
  // A robust way is to just read the location in the store, but usually the UI passes the slug.
  const path = window.location.pathname;
  const match = path.match(/^\/([^/]+)/);
  return match ? match[1] : 'default';
};

const getTenantAuthKey = (slug) => `portfolio-auth-${slug}`;
const getTenantSettingsKey = (slug) => `portfolio-settings-${slug}`;

const useAuthStore = create((set, get) => ({
  activeSlug: getActiveTenant(),
  isAuthenticated: false, // will be initialized by init()
  isLoginModalOpen: false,
  loginError: '',
  unlockedNodes: [],
  landingSettings: {},

  init: (slug) => {
    const isAuth = localStorage.getItem(getTenantAuthKey(slug)) === 'true';
    const settings = JSON.parse(localStorage.getItem(getTenantSettingsKey(slug)) || '{}');
    set({
      activeSlug: slug,
      isAuthenticated: isAuth,
      landingSettings: settings,
      unlockedNodes: []
    });
  },

  openLoginModal: () => set({ isLoginModalOpen: true, loginError: '' }),
  closeLoginModal: () => set({ isLoginModalOpen: false, loginError: '' }),

  unlockNode: (nodeId) => set((state) => {
    if (!state.unlockedNodes.includes(nodeId)) {
      return { unlockedNodes: [...state.unlockedNodes, nodeId] };
    }
    return state;
  }),

  updateLandingSettings: (settings) => {
    const slug = get().activeSlug;
    localStorage.setItem(getTenantSettingsKey(slug), JSON.stringify(settings));
    set({ landingSettings: settings });
  },

  register: async (name, email, slug, password) => {
    const users = getPlatformUsers();
    if (users[slug]) return { success: false, error: 'Este link já está em uso.' };
    
    const hash = await hashPassword(password);
    users[slug] = { name, email, slug, passwordHash: hash };
    localStorage.setItem('platform-users', JSON.stringify(users));
    
    // Auto-login after register
    localStorage.setItem(getTenantAuthKey(slug), 'true');
    set({ isAuthenticated: true, activeSlug: slug });
    return { success: true };
  },

  changePassword: async (oldPassword, newPassword) => {
    const slug = get().activeSlug;
    const users = getPlatformUsers();
    const user = users[slug];
    
    // Backward compatibility for legacy single-tenant admin
    const oldHash = await hashPassword(oldPassword);
    const legacyHash = localStorage.getItem('admin-password-hash') || ADMIN_PASSWORD_HASH;
    
    let currentHash = user ? user.passwordHash : legacyHash;
    
    if (oldHash !== currentHash) return false;
    
    const newHash = await hashPassword(newPassword);
    
    if (user) {
      user.passwordHash = newHash;
      localStorage.setItem('platform-users', JSON.stringify(users));
    } else {
      localStorage.setItem('admin-password-hash', newHash);
    }
    return true;
  },

  login: async (password, emailOverride) => {
    // If we only have password, it's the legacy login flow (e.g. from within a tenant)
    // But since we require email now from PlatformHome, we'll use emailOverride
    const users = getPlatformUsers();
    
    let user = null;
    let targetSlug = null;

    if (emailOverride) {
      // Find user by email
      const userKey = Object.keys(users).find(key => users[key].email === emailOverride);
      if (!userKey) {
        set({ loginError: 'Usuário não encontrado.' });
        return false;
      }
      user = users[userKey];
      targetSlug = user.slug;
    } else {
      targetSlug = get().activeSlug;
      user = users[targetSlug];
    }
    
    const hash = await hashPassword(password);
    
    // Legacy support
    const legacyHash = localStorage.getItem('admin-password-hash') || ADMIN_PASSWORD_HASH;
    const expectedHash = user ? user.passwordHash : legacyHash;
    
    if (hash === expectedHash) {
      localStorage.setItem(getTenantAuthKey(targetSlug), 'true');
      set({ isAuthenticated: true, isLoginModalOpen: false, loginError: '', activeSlug: targetSlug });
      return targetSlug; // return slug so UI can navigate
    } else {
      set({ loginError: 'Senha incorreta. Tente novamente.' });
      return false;
    }
  },

  logout: () => {
    const slug = get().activeSlug;
    localStorage.removeItem(getTenantAuthKey(slug));
    set({ isAuthenticated: false });
  },
}));

export default useAuthStore;
