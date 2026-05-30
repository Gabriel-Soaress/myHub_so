import { useState } from 'react';
import { Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import Modal from '../ui/Modal';
import './Admin.css';

function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const { isLoginModalOpen, closeLoginModal, login, loginError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(password);
    if (success) {
      setUnlocking(true);
      setTimeout(() => {
        setUnlocking(false);
        setPassword('');
      }, 600);
    }
  };

  const handleClose = () => {
    setPassword('');
    setUnlocking(false);
    closeLoginModal();
  };

  if (!isLoginModalOpen) return null;

  return (
    <Modal isOpen={isLoginModalOpen} onClose={handleClose} title="">
      <form className="admin-login" onSubmit={handleSubmit}>
        <div className={`admin-login__icon ${unlocking ? 'admin-login__icon--unlocked' : ''}`}>
          {unlocking ? <Unlock size={32} /> : <Lock size={32} />}
        </div>

        <h2 className="admin-login__title">Acesso Administrativo</h2>
        <p className="admin-login__subtitle">
          Digite a senha para acessar o painel de administração.
        </p>

        <div className="admin-login__field">
          <div className="admin-login__input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              className="admin-login__input"
              placeholder="Senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button
              type="button"
              className="admin-login__toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {loginError && (
          <p className="admin-login__error">{loginError}</p>
        )}

        <button type="submit" className="admin-login__submit">
          Entrar
        </button>
      </form>
    </Modal>
  );
}

export default AdminLogin;
