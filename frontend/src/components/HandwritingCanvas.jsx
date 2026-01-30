import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Eraser, 
  Trash2, 
  Undo, 
  Redo, 
  Pen,
  Minus,
  Plus,
  Check,
  Loader2,
  Copy,
  Download,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';
import { useLanguage } from '../i18n/LanguageContext';

const HandwritingCanvas = ({ onRecognize, isProcessing, recognitionResult, onClearResult }) => {
  const { t, language } = useLanguage();
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const resultImageRef = useRef(null);
  
  // Debug: log recognitionResult when it changes
  useEffect(() => {
    console.log('HandwritingCanvas recognitionResult:', recognitionResult);
  }, [recognitionResult]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [brushSize, setBrushSize] = useState(4);
  const [brushColor, setBrushColor] = useState('#000000');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [hasContent, setHasContent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canvasImage, setCanvasImage] = useState(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
    
    // White background with subtle grid
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw subtle grid lines
    context.strokeStyle = '#f0f0f0';
    context.lineWidth = 0.5;
    const gridSize = 20;
    for (let x = 0; x <= rect.width; x += gridSize) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, rect.height);
      context.stroke();
    }
    for (let y = 0; y <= rect.height; y += gridSize) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(rect.width, y);
      context.stroke();
    }
    
    // Reset stroke settings
    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;
    
    contextRef.current = context;
    saveState();
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = tool === 'eraser' ? '#ffffff' : brushColor;
      contextRef.current.lineWidth = tool === 'eraser' ? brushSize * 4 : brushSize;
    }
  }, [brushSize, brushColor, tool]);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imageData = canvas.toDataURL();
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      if (newHistory.length > 30) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 29));
  }, [historyIndex]);

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
    const rect = canvas.getBoundingClientRect();
    
    // Clear and redraw grid
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.strokeStyle = '#f0f0f0';
    context.lineWidth = 0.5;
    const gridSize = 20;
    for (let x = 0; x <= rect.width; x += gridSize) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, rect.height);
      context.stroke();
    }
    for (let y = 0; y <= rect.height; y += gridSize) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(rect.width, y);
      context.stroke();
    }
    
    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;
    
    setHasContent(false);
    setCanvasImage(null);
    if (onClearResult) onClearResult();
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
    setCanvasImage(imageData);
    onRecognize(imageData);
  };

  const copyResultImage = async () => {
    if (!recognitionResult?.latex) return;
    
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = `https://latex.codecogs.com/png.latex?\\dpi{200}\\bg_white ${encodeURIComponent(recognitionResult.latex)}`;
      
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(async (blob) => {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch (e) {
            // Fallback: copy LaTeX
            await navigator.clipboard.writeText(recognitionResult.latex);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        }, 'image/png');
      };
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const downloadResultImage = () => {
    if (!recognitionResult?.latex) return;
    
    const link = document.createElement('a');
    link.href = `https://latex.codecogs.com/png.latex?\\dpi{300}\\bg_white ${encodeURIComponent(recognitionResult.latex)}`;
    link.download = 'equation.png';
    link.click();
  };

  const copyHandwritingImage = async () => {
    if (!canvasImage) return;
    
    try {
      const response = await fetch(canvasImage);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const colors = ['#000000', '#1e40af', '#dc2626', '#16a34a', '#9333ea', '#ea580c'];

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
              title={language === 'fr' ? 'Stylo' : 'Pen'}
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
              title={language === 'fr' ? 'Gomme' : 'Eraser'}
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
              max={12}
              step={1}
              className="w-28"
            />
            <Plus className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500 w-4">{brushSize}</span>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-1.5 px-2">
            {colors.map((color) => (
              <button
                key={color}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
                  brushColor === color 
                    ? "border-white scale-110 ring-2 ring-[#6366f1]" 
                    : "border-gray-600"
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
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 text-gray-400 hover:text-white"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
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
            {language === 'fr' ? 'Effacer' : 'Clear'}
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
                {language === 'fr' ? 'Analyse...' : 'Analyzing...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Reconnaître' : 'Recognize'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex gap-4 p-4 min-h-0">
        {/* Canvas */}
        <div className={cn("flex flex-col min-w-0", recognitionResult ? "flex-1" : "flex-1")}>
          <div className="flex-1 bg-white rounded-lg overflow-hidden shadow-lg border-2 border-[#30363d] min-h-0">
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
              data-testid="handwriting-canvas"
            />
          </div>
          <p className="text-center text-xs text-gray-500 mt-2 flex-shrink-0">
            {language === 'fr' 
              ? 'Dessinez votre équation mathématique' 
              : 'Draw your mathematical equation'}
          </p>
        </div>

        {/* Recognition Result Panel */}
        {recognitionResult && (
          <Card className="w-80 bg-[#161b22] border-[#30363d] flex flex-col">
            <div className="p-3 border-b border-[#30363d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6366f1]" />
                <span className="font-medium text-sm">
                  {language === 'fr' ? 'Résultat' : 'Result'}
                </span>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                {Math.round(recognitionResult.confidence * 100)}%
              </Badge>
            </div>
            
            <CardContent className="p-3 flex-1 flex flex-col gap-3">
              {/* Handwriting snapshot */}
              {canvasImage && (
                <div className="relative group">
                  <p className="text-xs text-gray-500 mb-1">
                    {language === 'fr' ? 'Écriture' : 'Handwriting'}
                  </p>
                  <div className="bg-white rounded-lg p-2 border border-[#30363d]">
                    <img 
                      src={canvasImage} 
                      alt="Handwriting" 
                      className="w-full h-16 object-contain"
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-6 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 bg-[#21262d]/80 hover:bg-[#21262d]"
                    onClick={copyHandwritingImage}
                    title={language === 'fr' ? 'Copier image' : 'Copy image'}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {/* Recognized equation */}
              <div className="relative group">
                <p className="text-xs text-gray-500 mb-1">
                  {language === 'fr' ? 'Équation reconnue' : 'Recognized equation'}
                </p>
                <div className="bg-white rounded-lg p-3 border border-[#30363d] min-h-[60px] flex items-center justify-center">
                  <img 
                    ref={resultImageRef}
                    src={`https://latex.codecogs.com/png.latex?\\dpi{150}\\bg_white ${encodeURIComponent(recognitionResult.latex)}`}
                    alt="Equation"
                    className="max-w-full max-h-12"
                  />
                </div>
              </div>

              {/* LaTeX code */}
              <div>
                <p className="text-xs text-gray-500 mb-1">LaTeX</p>
                <div className="bg-[#0d1117] rounded-lg p-2 border border-[#30363d]">
                  <code className="text-xs text-green-400 break-all">
                    {recognitionResult.latex}
                  </code>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-auto pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-[#30363d] bg-[#21262d] hover:bg-[#30363d] text-xs"
                  onClick={copyResultImage}
                >
                  {copied ? (
                    <Check className="w-3 h-3 mr-1 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3 mr-1" />
                  )}
                  {language === 'fr' ? 'Copier image' : 'Copy image'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-[#30363d] bg-[#21262d] hover:bg-[#30363d] text-xs"
                  onClick={downloadResultImage}
                >
                  <Download className="w-3 h-3 mr-1" />
                  {language === 'fr' ? 'Télécharger' : 'Download'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HandwritingCanvas;
