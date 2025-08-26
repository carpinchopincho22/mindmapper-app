const puppeteer = require('puppeteer');
const { formatPrompt, parseDeepSeekResponse } = require('./utils');

// Configuración optimizada para Render
function getBrowserConfig() {
  // Si estamos en producción (Render)
  if (process.env.NODE_ENV === 'production') {
    return {
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
        '--disable-setuid-sandbox',
        '--disable-web-security'
      ],
      headless: true,
      ignoreHTTPSErrors: true
    };
  }
  
  // Configuración para desarrollo local
  return {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  };
}

async function getMindMapFromDeepSeek(topic, mapType) {
  let browser = null;
  
  try {
    console.log('Iniciando navegador con configuración para:', process.env.NODE_ENV || 'development');
    
    const browserConfig = getBrowserConfig();
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
    
    // Esperar a que cargue la página
    await page.waitForSelector('textarea', { timeout: 30000 });
    console.log('Página cargada correctamente');
    
    // Formatear el prompt
    const prompt = formatPrompt(topic, mapType);
    
    // Escribir el prompt en el textarea
    await page.type('textarea', prompt, { delay: 50 });
    
    // Hacer clic en el botón de enviar
    const sendButton = await page.$('button[aria-label="Send message"]');
    if (sendButton) {
      await sendButton.click();
    } else {
      // Fallback: buscar cualquier botón que parezca ser de enviar
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await page.evaluate(btn => btn.textContent, button);
        if (text.includes('Send') || text.includes('Enviar')) {
          await button.click();
          break;
        }
      }
    }
    
    console.log('Prompt enviado, esperando respuesta...');
    
    // Esperar a la respuesta - intentar diferentes selectores
    try {
      await page.waitForSelector('[data-testid="message"]', { timeout: 120000 });
    } catch (e) {
      // Intentar con otro selector si el primero falla
      await page.waitForSelector('.message', { timeout: 30000 });
    }
    
    // Obtener el texto de la respuesta
    const response = await page.evaluate(() => {
      // Intentar diferentes selectores para encontrar los mensajes
      const selectors = [
        '[data-testid="message"]',
        '.message',
        '.chat-message',
        '[class*="message"]'
      ];
      
      for (const selector of selectors) {
        const messages = document.querySelectorAll(selector);
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          return lastMessage.textContent;
        }
      }
      
      return '';
    });
    
    console.log('Respuesta recibida, procesando...');
    
    // Analizar la respuesta
    const mindMapData = parseDeepSeekResponse(response);
    
    await browser.close();
    return mindMapData;
    
  } catch (error) {
    console.error('Error en la automatización:', error);
    
    if (browser) {
      await browser.close();
    }
    
    throw new Error(`Error al obtener respuesta de DeepSeek: ${error.message}`);
  }
}

module.exports = {
  getMindMapFromDeepSeek
};