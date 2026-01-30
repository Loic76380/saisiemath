import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Camera, 
  FileText, 
  Edit3, 
  Search, 
  Settings, 
  Menu, 
  X,
  ChevronLeft,
  Zap,
  FolderOpen,
  PenTool,
  Wifi,
  WifiOff,
  Database
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';
import { useOffline } from '../hooks/useOffline';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { isOnline } = useOffline();

  const navItems = [
    { path: '/', icon: Camera, label: 'Snip', description: 'Capture & OCR' },
    { path: '/documents', icon: FileText, label: 'Documents', description: 'PDF Conversion' },
    { path: '/editor', icon: Edit3, label: 'Editor', description: 'Markdown Notes' },
    { path: '/search', icon: Search, label: 'Search', description: 'Find equations' },
  ];

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
          })})
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-[#21262d]">
          <Link
            to="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-[#21262d] hover:text-white transition-all",
              location.pathname === '/settings' && "bg-[#21262d] text-white"
            )}
          >
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">Settings</span>}
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