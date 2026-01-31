import React from 'react';

const LatexEditor = ({ latex, onLatexChange }) => {
  return (
    <textarea
      className="latex-editor"
      value={latex}
      onChange={(e) => onLatexChange(e.target.value)}
      placeholder="Entrez votre formule LaTeX ici...&#10;&#10;Exemples:&#10;  \frac{a}{b}  →  fraction&#10;  x^2         →  puissance&#10;  \sqrt{x}    →  racine carrée&#10;  \sum_{i=1}^{n} →  somme"
      spellCheck={false}
    />
  );
};

export default LatexEditor;
