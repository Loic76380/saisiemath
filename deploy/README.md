# ===========================================
# Guide de déploiement - SaisieMath.ovh
# ===========================================

## Prérequis
- Accès SSH au VPS (51.210.242.96)
- Git configuré
- Domaine saisiemath.ovh pointant vers 51.210.242.96

## Étapes de déploiement

### 1. Connexion au VPS
```bash
ssh root@51.210.242.96
# ou
ssh votre-user@51.210.242.96
```

### 2. Vérifier que le DNS pointe vers le serveur
```bash
dig saisiemath.ovh +short
# Doit retourner: 51.210.242.96
```

### 3. Cloner le repository
```bash
cd /opt
sudo git clone https://github.com/Loic76380/saisiemath.git
cd saisiemath
```

### 4. Exécuter le script d'installation
```bash
chmod +x deploy/*.sh
./deploy/01-install.sh
```

### 5. Configurer Nginx et SSL
```bash
# Modifier l'email dans le script avant exécution
nano deploy/02-configure-nginx.sh
# Remplacer 'votre-email@example.com' par votre email

./deploy/02-configure-nginx.sh
```

### 6. Démarrer le backend avec PM2
```bash
cd /opt/saisiemath
pm2 start deploy/ecosystem.config.json
pm2 save
pm2 startup
```

### 7. Vérifier que tout fonctionne
```bash
# Vérifier PM2
pm2 status

# Vérifier Nginx
sudo nginx -t
sudo systemctl status nginx

# Tester l'API
curl http://localhost:8001/api/

# Tester le site
curl -I https://saisiemath.ovh
```

## Commandes utiles

### Logs
```bash
# Logs PM2
pm2 logs saisiemath-backend

# Logs Nginx
sudo tail -f /var/log/nginx/saisiemath.error.log
sudo tail -f /var/log/nginx/saisiemath.access.log
```

### Redémarrage
```bash
# Redémarrer le backend
pm2 restart saisiemath-backend

# Redémarrer Nginx
sudo systemctl restart nginx
```

### Mise à jour
```bash
cd /opt/saisiemath
git pull origin main
cd frontend && yarn install && yarn build
pm2 restart saisiemath-backend
```

## Structure des fichiers sur le VPS
```
/opt/
├── cooking-capture/     # Application existante
└── saisiemath/          # Nouvelle application
    ├── backend/
    │   ├── server.py
    │   ├── requirements.txt
    │   └── .env
    ├── frontend/
    │   ├── build/       # Fichiers statiques (après build)
    │   ├── src/
    │   └── .env
    └── deploy/
        ├── 01-install.sh
        ├── 02-configure-nginx.sh
        ├── nginx-saisiemath.conf
        └── ecosystem.config.json
```

## Dépannage

### Le site ne charge pas
1. Vérifier que le DNS est configuré: `dig saisiemath.ovh`
2. Vérifier Nginx: `sudo nginx -t`
3. Vérifier les logs: `sudo tail -f /var/log/nginx/saisiemath.error.log`

### L'API ne répond pas
1. Vérifier PM2: `pm2 status`
2. Vérifier les logs: `pm2 logs saisiemath-backend`
3. Tester localement: `curl http://localhost:8001/api/`

### Erreur SSL
1. Renouveler le certificat: `sudo certbot renew`
2. Vérifier la configuration: `sudo certbot certificates`
