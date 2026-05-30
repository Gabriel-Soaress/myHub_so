import { Routes, Route } from 'react-router';
import { useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import ExplorerPage from './pages/ExplorerPage';
import ContentViewerPage from './pages/ContentViewerPage';
import PlatformHome from './pages/PlatformHome';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import TenantLayout from './components/layout/TenantLayout';
import AdminLogin from './components/admin/AdminLogin';
import FolderEditor from './components/admin/FolderEditor';
import ContentEditor from './components/admin/ContentEditor';
import FileUploader from './components/admin/FileUploader';
import DeleteConfirm from './components/admin/DeleteConfirm';
import CodeEditorModal from './components/admin/CodeEditorModal';
import MoveModal from './components/admin/MoveModal';
import SettingsModal from './components/admin/SettingsModal';
import ShareModal from './components/ui/ShareModal';
import useAuthStore from './store/useAuthStore';
import useUIStore from './store/useUIStore';
import './App.css';

function AppLayout({ children }) {
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
  const isSidebarMobile = useUIStore((s) => s.isSidebarMobile);
  const setSidebarMobile = useUIStore((s) => s.setSidebarMobile);

  // Responsividade
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarMobile(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarMobile]);

  return (
    <div className="app-layout">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main
          className={`app-content ${isSidebarOpen ? '' : 'app-content--full'}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  const isLoginModalOpen = useAuthStore((s) => s.isLoginModalOpen);
  const activeModal = useUIStore((s) => s.activeModal);

  return (
    <>
      <Routes>
        <Route path="/" element={<PlatformHome />} />
        
        <Route path="/:slug" element={<TenantLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="explorar" element={<AppLayout><ExplorerPage /></AppLayout>} />
          <Route path="explorar/:folderId" element={<AppLayout><ExplorerPage /></AppLayout>} />
          <Route path="conteudo/:nodeId" element={<AppLayout><ContentViewerPage /></AppLayout>} />
        </Route>
      </Routes>

      {/* Modais globais */}
      {isLoginModalOpen && <AdminLogin />}
      {activeModal === 'createFolder' && <FolderEditor />}
      {activeModal === 'editFolder' && <FolderEditor />}
      {activeModal === 'createContent' && <ContentEditor />}
      {activeModal === 'editContent' && <ContentEditor />}
      {activeModal === 'createCode' && <CodeEditorModal />}
      {activeModal === 'editCode' && <CodeEditorModal />}
      {activeModal === 'upload' && <FileUploader />}
      {activeModal === 'delete' && <DeleteConfirm />}
      {activeModal === 'move' && <MoveModal />}
      {activeModal === 'settings' && <SettingsModal />}
      {activeModal === 'share' && <ShareModal />}
    </>
  );
}

export default App;
