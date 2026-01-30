#!/bin/bash
#===============================================================================
# Script de mise à jour pour SaisieMath
#===============================================================================

set -e

APP_DIR="/opt/saisiemath"

echo "🔄 Mise à jour de SaisieMath..."

cd $APP_DIR

# Récupérer les dernières modifications
echo "📥 Téléchargement des mises à jour..."
git pull origin main

# Arrêter les containers
echo "⏹️  Arrêt des containers..."
docker-compose down

# Reconstruire
echo "🛠️  Reconstruction..."
docker-compose up -d --build

# Nettoyage
echo "🧹 Nettoyage des images inutilisées..."
docker image prune -f

echo "✅ Mise à jour terminée!"
echo ""
echo "Vérification:"
docker-compose ps
