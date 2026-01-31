import React from 'react';
import { Clock, Settings, ArrowLeft, Sparkles } from 'lucide-react';

const Header = ({ onHistoryClick, onSettingsClick, isHistoryView }) => {
  return (
    <header className="header">
      <div className="header-logo">
        <Sparkles size={20} />
        <span>FormulaPad</span>
      </div>
      
      <div className="header-actions">
        <button 
          className={`header-btn ${isHistoryView ? 'active' : ''}`}
          onClick={onHistoryClick}
          data-testid="history-btn"
        >
          {isHistoryView ? (
            <>
              <ArrowLeft size={16} />
              Retour
            </>
          ) : (
            <>
              <Clock size={16} />
              Historique
            </>
          )}
        </button>
        
        <button className="header-btn" onClick={onSettingsClick} data-testid="settings-btn">
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
};

export default Header;
