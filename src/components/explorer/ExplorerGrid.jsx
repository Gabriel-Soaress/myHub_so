import './Explorer.css';

function ExplorerGrid({ children }) {
  return (
    <div className="explorer-grid stagger-children">
      {children}
    </div>
  );
}

export default ExplorerGrid;
