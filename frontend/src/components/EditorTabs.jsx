import React from 'react';
import HandwritingCanvas from './HandwritingCanvas';
import VisualEditor from './VisualEditor';
import LatexEditor from './LatexEditor';

const EditorTabs = ({ 
  activeTab, 
  onTabChange, 
  latex, 
  onLatexChange, 
  onRecognize,
  isRecognizing 
}) => {
  return (
    <div className="editor-tabs">
      <div className="tabs-header">
        <button 
          className={`tab-btn ${activeTab === 'handwriting' ? 'active' : ''}`}
          onClick={() => onTabChange('handwriting')}
        >
          Manuscrit
        </button>
        <button 
          className={`tab-btn ${activeTab === 'visual' ? 'active' : ''}`}
          onClick={() => onTabChange('visual')}
        >
          Visuel
        </button>
        <button 
          className={`tab-btn ${activeTab === 'latex' ? 'active' : ''}`}
          onClick={() => onTabChange('latex')}
        >
          LaTeX
        </button>
      </div>

      <div className="editor-panel">
        {activeTab === 'handwriting' && (
          <HandwritingCanvas 
            onRecognize={onRecognize}
            isRecognizing={isRecognizing}
          />
        )}
        
        {activeTab === 'visual' && (
          <VisualEditor 
            latex={latex}
            onLatexChange={onLatexChange}
          />
        )}
        
        {activeTab === 'latex' && (
          <LatexEditor 
            latex={latex}
            onLatexChange={onLatexChange}
          />
        )}
      </div>
    </div>
  );
};

export default EditorTabs;
