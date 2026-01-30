# 🚀 Installation SaisieMath sur VPS OVH

## ✅ Vérification de compatibilité avec cooking-capture

| Application | Frontend Port | Backend Port | Répertoire | Domaine |
|-------------|--------------|--------------|------------|---------|
| **cooking-capture** | 3000 | 8001 | /opt/cooking-capture | cooking-capture.ovh |
| **saisiemath** | 3001 | 8002 | /opt/saisiemath | saisiemath.ovh |

✅ **Aucun conflit de ports** - Les deux applications peuvent coexister.

---

## 📋 Prérequis

1. **DNS configuré** : `saisiemath.ovh` → `51.210.242.96`
2. **Code sur GitHub** : `https://github.com/Loic76380/saisiemath.git`

---

## 🔧 COMMANDES D'INSTALLATION

### Copiez et exécutez ces commandes une par une :

```bash
# ═══════════════════════════════════════════════════════════════
# ÉTAPE 1: CONNEXION AU VPS
# ═══════════════════════════════════════════════════════════════
ssh root@51.210.242.96


# ═══════════════════════════════════════════════════════════════
# ÉTAPE 2: CLONER LE REPOSITORY
# ═══════════════════════════════════════════════════════════════
cd /opt
git clone https://github.com/Loic76380/saisiemath.git
cd saisiemath


# ═══════════════════════════════════════════════════════════════
# ÉTAPE 3: CRÉER LES VARIABLES D'ENVIRONNEMENT
# ═══════════════════════════════════════════════════════════════
MONGO_PASS=$(openssl rand -hex 16)
JWT_SECRET=$(openssl rand -hex 32)

cat > .env << EOF
DOMAIN=saisiemath.ovh
MONGO_USER=mathsnipadmin
MONGO_PASS=${MONGO_PASS}
JWT_SECRET=${JWT_SECRET}
EOF

echo "✅ Mot de passe MongoDB généré: ${MONGO_PASS}"
echo "   (Notez-le si besoin)"


# ═══════════════════════════════════════════════════════════════
# ÉTAPE 4: CRÉER docker-compose.yml
# ═══════════════════════════════════════════════════════════════
cat > docker-compose.yml << 'DOCKER_EOF'
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
DOCKER_EOF

echo "✅ docker-compose.yml créé"


# ═══════════════════════════════════════════════════════════════
# ÉTAPE 5: CRÉER DOCKERFILE BACKEND
# ═══════════════════════════════════════════════════════════════
cat > backend/Dockerfile << 'BACKEND_EOF'
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc libffi-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
BACKEND_EOF

echo "✅ Dockerfile backend créé"


# ═══════════════════════════════════════════════════════════════
# ÉTAPE 6: CRÉER DOCKERFILE FRONTEND
# ═══════════════════════════════════════════════════════════════
cat > frontend/Dockerfile << 'FRONTEND_EOF'
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

RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
FRONTEND_EOF

echo "✅ Dockerfile frontend créé"


# ═══════════════════════════════════════════════════════════════
# ÉTAPE 7: CONFIGURER NGINX (REVERSE PROXY)
# ═══════════════════════════════════════════════════════════════
cat > /etc/nginx/sites-available/saisiemath << 'NGINX_EOF'
server {
    listen 80;
    server_name saisiemath.ovh www.saisiemath.ovh;

    client_max_body_size 20M;

    # Frontend (React)
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (FastAPI)
    location /api {
        proxy_pass http://localhost:8002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/saisiemath /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo "✅ Nginx configuré"


# ═══════════════════════════════════════════════════════════════
# ÉTAPE 8: CONSTRUIRE ET LANCER LES CONTAINERS
# ═══════════════════════════════════════════════════════════════
cd /opt/saisiemath
docker-compose up -d --build

echo "✅ Containers lancés"


# ═══════════════════════════════════════════════════════════════
# ÉTAPE 9: VÉRIFICATION
# ═══════════════════════════════════════════════════════════════
echo ""
echo "📊 État des containers:"
docker ps | grep saisiemath

echo ""
echo "🔍 Test de l'API:"
curl -s http://localhost:8002/api/ | head -50

echo ""
echo "🔍 Test du frontend:"
curl -sI http://localhost:3001 | head -5


# ═══════════════════════════════════════════════════════════════
# ÉTAPE 10: ACTIVER HTTPS (Let's Encrypt)
# ═══════════════════════════════════════════════════════════════
# IMPORTANT: Remplacez votre@email.com par votre vrai email
certbot --nginx -d saisiemath.ovh -d www.saisiemath.ovh --email votre@email.com --agree-tos -n

echo ""
echo "✅ INSTALLATION TERMINÉE!"
echo "🌐 Accédez à: https://saisiemath.ovh"
```

---

## 🔄 Commandes utiles après installation

```bash
# Voir les logs en temps réel
cd /opt/saisiemath && docker-compose logs -f

# Voir les logs du backend seulement
cd /opt/saisiemath && docker-compose logs -f backend

# Redémarrer tous les services
cd /opt/saisiemath && docker-compose restart

# Arrêter l'application
cd /opt/saisiemath && docker-compose down

# Mettre à jour après un git push
cd /opt/saisiemath && git pull && docker-compose up -d --build

# Voir l'état des containers
docker ps | grep saisiemath

# Vérifier les ports utilisés
netstat -tlnp | grep -E '3000|3001|8001|8002'
```

---

## 🔧 Dépannage

### Erreur "port already in use"
```bash
# Vérifier quel process utilise le port
lsof -i :3001
lsof -i :8002
```

### Le frontend ne build pas
```bash
cd /opt/saisiemath
docker-compose logs frontend
docker-compose build --no-cache frontend
docker-compose up -d
```

### Erreur MongoDB
```bash
docker-compose logs mongodb
# Si besoin de reset la DB:
docker-compose down -v
docker-compose up -d --build
```

---

## 📊 Architecture finale sur le VPS

```
VPS 51.210.242.96
│
├── Nginx (reverse proxy)
│   ├── cooking-capture.ovh → localhost:3000 / localhost:8001
│   └── saisiemath.ovh      → localhost:3001 / localhost:8002
│
├── /opt/cooking-capture/
│   └── Docker containers (ports 3000, 8001)
│
└── /opt/saisiemath/
    ├── saisiemath-frontend  (port 3001)
    ├── saisiemath-backend   (port 8002)
    └── saisiemath-mongodb   (interne)
```
