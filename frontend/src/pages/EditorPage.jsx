import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Save, 
  Trash2, 
  Eye, 
  Code, 
  Download,
  Clock,
  FileText,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Table,
  Quote,
  Heading1,
  Heading2,
  Sigma
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { mockNotes } from '../data/mock';
import { cn } from '../lib/utils';

const EditorPage = () => {
  const [notes, setNotes] = useState(mockNotes);
  const [selectedNote, setSelectedNote] = useState(mockNotes[0]);
  const [viewMode, setViewMode] = useState('split');
  const [isSaving, setIsSaving] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');

  const handleContentChange = (content) => {
    if (!selectedNote) return;
    
    const updatedNote = {
      ...selectedNote,
      content,
      updatedAt: new Date().toISOString()
    };
    
    setSelectedNote(updatedNote);
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const handleTitleChange = (title) => {
    if (!selectedNote) return;
    
    const updatedNote = {
      ...selectedNote,
      title,
      updatedAt: new Date().toISOString()
    };
    
    setSelectedNote(updatedNote);
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
  };

  const handleCreateNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: newNoteTitle || 'Nouvelle Note',
      content: '# Nouvelle Note\n\nCommencez à écrire ici...\n\n## Équations\n\n$$E = mc^2$$',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setNotes(prev => [newNote, ...prev]);
    setSelectedNote(newNote);
    setNewNoteTitle('');
  };

  const handleDeleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(notes[0] || null);
    }
  };

  const insertMarkdown = (syntax) => {
    if (!selectedNote) return;
    
    const insertions = {
      bold: '**texte en gras**',
      italic: '*texte en italique*',
      h1: '\n# Titre 1\n',
      h2: '\n## Titre 2\n',
      list: '\n- Élément 1\n- Élément 2\n- Élément 3\n',
      orderedList: '\n1. Premier\n2. Deuxième\n3. Troisième\n',
      link: '[texte du lien](https://exemple.com)',
      image: '![alt text](url-image)',
      table: '\n| Colonne 1 | Colonne 2 |\n|-----------|-----------|\n| Cellule 1 | Cellule 2 |\n',
      quote: '\n> Citation\n',
      math: '\n$$\\int_a^b f(x)\\,dx$$\n',
      inlineMath: '$x^2 + y^2 = z^2$'
    };
    
    handleContentChange(selectedNote.content + insertions[syntax]);
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

  // Simple markdown renderer (for demo)
  const renderMarkdown = (content) => {
    if (!content) return '';
    
    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 text-[#a5b4fc]">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4 text-white">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Block math
      .replace(/\$\$(.*?)\$\$/gs, (match, p1) => {
        return `<div class="my-4 p-3 bg-white rounded-lg text-center"><img src="https://latex.codecogs.com/png.latex?\\dpi{120}${encodeURIComponent(p1.trim())}" alt="equation" class="mx-auto" /></div>`;
      })
      // Inline math
      .replace(/\$(.*?)\$/g, (match, p1) => {
        return `<img src="https://latex.codecogs.com/png.latex?${encodeURIComponent(p1)}" alt="equation" class="inline align-middle" style="height: 1.2em;" />`;
      })
      // Lists
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
      // Line breaks
      .replace(/\n/g, '<br />');
    
    return html;
  };

  const toolbarButtons = [
    { icon: Bold, action: 'bold', tooltip: 'Gras' },
    { icon: Italic, action: 'italic', tooltip: 'Italique' },
    { icon: Heading1, action: 'h1', tooltip: 'Titre 1' },
    { icon: Heading2, action: 'h2', tooltip: 'Titre 2' },
    { icon: List, action: 'list', tooltip: 'Liste' },
    { icon: ListOrdered, action: 'orderedList', tooltip: 'Liste numérotée' },
    { icon: Quote, action: 'quote', tooltip: 'Citation' },
    { icon: LinkIcon, action: 'link', tooltip: 'Lien' },
    { icon: ImageIcon, action: 'image', tooltip: 'Image' },
    { icon: Table, action: 'table', tooltip: 'Tableau' },
    { icon: Sigma, action: 'math', tooltip: 'Équation' },
  ];

  return (
    <div className="flex h-full">
      {/* Notes List Sidebar */}
      <div className="w-72 border-r border-[#21262d] bg-[#0d1117] flex flex-col">
        <div className="p-4 border-b border-[#21262d]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Notes</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#6366f1] hover:bg-[#5558e3]">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#161b22] border-[#30363d]">
                <DialogHeader>
                  <DialogTitle>Nouvelle Note</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Titre de la note"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="bg-[#0d1117] border-[#30363d]"
                  />
                  <Button onClick={handleCreateNote} className="w-full bg-[#6366f1] hover:bg-[#5558e3]">
                    Créer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-sm text-gray-500">{notes.length} notes</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {notes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-all group",
                  selectedNote?.id === note.id
                    ? "bg-[#6366f1]/20 border border-[#6366f1]/30"
                    : "hover:bg-[#21262d]"
                )}
                onClick={() => setSelectedNote(note)}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-sm truncate flex-1">{note.title}</h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-6 h-6 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(note.updatedAt)}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#21262d]">
              <Input
                value={selectedNote.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-xl font-bold bg-transparent border-none focus-visible:ring-0 px-0 max-w-md"
              />
              <div className="flex items-center gap-2">
                <Tabs value={viewMode} onValueChange={setViewMode}>
                  <TabsList className="bg-[#21262d] border border-[#30363d]">
                    <TabsTrigger value="edit" className="data-[state=active]:bg-[#6366f1]">
                      <Code className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="split" className="data-[state=active]:bg-[#6366f1]">
                      <FileText className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="data-[state=active]:bg-[#6366f1]">
                      <Eye className="w-4 h-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button
                  onClick={handleSave}
                  className="bg-[#6366f1] hover:bg-[#5558e3]"
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
                <Button variant="outline" className="border-[#30363d]">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-[#21262d] bg-[#0d1117]">
              {toolbarButtons.map((btn, idx) => {
                const Icon = btn.icon;
                return (
                  <Button
                    key={idx}
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 text-gray-400 hover:text-white hover:bg-[#21262d]"
                    onClick={() => insertMarkdown(btn.action)}
                    title={btn.tooltip}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                );
              })}
            </div>

            {/* Editor Content */}
            <div className="flex-1 flex overflow-hidden">
              {(viewMode === 'edit' || viewMode === 'split') && (
                <div className={cn("flex-1 flex flex-col", viewMode === 'split' && "border-r border-[#21262d]")}>
                  <Textarea
                    value={selectedNote.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="flex-1 resize-none bg-[#0d1117] border-none rounded-none focus-visible:ring-0 font-mono text-sm p-4"
                    placeholder="Commencez à écrire en Markdown..."
                  />
                </div>
              )}
              
              {(viewMode === 'preview' || viewMode === 'split') && (
                <ScrollArea className="flex-1">
                  <div 
                    className="p-6 prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedNote.content) }}
                  />
                </ScrollArea>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Sélectionnez une note ou créez-en une nouvelle</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPage;