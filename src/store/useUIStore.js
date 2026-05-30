import { create } from 'zustand';

const useUIStore = create((set) => ({
  // Sidebar
  isSidebarOpen: true,
  isSidebarMobile: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarMobile: (val) => set({ isSidebarMobile: val }),
  closeMobileSidebar: () => set({ isSidebarMobile: false }),

  // Search
  searchQuery: '',
  isSearching: false,
  setSearchQuery: (query) => set({ searchQuery: query, isSearching: query.length > 0 }),
  clearSearch: () => set({ searchQuery: '', isSearching: false }),

  // Refresh trigger — incrementar para forçar re-render dos dados
  refreshKey: 0,
  triggerRefresh: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),

  // Modals
  activeModal: null, // 'createFolder' | 'createContent' | 'upload' | 'delete' | 'editFolder' | 'editContent'
  modalData: null,
  openModal: (modal, data = null) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
}));

export default useUIStore;
