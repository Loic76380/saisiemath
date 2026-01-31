import React from 'react';
import { X } from 'lucide-react';

const Settings = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Paramètres</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="setting-row">
          <span className="setting-label">Version</span>
          <span style={{ color: '#666', fontSize: '14px' }}>1.0.0</span>
        </div>

        <div className="setting-row">
          <span className="setting-label">Reconnaissance</span>
          <span style={{ color: '#666', fontSize: '14px' }}>GPT-4 Vision</span>
        </div>

        <div className="setting-row">
          <span className="setting-label">Stockage local</span>
          <span style={{ color: '#22c55e', fontSize: '14px' }}>Activé</span>
        </div>

        <div style={{ marginTop: '20px', padding: '12px', background: '#f5f5f5', borderRadius: '8px', fontSize: '13px', color: '#666' }}>
          <strong>FormulaPad</strong> - Saisie et reconnaissance de formules mathématiques.
          <br /><br />
          Modes disponibles : Manuscrit, Visuel, LaTeX
          <br />
          Export : Texte (LaTeX, MathML, Word) et Image (PNG, SVG)
        </div>
      </div>
    </div>
  );
};

export default Settings;
