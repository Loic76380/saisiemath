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
  HardDrive,
  Languages
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
import { useLanguage } from '../i18n/LanguageContext';

const SettingsPage = () => {
  const { t, language, changeLanguage } = useLanguage();
  const [settings, setSettings] = useState({
    theme: 'dark',
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
      alert(language === 'fr' ? 'Données importées avec succès!' : 'Data imported successfully!');
      loadStorageUsage();
    } catch (error) {
      console.error('Import failed:', error);
      alert(language === 'fr' ? 'Erreur lors de l\'import des données' : 'Error importing data');
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const shortcuts = [
    { action: t('shortcuts.captureScreen'), keys: ['Ctrl', 'Alt', 'M'] },
    { action: t('shortcuts.newNote'), keys: ['Ctrl', 'N'] },
    { action: t('shortcuts.search'), keys: ['Ctrl', 'K'] },
    { action: t('shortcuts.save'), keys: ['Ctrl', 'S'] },
    { action: t('shortcuts.copyLatex'), keys: ['Ctrl', 'Shift', 'C'] },
  ];

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto overflow-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{t('settings.title')}</h1>
        <p className="text-gray-400">{t('settings.subtitle')}</p>
      </div>

      <div className="space-y-6">
        {/* Language Section - Prominent */}
        <Card className="bg-[#161b22] border-[#30363d] border-2 border-[#6366f1]/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#6366f1]/20 flex items-center justify-center">
                <Languages className="w-5 h-5 text-[#6366f1]" />
              </div>
              <div>
                <CardTitle className="text-lg">{t('settings.language')}</CardTitle>
                <CardDescription>{t('settings.languageDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                variant={language === 'fr' ? 'default' : 'outline'}
                className={language === 'fr' 
                  ? 'bg-[#6366f1] hover:bg-[#5558e3] flex-1' 
                  : 'border-[#30363d] bg-[#21262d] flex-1 hover:bg-[#30363d]'
                }
                onClick={() => changeLanguage('fr')}
              >
                <span className="mr-2">🇫🇷</span>
                Français
              </Button>
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                className={language === 'en' 
                  ? 'bg-[#6366f1] hover:bg-[#5558e3] flex-1' 
                  : 'border-[#30363d] bg-[#21262d] flex-1 hover:bg-[#30363d]'
                }
                onClick={() => changeLanguage('en')}
              >
                <span className="mr-2">🇬🇧</span>
                English
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Section */}
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#6366f1]/20 flex items-center justify-center">
                <User className="w-5 h-5 text-[#6366f1]" />
              </div>
              <div>
                <CardTitle className="text-lg">{t('settings.profile')}</CardTitle>
                <CardDescription>{t('settings.profileDesc')}</CardDescription>
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
                  defaultValue={language === 'fr' ? 'Utilisateur Demo' : 'Demo User'}
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
                <p className="text-sm font-medium">{t('settings.currentPlan')}</p>
                <p className="text-xs text-gray-500">{t('settings.freeAccess')}</p>
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
                <CardTitle className="text-lg">{t('settings.appearance')}</CardTitle>
                <CardDescription>{t('settings.appearanceDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">{t('settings.theme')}</Label>
                <p className="text-xs text-gray-500">{t('settings.themeDesc')}</p>
              </div>
              <div className="flex gap-2">
                {[
                  { value: 'light', icon: Sun, label: t('settings.light') },
                  { value: 'dark', icon: Moon, label: t('settings.dark') },
                  { value: 'system', icon: Monitor, label: t('settings.system') },
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
                <Label className="text-sm font-medium">{t('settings.compactMode')}</Label>
                <p className="text-xs text-gray-500">{t('settings.compactModeDesc')}</p>
              </div>
              <Switch
                checked={settings.compactMode}
                onCheckedChange={(checked) => updateSetting('compactMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">{t('settings.highContrast')}</Label>
                <p className="text-xs text-gray-500">{t('settings.highContrastDesc')}</p>
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
                <CardTitle className="text-lg">{t('settings.preferences')}</CardTitle>
                <CardDescription>{t('settings.preferencesDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">{t('settings.defaultFormat')}</Label>
                <p className="text-xs text-gray-500">{t('settings.defaultFormatDesc')}</p>
              </div>
              <Select value={settings.defaultFormat} onValueChange={(v) => updateSetting('defaultFormat', v)}>
                <SelectTrigger className="w-40 bg-[#21262d] border-[#30363d]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#161b22] border-[#30363d]">
                  <SelectItem value="latex">LaTeX</SelectItem>
                  <SelectItem value="mathml">MathML</SelectItem>
                  <SelectItem value="asciimath">AsciiMath</SelectItem>
                  <SelectItem value="text">{language === 'fr' ? 'Texte' : 'Text'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-[#30363d]" />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">{t('settings.autoSave')}</Label>
                <p className="text-xs text-gray-500">{t('settings.autoSaveDesc')}</p>
              </div>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">{t('settings.notifications')}</Label>
                <p className="text-xs text-gray-500">{t('settings.notificationsDesc')}</p>
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
                <CardTitle className="text-lg">{t('settings.shortcuts')}</CardTitle>
                <CardDescription>{t('settings.shortcutsDesc')}</CardDescription>
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

        {/* Offline Storage Section */}
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Stockage Local</CardTitle>
                <CardDescription>Gérez vos données hors ligne</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Storage Usage */}
            {storageUsage && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Espace utilisé</span>
                  <span className="text-sm text-gray-400">
                    {(storageUsage.usage / 1024 / 1024).toFixed(2)} MB / {(storageUsage.quota / 1024 / 1024).toFixed(0)} MB
                  </span>
                </div>
                <Progress value={parseFloat(storageUsage.percentUsed)} className="h-2 bg-[#21262d]" />
                <p className="text-xs text-gray-500 mt-1">{storageUsage.percentUsed}% utilisé</p>
              </div>
            )}

            <Separator className="bg-[#30363d]" />

            {/* Export/Import */}
            <div className="space-y-3">
              <p className="text-sm text-gray-400">Sauvegarde et restauration</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-[#30363d] bg-[#21262d] hover:bg-[#30363d]"
                  onClick={handleExportData}
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter données
                </Button>
                <label className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full border-[#30363d] bg-[#21262d] hover:bg-[#30363d]"
                    asChild
                  >
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Importer données
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#21262d] border border-[#30363d]">
              <div className="flex items-start gap-3">
                <HardDrive className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Mode hors ligne activé</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Vos snips, notes et documents sont automatiquement sauvegardés localement. 
                    Vous pouvez travailler sans connexion internet.
                  </p>
                </div>
              </div>
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