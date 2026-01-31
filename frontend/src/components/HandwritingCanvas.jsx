import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Undo2, Redo2, Trash2, Loader2, Scan } from 'lucide-react';

const HandwritingCanvas = ({ onRecognize, isRecognizing }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser'
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [hasContent, setHasContent] = useState(false);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL();
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, dataUrl];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Set drawing style
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1a1a1a';
    
    // Save initial state
    saveState();
  }, [saveState]);

  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoords(e);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#1a1a1a';
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoords(e);
    
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasContent(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
      };
      
      setHistoryIndex(prev => prev - 1);
      img.src = history[historyIndex - 1];
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
      };
      
      setHistoryIndex(prev => prev + 1);
      img.src = history[historyIndex + 1];
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
    saveState();
  };

  const handleRecognize = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onRecognize(dataUrl);
  };

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        data-testid="handwriting-canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      
      <div className="canvas-toolbar">
        <button 
          className={`canvas-tool ${tool === 'pen' ? 'active' : ''}`}
          onClick={() => setTool('pen')}
          title="Stylo"
          data-testid="pen-tool"
        >
          ✏️
        </button>
        <button 
          className={`canvas-tool ${tool === 'eraser' ? 'active' : ''}`}
          onClick={() => setTool('eraser')}
          title="Gomme"
          data-testid="eraser-tool"
        >
          <Eraser size={16} />
        </button>
        <button 
          className="canvas-tool"
          onClick={undo}
          disabled={historyIndex <= 0}
          title="Annuler"
          data-testid="undo-btn"
        >
          <Undo2 size={16} />
        </button>
        <button 
          className="canvas-tool"
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          title="Refaire"
          data-testid="redo-btn"
        >
          <Redo2 size={16} />
        </button>
        <button 
          className="canvas-tool"
          onClick={clear}
          title="Effacer tout"
          data-testid="clear-btn"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <button 
        className="recognize-btn"
        onClick={handleRecognize}
        disabled={!hasContent || isRecognizing}
        data-testid="recognize-btn"
      >
        {isRecognizing ? (
          <>
            <Loader2 size={16} className="spinner" />
            Reconnaissance...
          </>
        ) : (
          <>
            <Scan size={16} />
            Reconnaître
          </>
        )}
      </button>
    </div>
  );
};

export default HandwritingCanvas;
