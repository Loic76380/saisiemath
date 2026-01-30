# MathSnip - Clone de Mathpix Snip

## Description du Projet
Application clone de Mathpix Snip permettant de capturer et reconnaître des équations mathématiques manuscrites ou à partir d'images, avec conversion en LaTeX et autres formats.

## Fonctionnalités Implémentées

### Core Features
- **Capture d'images** : Upload d'images contenant des équations mathématiques
- **Écriture manuscrite** : Canvas interactif avec stylo, gomme, couleurs et undo/redo
- **Reconnaissance OCR** : Conversion en LaTeX (actuellement MOCKÉE)
- **Formats multiples** : Export en LaTeX, MathML, AsciiMath, texte
- **Collection de Snips** : Historique des équations capturées

### UI/UX
- Interface sombre style Mathpix
- Onglets Image / Écriture manuscrite
- Panneau de résultat à côté du canvas ✅ (Bug corrigé le 30/01/2026)
- Support tactile pour le canvas

### Fonctionnalités Avancées
- **Mode hors ligne** : Service Worker + LocalStorage
- **Internationalisation** : Français / Anglais
- **Copie multi-formats** : Formats adaptés pour Word, OneNote, etc.
- **Export d'image** : Copier ou télécharger l'équation en PNG

## Architecture Technique

```
/app
├── backend/           # FastAPI (non utilisé actuellement)
├── deploy/            # Scripts Docker Compose pour VPS
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── HandwritingCanvas.jsx  # Canvas d'écriture
    │   │   ├── CopyFormats.jsx        # Options de copie
    │   │   └── Layout.jsx
    │   ├── pages/
    │   │   ├── SnipPage.jsx           # Page principale
    │   │   ├── DocumentsPage.jsx
    │   │   ├── EditorPage.jsx
    │   │   └── SettingsPage.jsx
    │   ├── data/mock.js               # Données OCR mockées
    │   ├── hooks/useOffline.js        # Gestion hors ligne
    │   └── i18n/                      # Traductions FR/EN
    └── public/
```

## Stack Technique
- **Frontend** : React, TailwindCSS, shadcn/ui
- **Backend** : FastAPI (template, non intégré)
- **Déploiement** : Docker Compose, Nginx

## État Actuel

### ✅ Complété (Testé le 30/01/2026 - 100% réussite)
- Interface utilisateur complète
- Canvas d'écriture manuscrite avec outils (dessin, effacement, couleurs, tailles)
- Panneau de résultat de reconnaissance (bug corrigé et vérifié)
- Mode hors ligne
- Internationalisation FR/EN
- Collection de snips
- Copie multi-formats (LaTeX, MathML, AsciiMath, Text)
- Scripts de déploiement Docker Compose

### ⚠️ MOCKÉ
- **Toute la reconnaissance OCR est simulée** (`mock.js`)
- Les résultats sont des équations prédéfinies aléatoires

### 🔜 À Faire (Backlog)
1. **P1** : Intégrer un vrai service OCR (Gemini, GPT Vision, ou autre)
2. **P2** : Backend API pour la reconnaissance
3. **P2** : Stockage des snips en base de données
4. **P3** : Amélioration de la précision de reconnaissance

## Déploiement
Scripts disponibles dans `/app/deploy/` :
- `docker-compose.yml`
- `deploy-saisiemath.sh`
- `nginx/saisiemath.conf`
- `DEPLOY_SAISIEMATH.md` (instructions)

## Changelog

### 30/01/2026
- ✅ Bug fix: Panneau de résultat d'écriture manuscrite s'affiche maintenant correctement
- Modification du layout flex dans HandwritingCanvas.jsx (overflow-hidden -> min-h-0)
- Ajout de flex-shrink-0 au panneau de résultat
- Ajout de data-testid pour les tests automatisés
- Tests automatisés passés à 100%

