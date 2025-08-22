// Función para limpiar y formatear el texto para el prompt
function formatPrompt(topic, mapType) {
  const mapTypes = {
    'tree': 'mapa de árbol',
    'synoptic': 'cuadro sinóptico',
    'comparative': 'mapa comparativo',
    'conceptual': 'mapa conceptual'
  };
  
  const selectedMapType = mapTypes[mapType] || 'mapa mental';
  
  return `Genera un mapa mental en formato JSON sobre "${topic}" para React Flow con los siguientes requisitos:

1. Estructura de JSON:
{
  "nodes": [
    {
      "id": "string",
      "type": "main|sub|detail",
      "position": { "x": number, "y": number },
      "data": { "label": "string" }
    }
  ],
  "edges": [
    {
      "id": "string",
      "source": "node-id",
      "target": "node-id"
    }
  ]
}

2. El nodo principal debe tener type: "main"
3. Los nodos secundarios directos deben tener type: "sub"
4. Los nodos terciarios deben tener type: "detail"
5. Las posiciones x e y deben ser números entre 0 y 800
6. El estilo visual debe ser adecuado para un ${selectedMapType}

Devuelve SOLAMENTE el JSON, sin comentarios, explicaciones o texto adicional.`;
}

// Función para validar y analizar la respuesta de DeepSeek
function parseDeepSeekResponse(text) {
  try {
    // Intentar encontrar JSON en el texto
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('No se encontró JSON en la respuesta');
    }
    
    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    const data = JSON.parse(jsonString);
    
    // Validar estructura básica
    if (!data.nodes || !data.edges) {
      throw new Error('El JSON no tiene la estructura esperada');
    }
    
    return data;
  } catch (error) {
    console.error('Error al analizar la respuesta:', error);
    throw new Error(`Error al procesar la respuesta: ${error.message}`);
  }
}

module.exports = {
  formatPrompt,
  parseDeepSeekResponse
};