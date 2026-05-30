import { AlertTriangle } from 'lucide-react';
import Modal from '../ui/Modal';
import useUIStore from '../../store/useUIStore';
import { deleteNodeRecursive } from '../../services/storageService';
import './Admin.css';

function DeleteConfirm({ onAfterDelete }) {
  const { activeModal, modalData, closeModal, triggerRefresh } = useUIStore();
  const isOpen = activeModal === 'delete';

  const handleDelete = () => {
    if (!modalData?.id) return;

    deleteNodeRecursive(modalData.id);
    triggerRefresh();
    closeModal();

    if (onAfterDelete) {
      onAfterDelete();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="">
      <div className="delete-confirm">
        <div className="delete-confirm__icon">
          <AlertTriangle size={36} />
        </div>

        <h2 className="delete-confirm__title">Tem certeza?</h2>

        {modalData?.name && (
          <p className="delete-confirm__name">
            &ldquo;{modalData.name}&rdquo;
          </p>
        )}

        <p className="delete-confirm__warning">
          Esta ação não pode ser desfeita. Todos os conteúdos dentro desta pasta
          também serão removidos.
        </p>

        <div className="delete-confirm__actions">
          <button
            type="button"
            className="admin-form__btn admin-form__btn--secondary"
            onClick={closeModal}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="admin-form__btn admin-form__btn--danger"
            onClick={handleDelete}
          >
            Excluir
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteConfirm;
