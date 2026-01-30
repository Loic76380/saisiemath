#!/bin/bash
#===============================================================================
# SAISIEMATH - Script de déploiement COMPLET
# Compatible Ubuntu 20.04+ / Debian 11+
# Basé sur la configuration de cooking-capture
#===============================================================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "\n${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  $1"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}\n"
}

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }

# Vérification root
if [ "$EUID" -ne 0 ]; then
    print_error "Ce script doit être exécuté en tant que root"
    echo "Utilisez: sudo $0"
    exit 1
fi

#===============================================================================
# VARIABLES - ADAPTER SI NECESSAIRE
#===============================================================================
DOMAIN="saisiemath.ovh"
EMAIL="votre-email@example.com"  # REMPLACER PAR VOTRE EMAIL
GITHUB_REPO="https://github.com/Loic76380/saisiemath.git"
APP_DIR="/opt/saisiemath"
MONGO_USER="mathsnipadmin"
MONGO_PASS=$(openssl rand -hex 16)
JWT_SECRET=$(openssl rand -hex 32)
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "51.210.242.96")

print_header "SAISIEMATH - Installation automatique"
echo "Domaine: ${DOMAIN}"
echo "IP Serveur: ${SERVER_IP}"
echo "Répertoire: ${APP_DIR}"
echo ""

#===============================================================================
# ÉTAPE 1: Vérifier que Docker est installé (déjà fait pour cooking-capture)
#===============================================================================
print_status "Étape 1/6: Vérification de Docker..."
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    print_success "Docker et Docker Compose déjà installés"
else
    print_error "Docker n'est pas installé. Installation..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker && systemctl start docker
    
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -oP '"tag_name": "\K(.*)(?=")')
    curl -sL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_success "Docker installé"
fi

#===============================================================================
# ÉTAPE 2: Cloner le repository
#===============================================================================
print_status "Étape 2/6: Clonage du repository..."
if [ -d "$APP_DIR" ]; then
    print_warning "Le répertoire existe déjà, mise à jour..."
    cd $APP_DIR
    git pull origin main || true
else
    git clone $GITHUB_REPO $APP_DIR
    cd $APP_DIR
fi
print_success "Repository cloné"

#===============================================================================
# ÉTAPE 3: Créer les fichiers de configuration
#===============================================================================
print_status "Étape 3/6: Création des fichiers de configuration..."

# Fichier .env
cat > $APP_DIR/.env << EOF
# Configuration SaisieMath
DOMAIN=${DOMAIN}
MONGO_USER=${MONGO_USER}
MONGO_PASS=${MONGO_PASS}
JWT_SECRET=${JWT_SECRET}
EOF

# docker-compose.yml
cat > $APP_DIR/docker-compose.yml << 'EOF'
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: saisiemath-mongodb
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASS}
      MONGO_INITDB_DATABASE: saisiemath
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: saisiemath-backend
    restart: always
    ports:
      - "8002:8001"
    environment:
      - MONGO_URL=mongodb://${MONGO_USER}:${MONGO_PASS}@mongodb:27017/saisiemath?authSource=admin
      - DB_NAME=saisiemath
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGINS=https://${DOMAIN},http://${DOMAIN}
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      args:
        - REACT_APP_BACKEND_URL=https://${DOMAIN}
    container_name: saisiemath-frontend
    restart: always
    ports:
      - "3001:80"
    depends_on:
      - backend
    networks:
      - app-network

volumes:
  mongodb_data:

networks:
  app-network:
    driver: bridge
EOF

print_success "Fichiers de configuration créés"

#===============================================================================
# ÉTAPE 4: Créer les Dockerfiles
#===============================================================================
print_status "Étape 4/6: Création des Dockerfiles..."

# Dockerfile Backend
cat > $APP_DIR/backend/Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Requirements Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Code application
COPY . .

EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
EOF

# Dockerfile Frontend
cat > $APP_DIR/frontend/Dockerfile << 'EOF'
FROM node:18-alpine as build

WORKDIR /app

ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}

# Copier package.json et installer
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile || yarn install

# Copier le code et builder
COPY . .
RUN yarn build

# Image finale Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Configuration Nginx pour SPA
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        try_files $uri $uri/ /index.html; \
    } \
    location /static { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

print_success "Dockerfiles créés"

#===============================================================================
# ÉTAPE 5: Configuration Nginx
#===============================================================================
print_status "Étape 5/6: Configuration de Nginx..."

cat > /etc/nginx/sites-available/saisiemath << NGINX
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    client_max_body_size 20M;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8002;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
    }
}
NGINX

# Activer le site
ln -sf /etc/nginx/sites-available/saisiemath /etc/nginx/sites-enabled/

# Tester et recharger Nginx
nginx -t && systemctl reload nginx
print_success "Nginx configuré"

#===============================================================================
# ÉTAPE 6: Construire et lancer
#===============================================================================
print_status "Étape 6/6: Construction et lancement..."
cd $APP_DIR
docker-compose up -d --build
print_success "Application lancée"

#===============================================================================
# INSTRUCTIONS FINALES
#===============================================================================
print_header "INSTALLATION TERMINÉE !"

echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}                 PROCHAINE ÉTAPE : HTTPS${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Après avoir vérifié que le DNS pointe vers ${SERVER_IP}, exécutez :"
echo ""
echo "  certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --email ${EMAIL} --agree-tos -n"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}                 INFORMATIONS${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "📁 Répertoire: ${APP_DIR}"
echo "🌐 URL: https://${DOMAIN}"
echo ""
echo "🔐 MongoDB:"
echo "   User: ${MONGO_USER}"
echo "   Pass: ${MONGO_PASS}"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}                 COMMANDES UTILES${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "📊 Voir les logs:     cd ${APP_DIR} && docker-compose logs -f"
echo "🔄 Redémarrer:        cd ${APP_DIR} && docker-compose restart"
echo "⏹️  Arrêter:           cd ${APP_DIR} && docker-compose down"
echo "🔄 Mettre à jour:     cd ${APP_DIR} && git pull && docker-compose up -d --build"
echo ""
