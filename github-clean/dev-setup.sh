#!/bin/bash

# Script de développement local pour ProFireManager

echo "🔥 ProFireManager - Démarrage de l'environnement de développement"
echo ""

# Vérifier si les dossiers existent
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Vérifier si les fichiers .env existent
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Fichier backend/.env manquant"
    echo "📋 Copie de .env.example vers .env..."
    cp backend/.env.example backend/.env
    echo "✅ Fichier créé. Veuillez le configurer avec vos valeurs."
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  Fichier frontend/.env manquant"
    echo "📋 Copie de .env.example vers .env..."
    cp frontend/.env.example frontend/.env
    echo "✅ Fichier créé. Veuillez le configurer avec vos valeurs."
fi

echo ""
echo "🐍 Installation des dépendances Python..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Environnement virtuel créé"
fi

source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null
pip install -r requirements.txt
cd ..

echo ""
echo "📦 Installation des dépendances Node.js..."
cd frontend
yarn install
cd ..

echo ""
echo "✅ Installation terminée!"
echo ""
echo "Pour démarrer l'application:"
echo "  1. Backend:  cd backend && source venv/bin/activate && uvicorn server:app --reload --host 0.0.0.0 --port 8001"
echo "  2. Frontend: cd frontend && yarn start"
echo ""
echo "Ou utilisez Docker Compose:"
echo "  docker-compose up"
echo ""
echo "🔥 Bon développement!"
