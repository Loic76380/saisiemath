import React from 'react';

const PALETTES = [
  { label: 'Fraction', latex: '\\frac{□}{□}', insert: '\\frac{}{}' },
  { label: 'Puissance', latex: 'x^{□}', insert: '^{}' },
  { label: 'Indice', latex: 'x_{□}', insert: '_{}' },
  { label: 'Racine', latex: '√□', insert: '\\sqrt{}' },
  { label: 'Intégrale', latex: '∫', insert: '\\int_{a}^{b}' },
  { label: 'Somme', latex: 'Σ', insert: '\\sum_{i=1}^{n}' },
  { label: 'Produit', latex: 'Π', insert: '\\prod_{i=1}^{n}' },
  { label: 'Limite', latex: 'lim', insert: '\\lim_{x \\to \\infty}' },
  { label: 'Infini', latex: '∞', insert: '\\infty' },
];

const GREEK = [
  { label: 'α', insert: '\\alpha' },
  { label: 'β', insert: '\\beta' },
  { label: 'γ', insert: '\\gamma' },
  { label: 'δ', insert: '\\delta' },
  { label: 'θ', insert: '\\theta' },
  { label: 'λ', insert: '\\lambda' },
  { label: 'μ', insert: '\\mu' },
  { label: 'π', insert: '\\pi' },
  { label: 'σ', insert: '\\sigma' },
  { label: 'φ', insert: '\\phi' },
  { label: 'ω', insert: '\\omega' },
];

const OPERATORS = [
  { label: '±', insert: '\\pm' },
  { label: '×', insert: '\\times' },
  { label: '÷', insert: '\\div' },
  { label: '≠', insert: '\\neq' },
  { label: '≤', insert: '\\leq' },
  { label: '≥', insert: '\\geq' },
  { label: '≈', insert: '\\approx' },
  { label: '→', insert: '\\to' },
  { label: '∈', insert: '\\in' },
];

const VisualEditor = ({ latex, onLatexChange }) => {
  const insertSymbol = (symbol) => {
    onLatexChange(latex + ' ' + symbol);
  };

  return (
    <div className="visual-editor">
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>Structures</div>
        <div className="visual-palettes">
          {PALETTES.map((item, i) => (
            <button 
              key={i}
              className="palette-btn"
              onClick={() => insertSymbol(item.insert)}
              title={item.label}
            >
              {item.latex}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>Lettres grecques</div>
        <div className="visual-palettes">
          {GREEK.map((item, i) => (
            <button 
              key={i}
              className="palette-btn"
              onClick={() => insertSymbol(item.insert)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>Opérateurs</div>
        <div className="visual-palettes">
          {OPERATORS.map((item, i) => (
            <button 
              key={i}
              className="palette-btn"
              onClick={() => insertSymbol(item.insert)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <textarea
        className="latex-editor"
        value={latex}
        onChange={(e) => onLatexChange(e.target.value)}
        placeholder="Cliquez sur les symboles ci-dessus ou tapez directement..."
        style={{ marginTop: '16px', minHeight: '80px' }}
      />
    </div>
  );
};

export default VisualEditor;
