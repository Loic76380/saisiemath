import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Eraser, 
  Trash2, 
  Undo, 
  Redo, 
  Pen,
  Circle,
  Minus,
  Plus,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { cn } from '../lib/utils';

const HandwritingCanvas = ({ onRecognize, isProcessing }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState('#000000');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [hasContent, setHasContent] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;
    
    // White background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    contextRef.current = context;
    
    // Save initial state
    saveState();
  }, []);

  // Update brush settings
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = tool === 'eraser' ? '#ffffff' : brushColor;
      contextRef.current.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize;
    }
  }, [brushSize, brushColor, tool]);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imageData = canvas.toDataURL();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    
    // Limit history to 20 states
    if (newHistory.length > 20) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const getCoordinates = (e) => {
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
    const { x, y } = getCoordinates(e);
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
    setHasContent(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const { x, y } = getCoordinates(e);
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      contextRef.current.closePath();
      setIsDrawing(false);
      saveState();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
    saveState();
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      loadState(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      loadState(history[newIndex]);
    }
  };

  const loadState = (imageData) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    const img = new Image();
    
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
    };
    img.src = imageData;
  };

  const handleRecognize = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');
    onRecognize(imageData);
  };

  const colors = ['#000000', '#1e40af', '#dc2626', '#16a34a', '#9333ea'];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-2">
          {/* Tools */}
          <div className="flex items-center gap-1 p-1 bg-[#21262d] rounded-lg">
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "w-8 h-8",
                tool === 'pen' && "bg-[#6366f1] text-white hover:bg-[#6366f1]"
              )}
              onClick={() => setTool('pen')}
            >
              <Pen className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "w-8 h-8",
                tool === 'eraser' && "bg-[#6366f1] text-white hover:bg-[#6366f1]"
              )}
              onClick={() => setTool('eraser')}
            >
              <Eraser className="w-4 h-4" />
            </Button>
          </div>

          {/* Brush Size */}
          <div className="flex items-center gap-2 px-3">
            <Minus className="w-3 h-3 text-gray-500" />
            <Slider
              value={[brushSize]}
              onValueChange={([value]) => setBrushSize(value)}
              min={1}
              max={10}
              step={1}
              className="w-24"
            />
            <Plus className="w-3 h-3 text-gray-500" />
          </div>

          {/* Colors */}
          <div className="flex items-center gap-1 px-2">
            {colors.map((color) => (
              <button
                key={color}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                  brushColor === color ? "border-white scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: color }}
                onClick={() => setBrushColor(color)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* History */}
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 text-gray-400 hover:text-white"
            onClick={undo}
            disabled={historyIndex <= 0}
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 text-gray-400 hover:text-white"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="w-4 h-4" />
          </Button>

          {/* Clear */}
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-red-400"
            onClick={clearCanvas}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Effacer
          </Button>

          {/* Recognize */}
          <Button
            size="sm"
            className="bg-[#6366f1] hover:bg-[#5558e3]"
            onClick={handleRecognize}
            disabled={!hasContent || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyse...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Reconnaître
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-white m-4 rounded-lg overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Instructions */}
      <div className="p-3 text-center text-sm text-gray-500 border-t border-[#30363d]">
        Dessinez votre équation mathématique, puis cliquez sur "Reconnaître"
      </div>
    </div>
  );
};

export default HandwritingCanvas;