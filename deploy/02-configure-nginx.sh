#!/bin/bash
# ===========================================
# Configuration Nginx et SSL pour saisiemath.ovh
# À exécuter après 01-install.sh
# ===========================================

set -e

DOMAIN="saisiemath.ovh"

echo "========================================="
echo "  Configuration Nginx pour $DOMAIN"
echo "========================================="

# 1. Copier la configuration Nginx
echo "\n[1/4] Copie de la configuration Nginx..."
sudo cp /opt/saisiemath/deploy/nginx-saisiemath.conf /etc/nginx/sites-available/saisiemath.ovh

# 2. Créer le lien symbolique
echo "\n[2/4] Activation du site..."
sudo ln -sf /etc/nginx/sites-available/saisiemath.ovh /etc/nginx/sites-enabled/

# 3. Obtenir le certificat SSL (si pas encore fait)
echo "\n[3/4] Configuration SSL avec Let's Encrypt..."
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "Obtention du certificat SSL..."
    sudo certbot certonly --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email votre-email@example.com
else
    echo "Certificat SSL déjà existant."
fi

# 4. Tester et recharger Nginx
echo "\n[4/4] Test et rechargement de Nginx..."
sudo nginx -t
sudo systemctl reload nginx

echo "\n========================================="
echo "  Configuration Nginx terminée !"
echo "  Site accessible sur: https://$DOMAIN"
echo "========================================="
