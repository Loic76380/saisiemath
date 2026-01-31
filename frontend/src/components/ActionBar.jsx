import React, { useState, useRef, useEffect } from 'react';
import { Copy, Image, Check, ChevronDown } from 'lucide-react';
import html2canvas from 'html2canvas';
import katex from 'katex';

const ActionBar = ({ latex }) => {
  const [showTextMenu, setShowTextMenu] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [copied, setCopied] = useState(null);
  const [toast, setToast] = useState(null);
  const textMenuRef = useRef(null);
  const imageMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (textMenuRef.current && !textMenuRef.current.contains(e.target)) {
        setShowTextMenu(false);
      }
      if (imageMenuRef.current && !imageMenuRef.current.contains(e.target)) {
        setShowImageMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const copyText = async (format) => {
    if (!latex) return;

    let textToCopy = latex;
    let formatLabel = 'LaTeX';

    switch (format) {
      case 'latex':
        textToCopy = latex;
        formatLabel = 'LaTeX';
        break;
      case 'mathml':
        try {
          textToCopy = katex.renderToString(latex, { output: 'mathml' });
        } catch {
          textToCopy = `<math><annotation encoding="LaTeX">${latex}</annotation></math>`;
        }
        formatLabel = 'MathML';
        break;
      case 'word':
        textToCopy = `\\(${latex}\\)`;
        formatLabel = 'Word';
        break;
      default:
        textToCopy = latex;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied('text');
      setTimeout(() => setCopied(null), 2000);
      showToast(`${formatLabel} copié !`);
    } catch (error) {
      console.error('Erreur copie:', error);
      showToast('Erreur lors de la copie');
    }

    setShowTextMenu(false);
  };

  const copyImage = async (format = 'png', transparent = false) => {
    if (!latex) return;

    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = `
      position: absolute;
      left: -9999px;
      padding: 20px;
      background: ${transparent ? 'transparent' : 'white'};
      font-size: 32px;
    `;
    document.body.appendChild(tempDiv);

    try {
      katex.render(latex, tempDiv, {
        throwOnError: false,
        displayMode: true,
      });

      const canvas = await html2canvas(tempDiv, {
        backgroundColor: transparent ? null : '#ffffff',
        scale: 2,
      });

      if (format === 'png') {
        try {
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopied('image');
          setTimeout(() => setCopied(null), 2000);
          showToast('Image copiée !');
        } catch {
          const link = document.createElement('a');
          link.download = 'formule.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
          showToast('Image téléchargée');
        }
      } else if (format === 'svg') {
        const svgString = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: KaTeX_Main; font-size: 32px; padding: 20px;">
                ${tempDiv.innerHTML}
              </div>
            </foreignObject>
          </svg>
        `;
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.download = 'formule.svg';
        link.href = URL.createObjectURL(blob);
        link.click();
        showToast('SVG téléchargé');
      }
    } catch (error) {
      console.error('Erreur image:', error);
      showToast('Erreur lors de la copie image');
    } finally {
      document.body.removeChild(tempDiv);
      setShowImageMenu(false);
    }
  };

  return (
    <>
      <div className="action-bar">
        <div className="dropdown" ref={textMenuRef}>
          <button 
            className={`action-btn ${copied === 'text' ? 'success' : ''}`}
            onClick={() => setShowTextMenu(!showTextMenu)}
            disabled={!latex}
          >
            {copied === 'text' ? <Check size={16} /> : <Copy size={16} />}
            Copier texte
            <ChevronDown size={14} />
          </button>
          
          {showTextMenu && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={() => copyText('latex')}>
                LaTeX
              </button>
              <button className="dropdown-item" onClick={() => copyText('mathml')}>
                MathML
              </button>
              <button className="dropdown-item" onClick={() => copyText('word')}>
                Word / OneNote
              </button>
            </div>
          )}
        </div>

        <div className="dropdown" ref={imageMenuRef}>
          <button 
            className={`action-btn ${copied === 'image' ? 'success' : ''}`}
            onClick={() => setShowImageMenu(!showImageMenu)}
            disabled={!latex}
          >
            {copied === 'image' ? <Check size={16} /> : <Image size={16} />}
            Copier image
            <ChevronDown size={14} />
          </button>
          
          {showImageMenu && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={() => copyImage('png', false)}>
                PNG (fond blanc)
              </button>
              <button className="dropdown-item" onClick={() => copyImage('png', true)}>
                PNG (transparent)
              </button>
              <button className="dropdown-item" onClick={() => copyImage('svg')}>
                Télécharger SVG
              </button>
            </div>
          )}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
};

export default ActionBar;
