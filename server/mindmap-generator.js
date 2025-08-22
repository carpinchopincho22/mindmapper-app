require('dotenv').config();
// Importamos la función para conectar con DeepSeek
const { getMindMapFromDeepSeek } = require('./deepseek-automation');

// Función principal para generar mapas mentales
async function generateMindMap(content, mapType) {
  console.log(`📋 El usuario pidió un mapa sobre: "${content}"`);
  console.log(`🗺️ Quiere un tipo de mapa: ${mapType}`);
  
  try {
    // Configuramos el timeout desde variables de entorno o usamos 45000 por defecto
    const timeoutMs = parseInt(process.env.DEEPSEEK_TIMEOUT) || 45000;
    console.log(`⏰ Timeout configurado: ${timeoutMs}ms`);
    
    // Intentamos obtener el mapa de DeepSeek pero con un tiempo límite
    const mindMapData = await Promise.race([
      getMindMapFromDeepSeek(content, mapType),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Tardó demasiado (${timeoutMs}ms) en conectar con DeepSeek`)), timeoutMs)
      )
    ]);
    
    console.log('✅ ¡Perfecto! Conseguimos el mapa desde DeepSeek');
    console.log(`📊 Tiene ${mindMapData.nodes.length} nodos y ${mindMapData.edges.length} conexiones`);
    
    return mindMapData;
    
  } catch (error) {
    console.log('⚠️ No pudimos conectar con DeepSeek. Razón:', error.message);
    console.log('🎨 Usaremos un mapa de ejemplo predefinido');
    
    // Usamos nuestro mapa de ejemplo como respaldo
    return getExampleMindMap(content, mapType);
  }
}

// Función que crea mapas de ejemplo por si falla DeepSeek
function getExampleMindMap(topic, mapType) {
  // Tenemos ejemplos especiales para temas comunes
  const examples = {
    "Fotosíntesis": {
      nodes: [
        { id: "1", type: "main", position: { x: 250, y: 250 }, data: { label: topic } },
        { id: "2", type: "sub", position: { x: 100, y: 100 }, data: { label: "Clorofila" } },
        { id: "3", type: "sub", position: { x: 400, y: 100 }, data: { label: "Luz Solar" } },
        { id: "4", type: "sub", position: { x: 100, y: 400 }, data: { label: "Dióxido de Carbono" } },
        { id: "5", type: "sub", position: { x: 400, y: 400 }, data: { label: "Agua" } },
        { id: "6", type: "detail", position: { x: 50, y: 50 }, data: { label: "Pigmento verde" } },
        { id: "7", type: "detail", position: { x: 350, y: 50 }, data: { label: "Energía luminosa" } },
        { id: "8", type: "detail", position: { x: 450, y: 50 }, data: { label: "Espectro visible" } },
        { id: "9", type: "detail", position: { x: 550, y: 50 }, data: { label: "Fotones" } }
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2" },
        { id: "e1-3", source: "1", target: "3" },
        { id: "e1-4", source: "1", target: "4" },
        { id: "e1-5", source: "1", target: "5" },
        { id: "e2-6", source: "2", target: "6" },
        { id: "e3-7", source: "3", target: "7" },
        { id: "e3-8", source: "3", target: "8" },
        { id: "e3-9", source: "3", target: "9" }
      ]
    },
    "default": {
      nodes: [
        { id: "1", type: "main", position: { x: 250, y: 250 }, data: { label: topic } },
        { id: "2", type: "sub", position: { x: 100, y: 100 }, data: { label: "Concepto Principal" } },
        { id: "3", type: "sub", position: { x: 400, y: 100 }, data: { label: "Características" } },
        { id: "4", type: "detail", position: { x: 50, y: 50 }, data: { label: "Detalle 1" } },
        { id: "5", type: "detail", position: { x: 150, y: 50 }, data: { label: "Detalle 2" } }
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2" },
        { id: "e1-3", source: "1", target: "3" },
        { id: "e2-4", source: "2", target: "4" },
        { id: "e2-5", source: "2", target: "5" }
      ]
    }
  };

  // Si tenemos un ejemplo especial para este tema, lo usamos
  if (examples[topic]) {
    return examples[topic];
  } else {
    // Si no, usamos el ejemplo por defecto
    return examples.default;
  }
}

// Hacemos que estas funciones estén disponibles para otros archivos
module.exports = {
  generateMindMap
};