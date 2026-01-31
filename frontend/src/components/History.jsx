import React, { useEffect, useRef } from 'react';
import { Copy, Image, Trash2, Loader2 } from 'lucide-react';
import { useHistory } from '../context/HistoryContext';
import katex from 'katex';
import html2canvas from 'html2canvas';

const HistoryItem = ({ item, onSelect }) => {
  const previewRef = useRef(null);
  const { removeFromHistory } = useHistory();

  useEffect(() => {
    if (previewRef.current && item.latex) {
      try {
        katex.render(item.latex, previewRef.current, {
          throwOnError: false,
          displayMode: false,
        });
      } catch {
        previewRef.current.textContent = item.latex;
      }
    }
  }, [item.latex]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)} h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const copyLatex = async (e) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(item.latex);
  };

  const copyImage = async (e) => {
    e.stopPropagation();
    
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = 'position: absolute; left: -9999px; padding: 20px; background: white; font-size: 24px;';
    document.body.appendChild(tempDiv);

    try {
      katex.render(item.latex, tempDiv, { throwOnError: false, displayMode: true });
      const canvas = await html2canvas(tempDiv, { backgroundColor: '#ffffff', scale: 2 });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      } catch {
        const link = document.createElement('a');
        link.download = 'formule.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    removeFromHistory(item.id);
  };

  return (
    <div className="history-item" onClick={() => onSelect(item)}>
      <div className="history-preview" ref={previewRef} />
      <div className="history-date">{formatDate(item.timestamp)}</div>
      <div className="history-actions">
        <button className="canvas-tool" onClick={copyLatex} title="Copier LaTeX">
          <Copy size={14} />
        </button>
        <button className="canvas-tool" onClick={copyImage} title="Copier image">
          <Image size={14} />
        </button>
        <button className="canvas-tool" onClick={handleDelete} title="Supprimer">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

const History = ({ onSelect }) => {
  const { history, isLoading } = useHistory();

  if (isLoading) {
    return (
      <div className="history-container">
        <div className="history-empty">
          <Loader2 size={24} className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h2 className="history-title">Historique ({history.length})</h2>
      
      {history.length === 0 ? (
        <div className="history-empty">
          <p>Aucune formule dans l'historique</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>
            Les formules copiées apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <HistoryItem key={item.id} item={item} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
