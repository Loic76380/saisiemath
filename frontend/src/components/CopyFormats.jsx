import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  FileCode, 
  FileText, 
  Image as ImageIcon,
  Download,
  Clipboard
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './ui/dropdown-menu';
import { toast } from '../hooks/use-toast';
import { cn } from '../lib/utils';

// MathML templates for Word compatibility
const latexToMathML = (latex) => {
  // Simplified conversion - in production would use a proper library
  const escaped = latex
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<math xmlns="http://www.w3.org/1998/Math/MathML">
  <mrow>
    <annotation encoding="LaTeX">${escaped}</annotation>
  </mrow>
</math>`;
};

// Convert to plain text representation
const latexToPlainText = (latex) => {
  return latex
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
    .replace(/\\int/g, '∫')
    .replace(/\\sum/g, 'Σ')
    .replace(/\\prod/g, 'Π')
    .replace(/\\infty/g, '∞')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\pi/g, 'π')
    .replace(/\\theta/g, 'θ')
    .replace(/\\pm/g, '±')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\^\{([^}]+)\}/g, '^($1)')
    .replace(/_\{([^}]+)\}/g, '_($1)')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}]/g, '');
};

const CopyFormats = ({ latex, className }) => {
  const [copiedFormat, setCopiedFormat] = useState(null);

  const copyToClipboard = async (text, format, mimeType = 'text/plain') => {
    try {
      // Try using the modern Clipboard API with multiple formats
      if (navigator.clipboard && navigator.clipboard.write) {
        const items = [];
        
        // Always include plain text
        const textBlob = new Blob([text], { type: 'text/plain' });
        items.push(new ClipboardItem({ 'text/plain': textBlob }));
        
        await navigator.clipboard.write(items);
      } else {
        // Fallback to execCommand
        await navigator.clipboard.writeText(text);
      }
      
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
      
      return true;
    } catch (err) {
      console.error('Copy failed:', err);
      // Last resort fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
      return true;
    }
  };

  const copyFormats = [
    {
      id: 'latex',
      label: 'LaTeX',
      description: 'Pour Overleaf, LaTeX editors',
      icon: FileCode,
      action: () => copyToClipboard(latex, 'latex')
    },
    {
      id: 'latex-inline',
      label: 'LaTeX (inline)',
      description: 'Avec délimiteurs $...$',
      icon: FileCode,
      action: () => copyToClipboard(`$${latex}$`, 'latex-inline')
    },
    {
      id: 'latex-block',
      label: 'LaTeX (block)',
      description: 'Avec délimiteurs $$...$$',
      icon: FileCode,
      action: () => copyToClipboard(`$$${latex}$$`, 'latex-block')
    },
    {
      id: 'mathml',
      label: 'MathML (Word)',
      description: 'Compatible Microsoft Word',
      icon: FileText,
      action: () => copyToClipboard(latexToMathML(latex), 'mathml')
    },
    {
      id: 'text',
      label: 'Texte Unicode',
      description: 'Pour OneNote, emails',
      icon: Clipboard,
      action: () => copyToClipboard(latexToPlainText(latex), 'text')
    }
  ];

  const handleCopyImage = async () => {
    try {
      // Create image from LaTeX
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = `https://latex.codecogs.com/png.latex?\\dpi{200}\\bg_white ${encodeURIComponent(latex)}`;
      
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
            setCopiedFormat('image');
            setTimeout(() => setCopiedFormat(null), 2000);
          } catch (e) {
            console.error('Image copy failed:', e);
          }
        }, 'image/png');
      };
    } catch (err) {
      console.error('Image copy failed:', err);
    }
  };

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = `https://latex.codecogs.com/png.latex?\\dpi{300}\\bg_white ${encodeURIComponent(latex)}`;
    link.download = 'equation.png';
    link.click();
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Quick copy LaTeX */}
      <Button
        size="sm"
        variant="outline"
        className="border-[#30363d] bg-[#21262d] hover:bg-[#30363d]"
        onClick={() => copyToClipboard(latex, 'latex')}
      >
        {copiedFormat === 'latex' ? (
          <Check className="w-4 h-4 mr-2 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 mr-2" />
        )}
        LaTeX
      </Button>

      {/* Dropdown for all formats */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="border-[#30363d] bg-[#21262d] hover:bg-[#30363d]"
          >
            <Clipboard className="w-4 h-4 mr-2" />
            Copier vers...
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#161b22] border-[#30363d] w-64">
          <DropdownMenuLabel>Formats de copie</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[#30363d]" />
          
          {copyFormats.map((format) => {
            const Icon = format.icon;
            return (
              <DropdownMenuItem
                key={format.id}
                className="cursor-pointer focus:bg-[#21262d]"
                onClick={format.action}
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon className="w-4 h-4 text-[#6366f1]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{format.label}</p>
                    <p className="text-xs text-gray-500">{format.description}</p>
                  </div>
                  {copiedFormat === format.id && (
                    <Check className="w-4 h-4 text-green-400" />
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}
          
          <DropdownMenuSeparator className="bg-[#30363d]" />
          <DropdownMenuLabel>Image</DropdownMenuLabel>
          
          <DropdownMenuItem
            className="cursor-pointer focus:bg-[#21262d]"
            onClick={handleCopyImage}
          >
            <div className="flex items-center gap-3 w-full">
              <ImageIcon className="w-4 h-4 text-[#6366f1]" />
              <div className="flex-1">
                <p className="text-sm font-medium">Copier image</p>
                <p className="text-xs text-gray-500">PNG haute résolution</p>
              </div>
              {copiedFormat === 'image' && (
                <Check className="w-4 h-4 text-green-400" />
              )}
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem
            className="cursor-pointer focus:bg-[#21262d]"
            onClick={handleDownloadImage}
          >
            <div className="flex items-center gap-3 w-full">
              <Download className="w-4 h-4 text-[#6366f1]" />
              <div className="flex-1">
                <p className="text-sm font-medium">Télécharger image</p>
                <p className="text-xs text-gray-500">Sauvegarder en PNG</p>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CopyFormats;