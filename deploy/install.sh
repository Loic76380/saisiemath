#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
# SAISIEMATH - Script d'installation VPS
# Compatible avec cooking-capture (ports différents)
# 
# Usage: curl -sSL https://raw.githubusercontent.com/Loic76380/saisiemath/main/deploy/install.sh | bash
# Ou:    chmod +x install.sh && ./install.sh
#═══════════════════════════════════════════════════════════════════════════════

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       SAISIEMATH - Installation automatique VPS              ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Vérification root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}[ERREUR] Ce script doit être exécuté en root${NC}"
    echo "Utilisez: sudo $0"
    exit 1
fi

# Variables
DOMAIN="saisiemath.ovh"
APP_DIR="/opt/saisiemath"
MONGO_PASS=$(openssl rand -hex 16)
JWT_SECRET=$(openssl rand -hex 32)

echo -e "${YELLOW}[INFO]${NC} Domaine: ${DOMAIN}"
echo -e "${YELLOW}[INFO]${NC} Répertoire: ${APP_DIR}"
echo ""

# Vérification compatibilité avec cooking-capture
echo -e "${YELLOW}[1/8]${NC} Vérification de la compatibilité..."
if netstat -tlnp 2>/dev/null | grep -q ':3001 '; then
    echo -e "${RED}[ERREUR] Le port 3001 est déjà utilisé!${NC}"
    exit 1
fi
if netstat -tlnp 2>/dev/null | grep -q ':8002 '; then
    echo -e "${RED}[ERREUR] Le port 8002 est déjà utilisé!${NC}"
    exit 1
fi
echo -e "${GREEN}[✓]${NC} Ports 3001 et 8002 disponibles (pas de conflit avec cooking-capture)"

# Vérification Docker
echo -e "${YELLOW}[2/8]${NC} Vérification de Docker..."
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}[✓]${NC} Docker et Docker Compose installés"
else
    echo -e "${RED}[ERREUR] Docker n'est pas installé${NC}"
    echo "Installez Docker avec: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# Cloner ou mettre à jour
echo -e "${YELLOW}[3/8]${NC} Clonage du repository..."
if [ -d "$APP_DIR" ]; then
    echo -e "${YELLOW}[INFO]${NC} Répertoire existant, mise à jour..."
    cd $APP_DIR
    git pull origin main || git pull origin master || true
else
    git clone https://github.com/Loic76380/saisiemath.git $APP_DIR
fi
cd $APP_DIR
echo -e "${GREEN}[✓]${NC} Repository prêt"

# Créer .env
echo -e "${YELLOW}[4/8]${NC} Création de la configuration..."
cat > .env << EOF
DOMAIN=${DOMAIN}
MONGO_USER=mathsnipadmin
MONGO_PASS=${MONGO_PASS}
JWT_SECRET=${JWT_SECRET}
EOF
echo -e "${GREEN}[✓]${NC} Fichier .env créé"

# Créer docker-compose.yml
echo -e "${YELLOW}[5/8]${NC} Création de docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
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
      - saisiemath_mongodb_data:/data/db
    networks:
      - saisiemath-network
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
      - CORS_ORIGINS=https://${DOMAIN},http://${DOMAIN},https://www.${DOMAIN}
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - saisiemath-network

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
      - saisiemath-network

volumes:
  saisiemath_mongodb_data:
    name: saisiemath_mongodb_data

networks:
  saisiemath-network:
    name: saisiemath-network
    driver: bridge
EOF
echo -e "${GREEN}[✓]${NC} docker-compose.yml créé"

# Créer Dockerfiles
echo -e "${YELLOW}[6/8]${NC} Création des Dockerfiles..."

cat > backend/Dockerfile << 'EOF'
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y gcc libffi-dev && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8001
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
EOF

cat > frontend/Dockerfile << 'EOF'
FROM node:18-alpine as build
WORKDIR /app
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile || yarn install
COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
echo -e "${GREEN}[✓]${NC} Dockerfiles créés"

# Configurer Nginx
echo -e "${YELLOW}[7/8]${NC} Configuration de Nginx..."
cat > /etc/nginx/sites-available/saisiemath << NGINX
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api {
        proxy_pass http://localhost:8002;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/saisiemath /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
echo -e "${GREEN}[✓]${NC} Nginx configuré"

# Lancer Docker
echo -e "${YELLOW}[8/8]${NC} Construction et lancement des containers..."
cd $APP_DIR
docker-compose up -d --build

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}           ✅ INSTALLATION TERMINÉE AVEC SUCCÈS!               ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "📁 Répertoire: ${APP_DIR}"
echo -e "🔐 MongoDB Password: ${MONGO_PASS}"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}           PROCHAINE ÉTAPE: ACTIVER HTTPS                      ${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Exécutez cette commande (remplacez l'email):"
echo ""
echo -e "  ${BLUE}certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --email VOTRE@EMAIL.COM --agree-tos -n${NC}"
echo ""
echo -e "Puis accédez à: ${GREEN}https://${DOMAIN}${NC}"
echo ""
