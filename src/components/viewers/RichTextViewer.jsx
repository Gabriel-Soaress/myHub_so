import './Viewers.css';

function RichTextViewer({ content }) {
  if (!content) {
    return (
      <div className="richtext-viewer">
        <p className="richtext-viewer__empty">Nenhum conteúdo disponível.</p>
      </div>
    );
  }

  return (
    <div className="richtext-viewer">
      <div
        className="prose richtext-viewer__body"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

export default RichTextViewer;
