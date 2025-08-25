#!/bin/bash
echo "Instalando dependencias..."
npm install

echo "Configurando Puppeteer para Render..."
npm config set puppeteer_skip_chromium_download true

echo "Instalando Puppeteer..."
npm install puppeteer --unsafe-perm=true --allow-root