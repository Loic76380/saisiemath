import React from 'react';
import { Settings, Sparkles } from 'lucide-react';

const Header = ({ onSettingsClick }) => {
  return (
    <header className="header">
      <div className="header-logo">
        <Sparkles size={20} />
        <span>FormulaPad</span>
      </div>
      
      <div className="header-actions">
        <button className="header-btn" onClick={onSettingsClick}>
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
};

export default Header;
