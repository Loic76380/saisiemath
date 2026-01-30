#!/bin/bash
# ===========================================
# Script de déploiement pour saisiemath.ovh
# VPS OVH: 51.210.242.96
# ===========================================

set -e

# Variables
APP_NAME="saisiemath"
APP_DIR="/opt/saisiemath"
DOMAIN="saisiemath.ovh"
GITHUB_REPO="https://github.com/Loic76380/saisiemath.git"
NODE_VERSION="20"

echo "========================================="
echo "  Déploiement de $DOMAIN"
echo "========================================="

# 1. Mise à jour du système
echo "\n[1/10] Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

# 2. Installation de Node.js (si pas déjà installé)
echo "\n[2/10] Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    echo "Installation de Node.js $NODE_VERSION..."
    curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "Node.js est déjà installé: $(node -v)"
fi

# 3. Installation de Yarn (si pas déjà installé)
echo "\n[3/10] Vérification de Yarn..."
if ! command -v yarn &> /dev/null; then
    echo "Installation de Yarn..."
    sudo npm install -g yarn
else
    echo "Yarn est déjà installé: $(yarn -v)"
fi

# 4. Installation de PM2 (si pas déjà installé)
echo "\n[4/10] Vérification de PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "Installation de PM2..."
    sudo npm install -g pm2
else
    echo "PM2 est déjà installé: $(pm2 -v)"
fi

# 5. Clonage du repository
echo "\n[5/10] Clonage du repository..."
if [ -d "$APP_DIR" ]; then
    echo "Le répertoire existe, mise à jour..."
    cd $APP_DIR
    git pull origin main
else
    echo "Clonage depuis GitHub..."
    sudo git clone $GITHUB_REPO $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR
fi

cd $APP_DIR

# 6. Configuration des variables d'environnement
echo "\n[6/10] Configuration des variables d'environnement..."

# Backend .env
cat > backend/.env << 'EOF'
MONGO_URL=mongodb://localhost:27017
DB_NAME=saisiemath
PORT=8001
NODE_ENV=production
EOF

# Frontend .env
cat > frontend/.env << 'EOF'
REACT_APP_BACKEND_URL=https://saisiemath.ovh/api
EOF

echo "Variables d'environnement configurées."

# 7. Installation des dépendances
echo "\n[7/10] Installation des dépendances..."

# Backend
echo "Installation des dépendances backend..."
cd $APP_DIR/backend
pip3 install -r requirements.txt

# Frontend
echo "Installation des dépendances frontend..."
cd $APP_DIR/frontend
yarn install

# 8. Build du frontend
echo "\n[8/10] Build du frontend..."
yarn build

# 9. Configuration PM2
echo "\n[9/10] Configuration de PM2..."
cd $APP_DIR

# Arrêter les anciennes instances si elles existent
pm2 delete saisiemath-backend 2>/dev/null || true
pm2 delete saisiemath-frontend 2>/dev/null || true

# Démarrer le backend
pm2 start backend/server.py --name saisiemath-backend --interpreter python3 -- --host 0.0.0.0 --port 8001

# Servir le frontend statique via serve (ou via nginx directement)
# pm2 start npx --name saisiemath-frontend -- serve -s frontend/build -l 3000

# Sauvegarder la configuration PM2
pm2 save
pm2 startup

echo "\n[10/10] Déploiement terminé !"
echo "========================================="
echo "  Application déployée avec succès !"
echo "  URL: https://$DOMAIN"
echo "========================================="
