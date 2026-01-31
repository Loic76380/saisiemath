import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import EditorTabs from './components/EditorTabs';
import Preview from './components/Preview';
import ActionBar from './components/ActionBar';
import History from './components/History';
import Settings from './components/Settings';
import { HistoryProvider } from './context/HistoryContext';
import './styles/app.css';

function App() {
  const [currentView, setCurrentView] = useState('editor'); // 'editor' | 'history'
  const [activeTab, setActiveTab] = useState('handwriting'); // 'handwriting' | 'visual' | 'latex'
  const [latex, setLatex] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [confidence, setConfidence] = useState(null);
  const [canvasDataUrl, setCanvasDataUrl] = useState(null);

  const handleRecognize = useCallback(async (imageData) => {
    setIsRecognizing(true);
    setCanvasDataUrl(imageData);
    
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
        setActiveTab('latex'); // Switch to latex for correction
      }
    } catch (error) {
      console.error('Erreur OCR:', error);
    } finally {
      setIsRecognizing(false);
    }
  }, []);

  const handleLatexChange = useCallback((newLatex) => {
    setLatex(newLatex);
    setConfidence(null); // Clear confidence when manually editing
  }, []);

  const handleSelectFromHistory = useCallback((item) => {
    setLatex(item.latex);
    setCurrentView('editor');
    setActiveTab('latex');
  }, []);

  if (currentView === 'history') {
    return (
      <HistoryProvider>
        <div className="app">
          <Header 
            onHistoryClick={() => setCurrentView('editor')} 
            onSettingsClick={() => setShowSettings(true)}
            isHistoryView={true}
          />
          <History onSelect={handleSelectFromHistory} />
          {showSettings && <Settings onClose={() => setShowSettings(false)} />}
        </div>
      </HistoryProvider>
    );
  }

  return (
    <HistoryProvider>
      <div className="app">
        <Header 
          onHistoryClick={() => setCurrentView('history')} 
          onSettingsClick={() => setShowSettings(true)}
          isHistoryView={false}
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
          
          <ActionBar 
            latex={latex} 
            canvasDataUrl={canvasDataUrl}
          />
        </main>

        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      </div>
    </HistoryProvider>
  );
}

export default App;
