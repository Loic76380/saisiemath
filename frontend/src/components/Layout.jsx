import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Camera, 
  FileText, 
  Edit3, 
  Search, 
  Settings, 
  Menu, 
  ChevronLeft,
  Zap,
  Wifi,
  WifiOff,
  Globe
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { useOffline } from '../hooks/useOffline';
import { useLanguage } from '../i18n/LanguageContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { isOnline } = useOffline();
  const { t, language, changeLanguage } = useLanguage();

  const navItems = [
    { path: '/', icon: Camera, label: t('nav.snip'), description: t('nav.captureOcr') },
    { path: '/documents', icon: FileText, label: t('nav.documents'), description: t('nav.pdfConversion') },
    { path: '/editor', icon: Edit3, label: t('nav.editor'), description: t('nav.markdownNotes') },
    { path: '/search', icon: Search, label: t('nav.search'), description: t('nav.findEquations') },
  ];

  const toggleLanguage = () => {
    changeLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <div className="flex h-screen bg-[#0d1117] text-white overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "flex flex-col border-r border-[#21262d] bg-[#010409] transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-[#21262d]">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">MathSnip</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white hover:bg-[#21262d]"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-[#6366f1]/20 text-[#a5b4fc] border border-[#6366f1]/30" 
                    : "text-gray-400 hover:bg-[#21262d] hover:text-white"
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-[#818cf8]")} />
                {sidebarOpen && (
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{item.label}</span>
                    <span className="text-xs text-gray-500">{item.description}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-[#21262d] space-y-2">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all",
              "bg-[#21262d]/50 text-gray-300 hover:bg-[#21262d] hover:text-white"
            )}
          >
            <Globe className="w-4 h-4" />
            {sidebarOpen ? (
              <div className="flex items-center justify-between flex-1">
                <span>{language === 'fr' ? 'Français' : 'English'}</span>
                <span className="text-xs px-2 py-0.5 bg-[#6366f1]/20 text-[#a5b4fc] rounded">
                  {language.toUpperCase()}
                </span>
              </div>
            ) : (
              <span className="sr-only">{language === 'fr' ? 'Français' : 'English'}</span>
            )}
          </button>

          {/* Offline indicator */}
          {sidebarOpen && (
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
              isOnline 
                ? "bg-green-500/10 text-green-400" 
                : "bg-yellow-500/10 text-yellow-400"
            )}>
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>{t('status.online')}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <div className="flex-1">
                    <span>{t('status.offline')}</span>
                    <p className="text-xs opacity-70">{t('status.offlineData')}</p>
                  </div>
                </>
              )}
            </div>
          )}
          
          {!sidebarOpen && (
            <div className={cn(
              "flex items-center justify-center p-2 rounded-lg",
              isOnline ? "text-green-400" : "text-yellow-400"
            )}>
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
          )}
          
          <Link
            to="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-[#21262d] hover:text-white transition-all",
              location.pathname === '/settings' && "bg-[#21262d] text-white"
            )}
          >
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">{t('nav.settings')}</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default Layout;
