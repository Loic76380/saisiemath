# FormulaPad - PWA de Reconnaissance de Formules Mathématiques

## Description
Application web progressive (PWA) minimaliste pour saisir, reconnaître et copier des formules mathématiques.

## Fonctionnalités Implémentées ✅

### Modes de Saisie
1. **Manuscrit** : Canvas de dessin avec stylet/tactile/souris
   - Outils : Stylo, Gomme, Annuler/Refaire, Effacer
   - Bouton "Reconnaître" pour OCR

2. **Visuel** : Palettes de symboles cliquables
   - Structures : Fraction, Puissance, Indice, Racine, Intégrale, Somme, Produit, Limite, Infini
   - Lettres grecques : α, β, γ, δ, θ, λ, μ, π, σ, φ, ω
   - Opérateurs : ±, ×, ÷, ≠, ≤, ≥, ≈, →, ∈

3. **LaTeX** : Édition directe du code LaTeX

### Reconnaissance OCR
- **Moteur** : GPT-4 Vision via Emergent LLM Key
- **Latence** : < 3 secondes
- **Confiance** : Affichée en badge (vert > 90%, jaune > 70%, rouge < 70%)

### Export
- **Copier texte** : LaTeX, MathML, Word/OneNote
- **Copier image** : PNG (fond blanc/transparent), SVG

### Stockage
- **Historique** : 30 dernières formules (IndexedDB)
- **Offline** : Saisie Visuel/LaTeX + Historique fonctionnent sans réseau

## Architecture

```
/app
├── backend/
│   ├── server.py           # API FastAPI
│   └── ocr_service.py      # Service OCR GPT-4 Vision
└── frontend/
    └── src/
        ├── App.js
        ├── components/
        │   ├── Header.jsx
        │   ├── EditorTabs.jsx
        │   ├── HandwritingCanvas.jsx
        │   ├── VisualEditor.jsx
        │   ├── LatexEditor.jsx
        │   ├── Preview.jsx
        │   ├── ActionBar.jsx
        │   ├── History.jsx
        │   └── Settings.jsx
        ├── context/
        │   └── HistoryContext.jsx
        └── styles/
            └── app.css
```

## Stack Technique
- **Frontend** : React, KaTeX, html2canvas, IndexedDB
- **Backend** : FastAPI, emergentintegrations (GPT-4 Vision)
- **Style** : CSS vanilla minimaliste (fond clair)

## Tests
- **Backend** : 9/9 tests passés (100%)
- **Frontend** : 100% fonctionnel

## Changelog

### 31/01/2026 - v1.0.0
- ✅ Création de FormulaPad (nouvelle app, remplace MathSnip)
- ✅ Interface minimaliste française
- ✅ 3 modes de saisie : Manuscrit, Visuel, LaTeX
- ✅ Reconnaissance OCR réelle via GPT-4 Vision
- ✅ Aperçu en temps réel avec KaTeX
- ✅ Export texte (LaTeX/MathML/Word) et image (PNG/SVG)
- ✅ Historique local avec IndexedDB (30 formules max)
- ✅ Tests complets passés à 100%

## Limitations Connues
- La copie image peut nécessiter un téléchargement sur certains navigateurs (Clipboard API)
- La reconnaissance OCR nécessite une connexion réseau
- Précision OCR dépend de la lisibilité de l'écriture

## Déploiement VPS
Scripts disponibles dans `/app/deploy/`
