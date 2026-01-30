import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Loader2, 
  Check, 
  X,
  Eye,
  Trash2,
  FileCode,
  FileType,
  File,
  Clock,
  HardDrive
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { ScrollArea } from '../components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { mockDocuments, simulatePDFConversion } from '../data/mock';
import { cn } from '../lib/utils';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState(mockDocuments);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [conversionResult, setConversionResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newDoc = {
      id: Date.now().toString(),
      name: file.name,
      type: 'pdf',
      pages: Math.floor(Math.random() * 20) + 5,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      convertedAt: new Date().toISOString(),
      status: 'processing',
      preview: 'Converting document...'
    };

    setDocuments(prev => [newDoc, ...prev]);
    setIsConverting(true);
    setConversionProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setConversionProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      const result = await simulatePDFConversion(newDoc.pages, 3000);
      setConversionProgress(100);
      
      setDocuments(prev => prev.map(doc => 
        doc.id === newDoc.id 
          ? { ...doc, status: 'converted', preview: result.preview }
          : doc
      ));
      setConversionResult(result);
    } catch (error) {
      console.error('Conversion failed:', error);
      setDocuments(prev => prev.map(doc => 
        doc.id === newDoc.id 
          ? { ...doc, status: 'failed' }
          : doc
      ));
    } finally {
      clearInterval(progressInterval);
      setIsConverting(false);
    }
  };

  const handleDelete = (id) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    if (selectedDoc?.id === id) {
      setSelectedDoc(null);
    }
  };

  const exportFormats = [
    { id: 'latex', label: 'LaTeX', icon: FileCode, ext: '.tex' },
    { id: 'markdown', label: 'Markdown', icon: FileType, ext: '.md' },
    { id: 'docx', label: 'Word', icon: File, ext: '.docx' },
    { id: 'html', label: 'HTML', icon: FileText, ext: '.html' },
  ];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Conversion de Documents</h1>
          <p className="text-gray-400">Convertissez vos PDFs en LaTeX, Markdown, DOCX et plus</p>
        </div>

        {/* Upload Area */}
        <Card className="bg-[#161b22] border-[#30363d] mb-6">
          <CardContent className="p-6">
            <div 
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                "hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5",
                isConverting ? "border-[#6366f1] bg-[#6366f1]/10" : "border-[#30363d]"
              )}
              onClick={() => !isConverting && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf"
                className="hidden"
              />
              
              {isConverting ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-[#6366f1] animate-spin" />
                  <p className="text-[#6366f1] font-medium">Conversion en cours...</p>
                  <div className="w-64">
                    <Progress value={conversionProgress} className="h-2 bg-[#21262d]" />
                  </div>
                  <p className="text-sm text-gray-500">{Math.round(conversionProgress)}% terminé</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#21262d] flex items-center justify-center">
                    <Upload className="w-8 h-8 text-[#6366f1]" />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">Glissez un PDF ou cliquez pour télécharger</p>
                    <p className="text-sm text-gray-500">Supporte les PDFs imprimés et manuscrits</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Conversion Result */}
        {conversionResult && (
          <Card className="bg-[#161b22] border-[#30363d] mb-6">
            <CardHeader className="border-b border-[#30363d]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversion Réussie</CardTitle>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Check className="w-3 h-3 mr-1" /> Complété
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <Button
                      key={format.id}
                      variant="outline"
                      className="bg-[#21262d] border-[#30363d] hover:bg-[#30363d] hover:border-[#6366f1] flex flex-col h-auto py-4"
                    >
                      <Icon className="w-6 h-6 mb-2 text-[#6366f1]" />
                      <span className="text-sm">{format.label}</span>
                      <span className="text-xs text-gray-500">{format.ext}</span>
                    </Button>
                  );
                })}
              </div>

              <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">Aperçu du contenu</p>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {conversionResult.preview}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents List */}
        <Card className="bg-[#161b22] border-[#30363d] flex-1">
          <CardHeader className="border-b border-[#30363d]">
            <CardTitle className="text-lg">Documents Récents</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px]">
              <div className="divide-y divide-[#21262d]">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={cn(
                      "flex items-center gap-4 p-4 hover:bg-[#21262d]/50 cursor-pointer transition-colors",
                      selectedDoc?.id === doc.id && "bg-[#21262d]"
                    )}
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-red-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{doc.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" /> {doc.pages} pages
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3" /> {doc.size}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDate(doc.convertedAt)}
                        </span>
                      </div>
                    </div>

                    <Badge 
                      className={cn(
                        "flex-shrink-0",
                        doc.status === 'converted' && "bg-green-500/20 text-green-400 border-green-500/30",
                        doc.status === 'processing' && "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                        doc.status === 'failed' && "bg-red-500/20 text-red-400 border-red-500/30"
                      )}
                    >
                      {doc.status === 'converted' && <Check className="w-3 h-3 mr-1" />}
                      {doc.status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                      {doc.status === 'failed' && <X className="w-3 h-3 mr-1" />}
                      {doc.status}
                    </Badge>

                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-gray-500 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDoc(doc);
                          setPreviewOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-gray-500 hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(doc.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="bg-[#161b22] border-[#30363d] max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedDoc?.name}</DialogTitle>
          </DialogHeader>
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 max-h-[400px] overflow-auto">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">
              {selectedDoc?.preview}
            </pre>
          </div>
          <div className="flex gap-2 justify-end">
            {exportFormats.map((format) => (
              <Button
                key={format.id}
                variant="outline"
                size="sm"
                className="bg-[#21262d] border-[#30363d]"
              >
                <Download className="w-4 h-4 mr-2" />
                {format.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsPage;