import React, { useState, useRef, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  Copy, 
  Check, 
  Loader2, 
  Image as ImageIcon,
  Trash2,
  Download,
  Clock,
  PenTool,
  FileImage
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { mockSnips, simulateOCR } from '../data/mock';
import { cn } from '../lib/utils';

const SnipPage = () => {
  const [snips, setSnips] = useState(mockSnips);
  const [selectedSnip, setSelectedSnip] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [copiedFormat, setCopiedFormat] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      setUploadedImage(event.target.result);
      setIsProcessing(true);
      setOcrResult(null);

      try {
        const result = await simulateOCR(2000);
        setOcrResult(result);
        
        // Add to snips collection
        const newSnip = {
          id: Date.now().toString(),
          title: `Snip ${snips.length + 1}`,
          latex: result.latex,
          markdown: `$${result.latex}$`,
          type: 'equation',
          createdAt: new Date().toISOString(),
          source: 'screenshot',
          thumbnail: event.target.result
        };
        setSnips(prev => [newSnip, ...prev]);
      } catch (error) {
        console.error('OCR failed:', error);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = async (text, format) => {
    await navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleDeleteSnip = (id) => {
    setSnips(prev => prev.filter(s => s.id !== id));
    if (selectedSnip?.id === id) {
      setSelectedSnip(null);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Capture Area */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Capture & OCR</h1>
          <p className="text-gray-400">Capturez des équations mathématiques et convertissez-les en LaTeX</p>
        </div>

        {/* Upload Area */}
        <Card className="bg-[#161b22] border-[#30363d] mb-6">
          <CardContent className="p-6">
            <div 
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                "hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5",
                isProcessing ? "border-[#6366f1] bg-[#6366f1]/10" : "border-[#30363d]"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              
              {isProcessing ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-[#6366f1] animate-spin" />
                  <p className="text-[#6366f1] font-medium">Analyse en cours...</p>
                  <p className="text-sm text-gray-500">Reconnaissance des équations mathématiques</p>
                </div>
              ) : uploadedImage ? (
                <div className="flex flex-col items-center gap-4">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded" 
                    className="max-h-48 rounded-lg border border-[#30363d]"
                  />
                  <p className="text-gray-400">Cliquez pour capturer une nouvelle image</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#21262d] flex items-center justify-center">
                    <Camera className="w-8 h-8 text-[#6366f1]" />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">Glissez une image ou cliquez pour télécharger</p>
                    <p className="text-sm text-gray-500">Supporte PNG, JPG, WEBP</p>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <Badge variant="outline" className="border-[#30363d] text-gray-400">
                      <Camera className="w-3 h-3 mr-1" /> Screenshot
                    </Badge>
                    <Badge variant="outline" className="border-[#30363d] text-gray-400">
                      <PenTool className="w-3 h-3 mr-1" /> Handwriting
                    </Badge>
                    <Badge variant="outline" className="border-[#30363d] text-gray-400">
                      <FileImage className="w-3 h-3 mr-1" /> PDF
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* OCR Result */}
        {ocrResult && (
          <Card className="bg-[#161b22] border-[#30363d] flex-1">
            <CardHeader className="border-b border-[#30363d]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Résultat OCR</CardTitle>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  {Math.round(ocrResult.confidence * 100)}% confiance
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Tabs defaultValue="latex" className="w-full">
                <TabsList className="bg-[#21262d] border border-[#30363d] mb-4">
                  <TabsTrigger value="latex" className="data-[state=active]:bg-[#6366f1]">LaTeX</TabsTrigger>
                  <TabsTrigger value="mathml" className="data-[state=active]:bg-[#6366f1]">MathML</TabsTrigger>
                  <TabsTrigger value="asciimath" className="data-[state=active]:bg-[#6366f1]">AsciiMath</TabsTrigger>
                  <TabsTrigger value="text" className="data-[state=active]:bg-[#6366f1]">Text</TabsTrigger>
                </TabsList>

                {Object.entries(ocrResult.formats).map(([format, content]) => (
                  <TabsContent key={format} value={format}>
                    <div className="relative">
                      <pre className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
                        {content}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        onClick={() => handleCopy(content, format)}
                      >
                        {copiedFormat === format ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              {/* Preview */}
              <div className="mt-4 p-4 bg-white rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Aperçu</p>
                <img 
                  src={`https://latex.codecogs.com/png.latex?\\dpi{150}\\bg_white ${encodeURIComponent(ocrResult.latex)}`}
                  alt="LaTeX preview"
                  className="max-w-full"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Panel - Snips Collection */}
      <div className="w-80 border-l border-[#21262d] bg-[#0d1117] flex flex-col">
        <div className="p-4 border-b border-[#21262d]">
          <h2 className="font-semibold mb-1">Collection</h2>
          <p className="text-sm text-gray-500">{snips.length} snips</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {snips.map((snip) => (
              <div
                key={snip.id}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all group",
                  selectedSnip?.id === snip.id
                    ? "bg-[#6366f1]/10 border-[#6366f1]/30"
                    : "bg-[#161b22] border-[#30363d] hover:border-[#6366f1]/30"
                )}
                onClick={() => setSelectedSnip(snip)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium truncate flex-1">{snip.title}</h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-6 h-6 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSnip(snip.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="bg-white rounded p-2 mb-2">
                  <img 
                    src={`https://latex.codecogs.com/png.latex?\\dpi{100} ${encodeURIComponent(snip.latex)}`}
                    alt={snip.title}
                    className="max-w-full h-8 object-contain"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs border-[#30363d]",
                      snip.source === 'screenshot' && "text-blue-400",
                      snip.source === 'handwriting' && "text-purple-400",
                      snip.source === 'pdf' && "text-orange-400"
                    )}
                  >
                    {snip.source}
                  </Badge>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(snip.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default SnipPage;