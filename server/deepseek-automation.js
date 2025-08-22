require('dotenv').config();
const puppeteer = require('puppeteer');
const { formatPrompt, parseDeepSeekResponse } = require('./utils');

// Función principal para obtener un mapa mental desde DeepSeek
async function getMindMapFromDeepSeek(topic, mapType) {
  let browser = null;
  
  try {
    // Configurar Puppeteer
browser = await puppeteer.launch({
  headless: process.env.PUPPETEER_HEADLESS !== 'false', // Usa la variable de entorno
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
    
    const page = await browser.newPage();
    
    // Configurar el viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navegar a DeepSeek
    console.log('Navegando a DeepSeek...');
    await page.goto('https://chat.deepseek.com/', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Esperar a que cargue la página
    await page.waitForSelector('textarea');
    console.log('Página cargada correctamente');
    
    // Formatear el prompt
    const prompt = formatPrompt(topic, mapType);
    
    // Escribir el prompt en el textarea
    await page.type('textarea', prompt, { delay: 50 });
    
    // Hacer clic en el botón de enviar
    await page.click('button[aria-label="Send message"]');
    console.log('Prompt enviado, esperando respuesta...');
    
    // Esperar a la respuesta
    await page.waitForSelector('[data-testid="message"]', { timeout: 60000 });
    
    // Obtener el texto de la respuesta
    const response = await page.evaluate(() => {
      const messages = document.querySelectorAll('[data-testid="message"]');
      const lastMessage = messages[messages.length - 1];
      return lastMessage ? lastMessage.textContent : '';
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