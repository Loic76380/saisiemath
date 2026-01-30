# 📝 Guide de Déploiement - SaisieMath.ovh

## Prérequis

- VPS OVH: 51.210.242.96
- Docker et Docker Compose (déjà installés pour cooking-capture)
- Domaine saisiemath.ovh pointé vers le VPS

## Structure sur le VPS

```
/opt/
├── cooking-capture/    # Port 3000 (frontend) / 8001 (backend)
└── saisiemath/         # Port 3001 (frontend) / 8002 (backend)
```

---

## Méthode Rapide (Copier/Coller)

### 1. Connexion au VPS
```bash
ssh root@51.210.242.96
```

### 2. Cloner et installer
```bash
# Cloner le repository
cd /opt
git clone https://github.com/Loic76380/saisiemath.git
cd saisiemath

# Rendre le script exécutable et lancer
chmod +x deploy/deploy-saisiemath.sh
sudo ./deploy/deploy-saisiemath.sh
```

### 3. Activer HTTPS
```bash
# Après vérification que le DNS pointe vers le serveur
certbot --nginx -d saisiemath.ovh -d www.saisiemath.ovh --email votre@email.com --agree-tos -n
```

---

## Méthode Manuelle (Pas à Pas)

### Étape 1: Cloner le repository
```bash
ssh root@51.210.242.96
cd /opt
git clone https://github.com/Loic76380/saisiemath.git
cd saisiemath
```

### Étape 2: Créer le fichier .env
```bash
MONGO_PASS=$(openssl rand -hex 16)
JWT_SECRET=$(openssl rand -hex 32)

cat > .env << EOF
DOMAIN=saisiemath.ovh
MONGO_USER=mathsnipadmin
MONGO_PASS=${MONGO_PASS}
JWT_SECRET=${JWT_SECRET}
EOF

echo "MongoDB Password: ${MONGO_PASS}"
```

### Étape 3: Créer docker-compose.yml
```bash
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
```

### Étape 4: Créer Dockerfile Backend
```bash
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
```

### Étape 5: Créer Dockerfile Frontend
```bash
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
```

### Étape 6: Configurer Nginx
```bash
cat > /etc/nginx/sites-available/saisiemath << 'EOF'
server {
    listen 80;
    server_name saisiemath.ovh www.saisiemath.ovh;

    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:8002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/saisiemath /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### Étape 7: Construire et lancer
```bash
cd /opt/saisiemath
docker-compose up -d --build
```

### Étape 8: Activer HTTPS
```bash
certbot --nginx -d saisiemath.ovh -d www.saisiemath.ovh --email votre@email.com --agree-tos -n
```

---

## Commandes Utiles

### Gestion des containers
```bash
cd /opt/saisiemath

# Voir l'état
docker-compose ps

# Voir les logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# Redémarrer
docker-compose restart

# Arrêter
docker-compose down

# Reconstruire
docker-compose up -d --build
```

### Mise à jour
```bash
cd /opt/saisiemath
git pull origin main
docker-compose down
docker-compose up -d --build
docker image prune -f
```

### Vérification
```bash
# Vérifier que les containers tournent
docker ps | grep saisiemath

# Tester l'API
curl http://localhost:8002/api/

# Tester le frontend
curl -I http://localhost:3001
```

---

## Dépannage

### Le site ne charge pas
```bash
# Vérifier les containers
docker-compose ps
docker-compose logs backend
docker-compose logs frontend

# Vérifier Nginx
nginx -t
systemctl status nginx
cat /var/log/nginx/error.log
```

### Erreur de build frontend
```bash
# Vérifier les logs de build
docker-compose logs frontend

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d
```

### Conflit de ports
```bash
# Vérifier les ports utilisés
netstat -tlnp | grep -E '3000|3001|8001|8002'

# cooking-capture: 3000, 8001
# saisiemath: 3001, 8002
```
