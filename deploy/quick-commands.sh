#!/bin/bash
# ===========================================
# Commandes rapides - Copier/Coller
# À exécuter ligne par ligne sur le VPS
# ===========================================

# ============ CONNEXION ============
ssh root@51.210.242.96

# ============ INSTALLATION ============
# Cloner le repo
cd /opt
sudo git clone https://github.com/Loic76380/saisiemath.git
cd saisiemath

# Installer Node.js 20 (si pas installé)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Installer Yarn et PM2
sudo npm install -g yarn pm2

# Installer les dépendances Python
cd /opt/saisiemath/backend
pip3 install -r requirements.txt

# Configurer le backend .env
cat > /opt/saisiemath/backend/.env << 'EOF'
MONGO_URL=mongodb://localhost:27017
DB_NAME=saisiemath
EOF

# Configurer le frontend .env
cat > /opt/saisiemath/frontend/.env << 'EOF'
REACT_APP_BACKEND_URL=https://saisiemath.ovh/api
EOF

# Installer et builder le frontend
cd /opt/saisiemath/frontend
yarn install
yarn build

# ============ CONFIGURATION NGINX ============
# Créer la config Nginx
sudo nano /etc/nginx/sites-available/saisiemath.ovh
# (Copier le contenu de nginx-saisiemath.conf)

# Activer le site
sudo ln -sf /etc/nginx/sites-available/saisiemath.ovh /etc/nginx/sites-enabled/

# Obtenir le certificat SSL
sudo certbot certonly --nginx -d saisiemath.ovh -d www.saisiemath.ovh

# Tester et recharger Nginx
sudo nginx -t
sudo systemctl reload nginx

# ============ DÉMARRER LE BACKEND ============
cd /opt/saisiemath
pm2 start backend/server.py --name saisiemath-backend --interpreter python3 -- --host 0.0.0.0 --port 8001

# Ou avec uvicorn (recommandé)
pm2 start "uvicorn server:app --host 0.0.0.0 --port 8001" --name saisiemath-backend --cwd /opt/saisiemath/backend

# Sauvegarder la config PM2
pm2 save
pm2 startup

# ============ VÉRIFICATION ============
pm2 status
curl http://localhost:8001/api/
curl -I https://saisiemath.ovh

# ============ LOGS ============
pm2 logs saisiemath-backend
sudo tail -f /var/log/nginx/saisiemath.error.log
