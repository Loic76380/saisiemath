import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Palette, 
  Keyboard, 
  Download,
  Globe,
  Bell,
  Shield,
  HelpCircle,
  ExternalLink,
  Moon,
  Sun,
  Monitor,
  Database,
  Upload,
  Trash2,
  HardDrive
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import * as storage from '../utils/offlineStorage';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    theme: 'dark',
    language: 'fr',
    defaultFormat: 'latex',
    autoSave: true,
    notifications: true,
    highContrast: false,
    compactMode: false
  });
  const [storageUsage, setStorageUsage] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadStorageUsage();
  }, []);

  const loadStorageUsage = async () => {
    const usage = await storage.getStorageUsage();
    setStorageUsage(usage);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await storage.exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mathsnip-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await storage.importAllData(data);
      alert('Données importées avec succès!');
      loadStorageUsage();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Erreur lors de l\'import des données');
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const shortcuts = [
    { action: 'Capturer écran', keys: ['Ctrl', 'Alt', 'M'] },
    { action: 'Nouvelle note', keys: ['Ctrl', 'N'] },
    { action: 'Rechercher', keys: ['Ctrl', 'K'] },
    { action: 'Sauvegarder', keys: ['Ctrl', 'S'] },
    { action: 'Copier LaTeX', keys: ['Ctrl', 'Shift', 'C'] },
  ];

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Paramètres</h1>
        <p className="text-gray-400">Gérez vos préférences et configurations</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#6366f1]/20 flex items-center justify-center">
                <User className="w-5 h-5 text-[#6366f1]" />
              </div>
              <div>
                <CardTitle className="text-lg">Profil</CardTitle>
                <CardDescription>Informations de votre compte</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-2xl font-bold">
                U
              </div>
              <div className="flex-1">
                <Input 
                  defaultValue="Utilisateur Demo" 
                  className="bg-[#0d1117] border-[#30363d] mb-2"
                />
                <Input 
                  defaultValue="demo@mathsnip.app" 
                  className="bg-[#0d1117] border-[#30363d]"
                  type="email"
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm font-medium">Plan actuel</p>
                <p className="text-xs text-gray-500">Accès gratuit avec limitations</p>
              </div>
              <Badge className="bg-[#6366f1]/20 text-[#6366f1] border-[#6366f1]/30">
                Free
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Palette className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Apparence</CardTitle>
                <CardDescription>Personnalisez l'interface</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Thème</Label>
                <p className="text-xs text-gray-500">Sélectionnez le thème de l'application</p>
              </div>
              <div className="flex gap-2">
                {[
                  { value: 'light', icon: Sun, label: 'Clair' },
                  { value: 'dark', icon: Moon, label: 'Sombre' },
                  { value: 'system', icon: Monitor, label: 'Système' },
                ].map((theme) => {
                  const Icon = theme.icon;
                  return (
                    <Button
                      key={theme.value}
                      variant={settings.theme === theme.value ? 'default' : 'outline'}
                      size="sm"
                      className={settings.theme === theme.value 
                        ? 'bg-[#6366f1] hover:bg-[#5558e3]' 
                        : 'border-[#30363d] bg-[#21262d]'
                      }
                      onClick={() => updateSetting('theme', theme.value)}
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {theme.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Separator className="bg-[#30363d]" />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Mode compact</Label>
                <p className="text-xs text-gray-500">Réduit l'espacement pour plus de contenu</p>
              </div>
              <Switch
                checked={settings.compactMode}
                onCheckedChange={(checked) => updateSetting('compactMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Contraste élevé</Label>
                <p className="text-xs text-gray-500">Améliore la lisibilité</p>
              </div>
              <Switch
                checked={settings.highContrast}
                onCheckedChange={(checked) => updateSetting('highContrast', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Préférences</CardTitle>
                <CardDescription>Options générales de l'application</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Langue</Label>
                <p className="text-xs text-gray-500">Langue de l'interface</p>
              </div>
              <Select value={settings.language} onValueChange={(v) => updateSetting('language', v)}>
                <SelectTrigger className="w-40 bg-[#21262d] border-[#30363d]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#161b22] border-[#30363d]">
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-[#30363d]" />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Format par défaut</Label>
                <p className="text-xs text-gray-500">Format de sortie pour les équations</p>
              </div>
              <Select value={settings.defaultFormat} onValueChange={(v) => updateSetting('defaultFormat', v)}>
                <SelectTrigger className="w-40 bg-[#21262d] border-[#30363d]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#161b22] border-[#30363d]">
                  <SelectItem value="latex">LaTeX</SelectItem>
                  <SelectItem value="mathml">MathML</SelectItem>
                  <SelectItem value="asciimath">AsciiMath</SelectItem>
                  <SelectItem value="text">Texte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-[#30363d]" />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Sauvegarde automatique</Label>
                <p className="text-xs text-gray-500">Sauvegarde les notes automatiquement</p>
              </div>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Notifications</Label>
                <p className="text-xs text-gray-500">Recevoir des notifications</p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => updateSetting('notifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Keyboard className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Raccourcis clavier</CardTitle>
                <CardDescription>Accélérez votre workflow</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {shortcuts.map((shortcut, idx) => (
                <div key={idx} className="flex items-center justify-between py-2">
                  <span className="text-sm">{shortcut.action}</span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, keyIdx) => (
                      <React.Fragment key={keyIdx}>
                        <kbd className="px-2 py-1 text-xs bg-[#21262d] border border-[#30363d] rounded">
                          {key}
                        </kbd>
                        {keyIdx < shortcut.keys.length - 1 && (
                          <span className="text-gray-500">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Help & Support */}
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Aide & Support</CardTitle>
                <CardDescription>Ressources et documentation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Documentation', icon: ExternalLink },
                { label: 'Tutoriels vidéo', icon: ExternalLink },
                { label: 'Communauté', icon: ExternalLink },
                { label: 'Contacter le support', icon: ExternalLink },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={idx}
                    variant="outline"
                    className="justify-start border-[#30363d] bg-[#21262d] hover:bg-[#30363d]"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Version Info */}
        <div className="text-center text-sm text-gray-500 py-4">
          <p>MathSnip Clone v1.0.0</p>
          <p className="text-xs mt-1">Données mockées pour démonstration</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;