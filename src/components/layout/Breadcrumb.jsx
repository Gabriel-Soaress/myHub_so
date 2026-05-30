import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Home, ChevronRight } from 'lucide-react';
import { getAncestors } from '../../services/storageService';
import useAuthStore from '../../store/useAuthStore';
import './Layout.css';

function Breadcrumb({ nodeId }) {
  const [ancestors, setAncestors] = useState([]);
  const activeSlug = useAuthStore((s) => s.activeSlug);

  useEffect(() => {
    if (nodeId) {
      const path = getAncestors(nodeId);
      setAncestors(path);
    } else {
      setAncestors([]);
    }
  }, [nodeId]);

  return (
    <nav className="breadcrumb" aria-label="Navegação estrutural">
      <ol className="breadcrumb__list">
        <li className="breadcrumb__item">
          <Link to={`/${activeSlug}/explorar`} className="breadcrumb__link">
            <Home size={15} />
            <span>Início</span>
          </Link>
        </li>
        {ancestors.map((node, index) => {
          const isLast = index === ancestors.length - 1;
          return (
            <li key={node.id} className="breadcrumb__item">
              <ChevronRight size={14} className="breadcrumb__separator" />
              {isLast ? (
                <span className="breadcrumb__current">{node.name}</span>
              ) : (
                <Link
                  to={`/${activeSlug}/explorar/${node.id}`}
                  className="breadcrumb__link"
                >
                  {node.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
