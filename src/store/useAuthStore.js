import { create } from 'zustand';

function getTenantAuthKey(slug) {
  return `portfolio-auth-${slug}`;
}

const useAuthStore = create((set, get) => ({
  activeSlug: null,
  isAuthenticated: false,
  isLoginModalOpen: false,
  loginError: '',
  unlockedNodes: [],
  landingSettings: {},
  tenantNotFound: false,

  init: async (slug) => {
    // Carrega settings da API
    let settings = {};
    let notFound = false;
    try {
      const res = await fetch(`/api/settings?tenant=${slug}`);
      if (res.ok) {
        settings = await res.json();
      } else if (res.status === 404) {
        notFound = true;
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    }
    
    // Auth state continua local (para manter a sessão do admin sem cookie complexo)
    const isAuth = sessionStorage.getItem(getTenantAuthKey(slug)) === 'true';
    
    set({
      activeSlug: slug,
      isAuthenticated: isAuth,
      landingSettings: settings,
      unlockedNodes: [],
      tenantNotFound: notFound
    });
  },

  register: async (name, email, slug, password) => {
    try {
      // Dummy hash generation here, real one should be on backend, but since we had one:
      let passwordHash = password;
      if (window.crypto && window.crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        passwordHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      } else {
        passwordHash = btoa(password).split('').reverse().join('');
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, slug, passwordHash })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Erro no cadastro' };
      }

      // Auto-login after register
      sessionStorage.setItem(getTenantAuthKey(slug), 'true');
      set({ isAuthenticated: true, activeSlug: slug, tenantNotFound: false });
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Erro de rede' };
    }
  },

  login: async (password, emailOverride) => {
    try {
      let passwordHash = password;
      if (window.crypto && window.crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        passwordHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      } else {
        passwordHash = btoa(password).split('').reverse().join('');
      }

      const body = { passwordHash };
      if (emailOverride) {
        body.email = emailOverride;
      } else {
        body.slugOverride = get().activeSlug;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        set({ loginError: data.error || 'Erro no login' });
        return false;
      }

      const targetSlug = data.slug;
      sessionStorage.setItem(getTenantAuthKey(targetSlug), 'true');
      set({ isAuthenticated: true, isLoginModalOpen: false, loginError: '', activeSlug: targetSlug, tenantNotFound: false });
      return targetSlug;
    } catch (err) {
      set({ loginError: 'Erro de rede' });
      return false;
    }
  },

  logout: () => {
    const slug = get().activeSlug;
    if (slug) {
      sessionStorage.removeItem(getTenantAuthKey(slug));
    }
    set({ isAuthenticated: false, unlockedNodes: [] });
  },

  unlockNode: (nodeId) => {
    set((state) => ({ unlockedNodes: [...state.unlockedNodes, nodeId] }));
  },
  openLoginModal: () => set({ isLoginModalOpen: true, loginError: '' }),
  closeLoginModal: () => set({ isLoginModalOpen: false, loginError: '' }),

  saveSettings: async (settings) => {
    const slug = get().activeSlug;
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant: slug, settings })
      });
      set({ landingSettings: settings });
    } catch (err) {
      console.error('Failed to save settings', err);
    }
  }
}));

export default useAuthStore;
