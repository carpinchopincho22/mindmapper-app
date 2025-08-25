require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Configuración específica para Render
const puppeteer = require('puppeteer');
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

const { generateMindMap } = require('./mindmap-generator');

const app = express();
const port = process.env.PORT || 3000;

// Render usa un puerto diferente, por eso usamos process.env.PORT

// Añade estas líneas para verificar las variables de entorno
console.log('🔧 Configuración cargada:');
console.log(`   Puerto: ${port}`);
console.log(`   Entorno: ${process.env.NODE_ENV}`);
console.log(`   Timeout DeepSeek: ${process.env.DEEPSEEK_TIMEOUT}ms`);
console.log(`   Puppeteer Headless: ${process.env.PUPPETEER_HEADLESS}`);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Ruta principal - sirve el archivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Ruta para health check - verifica que el servidor funciona
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta para generar el mapa mental
app.post('/generate-mindmap', async (req, res) => {
  try {
    console.log('📦 Solicitud recibida en /generate-mindmap');
    
    const { content, mapType } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ 
        error: 'Por favor, proporciona un tema o texto para generar el mapa mental' 
      });
    }
    
    console.log(`🔍 Procesando: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`);
    console.log(`📊 Tipo de mapa: ${mapType || 'tree'}`);
    
    const mindMapData = await generateMindMap(content, mapType || 'tree');
    
    console.log('✅ Mapa mental generado exitosamente');
    console.log(`📊 Nodos: ${mindMapData.nodes.length}, Conexiones: ${mindMapData.edges.length}`);
    
    res.json(mindMapData);
    
  } catch (error) {
    console.error('❌ Error en /generate-mindmap:', error);
    
    res.status(500).json({ 
      error: 'Error interno del servidor al generar el mapa mental',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Ruta para obtener información del sistema
app.get('/system-info', (req, res) => {
  res.json({
    nodeVersion: process.version,
    platform: process.platform,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// MANEJO DE RUTAS NO ENCONTRADAS - VERSIÓN CORREGIDA
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    requestedUrl: req.originalUrl,
    availableRoutes: [
      'GET /',
      'GET /health', 
      'GET /system-info',
      'POST /generate-mindmap'
    ],
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('💥 Error global:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log('🚀 Servidor iniciado');
  console.log(`📍 URL: http://localhost:${port}`);
  console.log(`⏰ Hora de inicio: ${new Date().toLocaleString()}`);
  console.log(`📋 Rutas disponibles:`);
  console.log(`   - GET  / → Interfaz web`);
  console.log(`   - GET  /health → Estado del servidor`);
  console.log(`   - GET  /system-info → Información del sistema`);
  console.log(`   - POST /generate-mindmap → Generar mapa mental`);
  console.log('\n⏳ Para detener el servidor, presiona Ctrl+C');
});

// Manejo elegante de cierre
process.on('SIGINT', () => {
  console.log('\n👋 Cerrando servidor...');
  process.exit(0);
});