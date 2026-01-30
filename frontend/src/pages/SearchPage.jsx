import React, { useState, useMemo } from 'react';
import { 
  Search as SearchIcon, 
  Filter, 
  Clock, 
  FileText,
  Image as ImageIcon,
  PenTool,
  Copy,
  Check,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Checkbox } from '../components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { mockSnips, mockNotes, mockDocuments } from '../data/mock';
import { cn } from '../lib/utils';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [filters, setFilters] = useState({
    snips: true,
    notes: true,
    documents: true
  });

  const allItems = useMemo(() => {
    const items = [];
    
    if (filters.snips) {
      mockSnips.forEach(snip => {
        items.push({
          id: snip.id,
          type: 'snip',
          title: snip.title,
          content: snip.latex,
          source: snip.source,
          date: snip.createdAt,
          latex: snip.latex
        });
      });
    }
    
    if (filters.notes) {
      mockNotes.forEach(note => {
        items.push({
          id: note.id,
          type: 'note',
          title: note.title,
          content: note.content.substring(0, 200) + '...',
          date: note.updatedAt
        });
      });
    }
    
    if (filters.documents) {
      mockDocuments.forEach(doc => {
        items.push({
          id: doc.id,
          type: 'document',
          title: doc.name,
          content: doc.preview,
          date: doc.convertedAt,
          pages: doc.pages
        });
      });
    }
    
    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filters]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems;
    
    const query = searchQuery.toLowerCase();
    return allItems.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      (item.latex && item.latex.toLowerCase().includes(query))
    );
  }, [searchQuery, allItems]);

  const handleCopy = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'snip': return ImageIcon;
      case 'note': return PenTool;
      case 'document': return FileText;
      default: return FileText;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'snip': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'note': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'document': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-[#6366f1]/30 text-white rounded px-0.5">{part}</mark>
        : part
    );
  };

  return (
    <div className="flex-1 p-6 flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Recherche</h1>
        <p className="text-gray-400">Recherchez dans vos équations, notes et documents</p>
      </div>

      {/* Search Bar */}
      <Card className="bg-[#161b22] border-[#30363d] mb-6">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                placeholder="Rechercher par LaTeX, texte ou nom de fichier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#0d1117] border-[#30363d] h-12 text-base"
              />
              {searchQuery && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 hover:text-white"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-[#30363d] bg-[#21262d] h-12">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filtres
                </Button>
              </PopoverTrigger>
              <PopoverContent className="bg-[#161b22] border-[#30363d] w-56">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Types de contenu</h4>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.snips}
                      onCheckedChange={(checked) => setFilters(f => ({ ...f, snips: checked }))}
                    />
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Snips ({mockSnips.length})</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.notes}
                      onCheckedChange={(checked) => setFilters(f => ({ ...f, notes: checked }))}
                    />
                    <PenTool className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">Notes ({mockNotes.length})</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.documents}
                      onCheckedChange={(checked) => setFilters(f => ({ ...f, documents: checked }))}
                    />
                    <FileText className="w-4 h-4 text-orange-400" />
                    <span className="text-sm">Documents ({mockDocuments.length})</span>
                  </label>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Quick search suggestions */}
          <div className="flex gap-2 mt-3">
            <span className="text-xs text-gray-500">Exemples:</span>
            {['\\frac', '\\int', 'matrix', 'derivative'].map((term) => (
              <Button
                key={term}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-gray-400 hover:text-white bg-[#21262d]"
                onClick={() => setSearchQuery(term)}
              >
                {term}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="bg-[#161b22] border-[#30363d] flex-1">
        <CardHeader className="border-b border-[#30363d] py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {filteredItems.length} résultat{filteredItems.length !== 1 ? 's' : ''}
              {searchQuery && ` pour "${searchQuery}"`}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-380px)]">
            <div className="divide-y divide-[#21262d]">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const TypeIcon = getTypeIcon(item.type);
                  return (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="p-4 hover:bg-[#21262d]/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          getTypeColor(item.type)
                        )}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">
                              {highlightMatch(item.title, searchQuery)}
                            </h3>
                            <Badge variant="outline" className={cn("text-xs", getTypeColor(item.type))}>
                              {item.type}
                            </Badge>
                            {item.source && (
                              <Badge variant="outline" className="text-xs border-[#30363d] text-gray-500">
                                {item.source}
                              </Badge>
                            )}
                          </div>
                          
                          {item.type === 'snip' && item.latex && (
                            <div className="bg-white rounded p-2 mb-2 inline-block">
                              <img 
                                src={`https://latex.codecogs.com/png.latex?\\dpi{100} ${encodeURIComponent(item.latex)}`}
                                alt={item.title}
                                className="max-h-8"
                              />
                            </div>
                          )}
                          
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {highlightMatch(item.content, searchQuery)}
                          </p>
                          
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(item.date)}
                            </span>
                            {item.pages && (
                              <span>{item.pages} pages</span>
                            )}
                          </div>
                        </div>

                        {item.latex && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-500 hover:text-white"
                            onClick={() => handleCopy(item.latex, item.id)}
                          >
                            {copiedId === item.id ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Aucun résultat trouvé</p>
                  <p className="text-sm mt-1">Essayez d'autres termes de recherche</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchPage;