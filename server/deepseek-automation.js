const puppeteer = require('puppeteer');
const { formatPrompt, parseDeepSeekResponse } = require('./utils');

// Función principal para obtener un mapa mental desde DeepSeek
async function getMindMapFromDeepSeek(topic, mapType) {
  let browser = null;
  
  try {
    // Configuración especial para Render
    const browserConfig = process.env.NODE_ENV === 'production' ? {
      executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process'
      ]
    } : {};

    // Configurar Puppeteer
    browser = await puppeteer.launch(browserConfig);
    
    const page = await browser.newPage();
    
    // Configurar el viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navegar a DeepSeek
    console.log('Navegando a DeepSeek...');
    await page.goto('https://chat.deepseek.com/', { 
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // ... el resto de tu código permanece igual ...