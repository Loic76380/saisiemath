import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const Preview = ({ latex, confidence }) => {
  const previewRef = useRef(null);

  useEffect(() => {
    if (!previewRef.current) return;

    if (!latex || !latex.trim()) {
      previewRef.current.innerHTML = '<span class="preview-placeholder">Aperçu de la formule</span>';
      return;
    }

    try {
      katex.render(latex, previewRef.current, {
        throwOnError: false,
        displayMode: true,
        output: 'html',
      });
    } catch (error) {
      previewRef.current.innerHTML = `<span style="color: #ef4444; font-size: 14px;">Erreur: ${error.message}</span>`;
    }
  }, [latex]);

  const getConfidenceClass = () => {
    if (!confidence) return '';
    if (confidence >= 0.9) return 'confidence-high';
    if (confidence >= 0.7) return 'confidence-medium';
    return 'confidence-low';
  };

  const getConfidenceLabel = () => {
    if (!confidence) return '';
    const percent = Math.round(confidence * 100);
    return `Confiance: ${percent}%`;
  };

  return (
    <div className="preview-section" style={{ position: 'relative' }}>
      {confidence && (
        <span className={`confidence-badge ${getConfidenceClass()}`}>
          {getConfidenceLabel()}
        </span>
      )}
      <div className="preview-content" ref={previewRef} data-testid="formula-preview" />
    </div>
  );
};

export default Preview;
