import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import EditorTabs from './components/EditorTabs';
import Preview from './components/Preview';
import ActionBar from './components/ActionBar';
import Settings from './components/Settings';
import './styles/app.css';

function App() {
  const [activeTab, setActiveTab] = useState('handwriting');
  const [latex, setLatex] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [confidence, setConfidence] = useState(null);

  const handleRecognize = useCallback(async (imageData) => {
    setIsRecognizing(true);
    
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${API_URL}/api/ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) throw new Error('Erreur de reconnaissance');

      const data = await response.json();
      if (data.latex) {
        setLatex(data.latex);
        setConfidence(data.confidence);
        setActiveTab('latex');
      }
    } catch (error) {
      console.error('Erreur OCR:', error);
    } finally {
      setIsRecognizing(false);
    }
  }, []);

  const handleLatexChange = useCallback((newLatex) => {
    setLatex(newLatex);
    setConfidence(null);
  }, []);

  return (
    <div className="app">
      <Header 
        onSettingsClick={() => setShowSettings(true)}
      />
      
      <main className="main-content">
        <EditorTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          latex={latex}
          onLatexChange={handleLatexChange}
          onRecognize={handleRecognize}
          isRecognizing={isRecognizing}
        />
        
        <Preview latex={latex} confidence={confidence} />
        
        <ActionBar latex={latex} />
      </main>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
