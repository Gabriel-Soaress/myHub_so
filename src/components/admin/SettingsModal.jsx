import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import useUIStore from '../../store/useUIStore';
import useAuthStore from '../../store/useAuthStore';
import { APP_NAME, COURSE_NAME, FOLDER_COLORS } from '../../utils/constants';
import { Check } from 'lucide-react';
import './Admin.css';

function SettingsModal() {
  const isOpen = useUIStore((s) => s.activeModal === 'settings');
  const closeModal = useUIStore((s) => s.closeModal);
  
  const landingSettings = useAuthStore((s) => s.landingSettings);
  const saveSettings = useAuthStore((s) => s.saveSettings);
  const changePassword = useAuthStore((s) => s.changePassword);

  const [activeTab, setActiveTab] = useState('landing');
  
  // Landing State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [footer, setFooter] = useState('');
  const [color, setColor] = useState('');

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen) {
      setTitle(landingSettings.landingTitle || APP_NAME);
      setSubtitle(landingSettings.landingSubtitle || COURSE_NAME);
      setDescription(landingSettings.landingDescription || 'Um espaço dedicado à organização e reflexão sobre a jornada de aprendizado.');
      setFooter(landingSettings.landingFooter || 'Universidade · Engenharia de Software');
      setColor(landingSettings.landingColor || 'var(--primary-500)');
      
      setOldPassword('');
      setNewPassword('');
      setPasswordMsg({ type: '', text: '' });
      setActiveTab('landing');
    }
  }, [isOpen, landingSettings]);

  if (!isOpen) return null;

  const handleSaveLanding = async () => {
    await saveSettings({
      landingTitle: title,
      landingSubtitle: subtitle,
      landingDescription: description,
      landingFooter: footer,
      landingColor: color
    });
    closeModal();
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;

    const success = await changePassword(oldPassword, newPassword);
    if (success) {
      setPasswordMsg({ type: 'success', text: 'Senha alterada com sucesso!' });
      setOldPassword('');
      setNewPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: 'A senha atual está incorreta.' });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Configurações do Hub">
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
        <button 
          style={{ 
            background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer',
            fontWeight: activeTab === 'landing' ? 'bold' : 'normal',
            borderBottom: activeTab === 'landing' ? '2px solid var(--primary-500)' : '2px solid transparent',
            color: activeTab === 'landing' ? 'var(--primary-600)' : 'var(--gray-600)'
          }}
          onClick={() => setActiveTab('landing')}
        >
          Página Inicial
        </button>
        <button 
          style={{ 
            background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer',
            fontWeight: activeTab === 'security' ? 'bold' : 'normal',
            borderBottom: activeTab === 'security' ? '2px solid var(--primary-500)' : '2px solid transparent',
            color: activeTab === 'security' ? 'var(--primary-600)' : 'var(--gray-600)'
          }}
          onClick={() => setActiveTab('security')}
        >
          Segurança
        </button>
      </div>

      {activeTab === 'landing' && (
        <div>
          <div className="admin-form__group">
            <label className="admin-form__label">Título Principal</label>
            <input 
              type="text" 
              className="admin-form__input" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
            />
          </div>
          <div className="admin-form__group">
            <label className="admin-form__label">Subtítulo (Disciplina)</label>
            <input 
              type="text" 
              className="admin-form__input" 
              value={subtitle} 
              onChange={e => setSubtitle(e.target.value)} 
            />
          </div>
          <div className="admin-form__group">
            <label className="admin-form__label">Texto de Apresentação</label>
            <textarea 
              className="admin-form__input" 
              rows={3}
              value={description} 
              onChange={e => setDescription(e.target.value)} 
            />
          </div>
          <div className="admin-form__group">
            <label className="admin-form__label">Texto do Rodapé (Ex: Universidade · Curso)</label>
            <input 
              type="text" 
              className="admin-form__input" 
              value={footer} 
              onChange={e => setFooter(e.target.value)} 
            />
          </div>
          <div className="admin-form__group">
            <label className="admin-form__label">Cor de Destaque</label>
            <div className="color-picker">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`color-picker__circle ${color === c.value || color === `var(--primary-500)` && c.value === '#4f46e5' ? 'color-picker__circle--active' : ''}`}
                  style={{ '--circle-color': c.value }}
                  onClick={() => setColor(c.value)}
                  title={c.name}
                >
                  {(color === c.value || (color === `var(--primary-500)` && c.value === '#4f46e5')) && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
          <div className="admin-form__actions" style={{ marginTop: '2rem' }}>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveLanding}>Salvar Alterações</Button>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <form onSubmit={handleSavePassword}>
          <div className="admin-form__group">
            <label className="admin-form__label">Senha Atual</label>
            <input 
              type="password" 
              className="admin-form__input" 
              value={oldPassword} 
              onChange={e => setOldPassword(e.target.value)} 
            />
          </div>
          <div className="admin-form__group">
            <label className="admin-form__label">Nova Senha</label>
            <input 
              type="password" 
              className="admin-form__input" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
            />
          </div>
          
          {passwordMsg.text && (
            <div style={{ 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-sm)', 
              marginBottom: '1rem',
              backgroundColor: passwordMsg.type === 'error' ? 'var(--danger-50)' : 'var(--success-50)',
              color: passwordMsg.type === 'error' ? 'var(--danger-600)' : 'var(--success-600)',
              fontSize: '14px'
            }}>
              {passwordMsg.text}
            </div>
          )}

          <div className="admin-form__actions" style={{ marginTop: '2rem' }}>
            <Button variant="ghost" type="button" onClick={closeModal}>Fechar</Button>
            <Button variant="primary" type="submit" disabled={!oldPassword || !newPassword}>Trocar Senha</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default SettingsModal;
