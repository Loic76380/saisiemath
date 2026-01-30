#!/bin/bash
#===============================================================================
# COMMANDES RAPIDES - COPIER/COLLER SUR LE VPS
#===============================================================================

# ============ CONNEXION ============
ssh root@51.210.242.96

# ============ INSTALLATION COMPLETE ============
cd /opt
git clone https://github.com/Loic76380/saisiemath.git
cd saisiemath
chmod +x deploy/deploy-saisiemath.sh
sudo ./deploy/deploy-saisiemath.sh

# ============ HTTPS (après DNS configuré) ============
certbot --nginx -d saisiemath.ovh -d www.saisiemath.ovh --email votre@email.com --agree-tos -n

# ============ VERIFICATION ============
docker ps | grep saisiemath
curl http://localhost:8002/api/
curl -I https://saisiemath.ovh

# ============ LOGS ============
cd /opt/saisiemath && docker-compose logs -f
cd /opt/saisiemath && docker-compose logs -f backend

# ============ MISE A JOUR ============
cd /opt/saisiemath
git pull origin main
docker-compose down
docker-compose up -d --build

# ============ REDEMARRAGE ============
cd /opt/saisiemath && docker-compose restart

# ============ ARRET ============
cd /opt/saisiemath && docker-compose down
