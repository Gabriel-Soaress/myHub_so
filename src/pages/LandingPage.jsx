import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, BookOpen, FileText, Lightbulb, FolderOpen } from 'lucide-react';
import { countByType } from '../services/storageService';
import { APP_NAME, COURSE_NAME, INSTITUTION_NAME } from '../utils/constants';
import { formatDate } from '../utils/helpers';
import useAuthStore from '../store/useAuthStore';
import Button from '../components/ui/Button';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const landingSettings = useAuthStore(s => s.landingSettings);
  const activeSlug = useAuthStore(s => s.activeSlug);

  useEffect(() => {
    setStats(countByType());
  }, []);

  const totalFolders = stats.folders || 0;
  const totalRichtext = stats.richtext || 0;
  const totalPdf = stats.pdf || 0;
  const totalImage = stats.image || 0;
  const totalItems = totalRichtext + totalPdf + totalImage + (stats.download || 0);

  const title = landingSettings.landingTitle || APP_NAME;
  const subtitle = landingSettings.landingSubtitle || COURSE_NAME;
  const description = landingSettings.landingDescription || 'Uma coleção organizada de atividades, reflexões e projetos desenvolvidos ao longo da disciplina — documentando o processo de aprendizagem e crescimento profissional.';
  const color = landingSettings.landingColor || '#4f46e5';

  return (
    <div className="landing" style={{ '--primary-500': color, '--primary-600': color }}>
      {/* Animated gradient background */}
      <div className="landing__bg" style={{ background: `linear-gradient(135deg, ${color} 0%, var(--primary-900) 100%)` }} />

      {/* Floating decorative shapes */}
      <div className="landing__shapes" aria-hidden="true">
        <div className="landing__shape landing__shape--1" style={{ backgroundColor: color }} />
        <div className="landing__shape landing__shape--2" style={{ backgroundColor: color }} />
        <div className="landing__shape landing__shape--3" style={{ backgroundColor: color }} />
        <div className="landing__shape landing__shape--4" style={{ backgroundColor: color }} />
        <div className="landing__shape landing__shape--5" style={{ backgroundColor: color }} />
      </div>

      {/* Main content */}
      <main className="landing__content">
        <div className="landing__badge animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <BookOpen size={14} />
          <span>{subtitle}</span>
        </div>

        <h1 className="landing__title animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {title}
        </h1>

        <p className="landing__description animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {description}
        </p>

        {totalItems > 0 && (
          <div className="landing__stats animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            {totalFolders > 0 && (
              <div className="landing__stat">
                <FolderOpen size={16} />
                <span>{totalFolders} {totalFolders === 1 ? 'Pasta' : 'Pastas'}</span>
              </div>
            )}
            {totalRichtext > 0 && (
              <div className="landing__stat">
                <FileText size={16} />
                <span>{totalRichtext} {totalRichtext === 1 ? 'Atividade' : 'Atividades'}</span>
              </div>
            )}
            {totalPdf > 0 && (
              <div className="landing__stat">
                <Lightbulb size={16} />
                <span>{totalPdf} {totalPdf === 1 ? 'Documento' : 'Documentos'}</span>
              </div>
            )}
            {totalImage > 0 && (
              <div className="landing__stat">
                <span>{totalImage} {totalImage === 1 ? 'Imagem' : 'Imagens'}</span>
              </div>
            )}
          </div>
        )}

        <div className="landing__cta animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <Button
            variant="primary"
            size="lg"
            icon={ArrowRight}
            onClick={() => navigate(`/${activeSlug}/explorar`)}
          >
            Explorar Portfólio
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing__footer animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
        <p>Atualizado em {formatDate(new Date().toISOString())}</p>
        <p>{INSTITUTION_NAME} · {COURSE_NAME}</p>
      </footer>
    </div>
  );
}

export default LandingPage;
