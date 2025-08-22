        // Manejo de la UI
        document.getElementById('inputType').addEventListener('change', function() {
            if (this.value === 'topic') {
                document.getElementById('topicInput').style.display = 'block';
                document.getElementById('textInput').style.display = 'none';
            } else {
                document.getElementById('topicInput').style.display = 'none';
                document.getElementById('textInput').style.display = 'block';
            }
        });
        
        // Contador de caracteres
        document.getElementById('content').addEventListener('input', function() {
            const charCount = this.value.length;
            document.getElementById('charCount').textContent = charCount;
            
            if (charCount > 10000) {
                this.value = this.value.substring(0, 10000);
                document.getElementById('charCount').textContent = '10000';
            }
        });
        
        // Tamaño de página
        const pageOptions = document.querySelectorAll('.page-option');
        pageOptions.forEach(option => {
            option.addEventListener('click', function() {
                pageOptions.forEach(o => o.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Ejemplos
        const examples = document.querySelectorAll('.examples span');
        examples.forEach(example => {
            example.addEventListener('click', function() {
                document.getElementById('inputType').value = 'topic';
                document.getElementById('topicInput').style.display = 'block';
                document.getElementById('textInput').style.display = 'none';
                document.getElementById('topic').value = this.dataset.topic;
            });
        });
        
        // Variables globales para el mapa mental
        let nodes = [];
        let connections = [];
        let selectedNode = null;
        let isAddingConnection = false;
        
        // Función para generar el mapa mental (ahora con conexiones reales)
        function generateMindMap(topic, mapType) {
            const mindmapEl = document.getElementById('mindmap');
            mindmapEl.innerHTML = '';
            nodes = [];
            connections = [];
            
            // Crear contenedor para el mapa
            const mapContainer = document.createElement('div');
            mapContainer.style.position = 'relative';
            mapContainer.style.height = '100%';
            mapContainer.style.width = '100%';
            mapContainer.id = 'map-container';
            mindmapEl.appendChild(mapContainer);
            
            // Crear nodo central
            const mainNode = createNode(topic, 'main', 350, 300);
            mapContainer.appendChild(mainNode);
            nodes.push({id: `node-0`, element: mainNode, x: 350, y: 300, text: topic});
            
            // Crear nodos secundarios basados en el tema
            const subtopics = getSubtopics(topic, mapType);
            
            subtopics.forEach((subtopic, index) => {
                const angle = (index / subtopics.length) * 2 * Math.PI;
                const distance = 200;
                const x = 350 + distance * Math.cos(angle);
                const y = 300 + distance * Math.sin(angle);
                
                const node = createNode(subtopic.name, 'sub', x, y);
                mapContainer.appendChild(node);
                
                const nodeId = `node-${nodes.length}`;
                nodes.push({id: nodeId, element: node, x, y, text: subtopic.name});
                
                // Crear conexión desde el nodo principal
                createConnection(`node-0`, nodeId, 350, 300, x, y, mapContainer);
                
                // Crear detalles para cada subtema
                subtopic.details.forEach((detail, detailIndex) => {
                    const detailAngle = angle + (detailIndex - 1) * 0.3;
                    const detailDistance = 120;
                    const detailX = x + detailDistance * Math.cos(detailAngle);
                    const detailY = y + detailDistance * Math.sin(detailAngle);
                    
                    const detailNode = createNode(detail, 'detail', detailX, detailY);
                    mapContainer.appendChild(detailNode);
                    
                    const detailId = `node-${nodes.length}`;
                    nodes.push({id: detailId, element: detailNode, x: detailX, y: detailY, text: detail});
                    
                    // Crear conexión desde el subtema
                    createConnection(nodeId, detailId, x, y, detailX, detailY, mapContainer);
                });
            });
            
            // Añadir funcionalidad de arrastrar
            makeNodesDraggable();
        }
        
        // Función para crear una conexión visual
        function createConnection(sourceId, targetId, x1, y1, x2, y2, container) {
            // Calcular distancia entre puntos
            const dx = x2 - x1;
            const dy = y2 - y1;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Calcular ángulo
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            
            // Crear elemento de conexión
            const connection = document.createElement('div');
            connection.className = 'connection';
            connection.style.width = distance + 'px';
            connection.style.height = '4px';
            connection.style.left = (x1 + 75) + 'px'; // Ajustar para centro del nodo
            connection.style.top = (y1 + 25) + 'px'; // Ajustar para centro del nodo
            connection.style.transform = `rotate(${angle}deg)`;
            
            container.appendChild(connection);
            connections.push({
                id: `conn-${connections.length}`,
                source: sourceId,
                target: targetId,
                element: connection
            });
        }
        
        // Función para crear un nodo
        function createNode(text, type, x, y) {
            const node = document.createElement('div');
            node.className = `mindmap-node ${type}`;
            node.textContent = text;
            node.style.position = 'absolute';
            node.style.left = `${x}px`;
            node.style.top = `${y}px`;
            node.dataset.x = x;
            node.dataset.y = y;
            
            // Hacer editable
            node.setAttribute('contenteditable', 'true');
            
            // Selección de nodos
            node.addEventListener('click', function(e) {
                e.stopPropagation();
                selectedNode = this;
                document.querySelectorAll('.mindmap-node').forEach(n => {
                    n.style.boxShadow = 'none';
                });
                this.style.boxShadow = '0 0 0 3px #4895ef';
            });
            
            return node;
        }
        
        // Función para hacer nodos arrastrables
        function makeNodesDraggable() {
            const nodes = document.querySelectorAll('.mindmap-node');
            const container = document.getElementById('map-container');
            
            nodes.forEach(node => {
                node.addEventListener('mousedown', startDrag);
            });
            
            function startDrag(e) {
                const node = e.target;
                if (!node.classList.contains('mindmap-node')) return;
                
                let offsetX = e.clientX - node.offsetLeft;
                let offsetY = e.clientY - node.offsetTop;
                
                function drag(e) {
                    const x = e.clientX - offsetX;
                    const y = e.clientY - offsetY;
                    
                    node.style.left = `${x}px`;
                    node.style.top = `${y}px`;
                    
                    // Actualizar conexiones
                    updateConnections(node);
                }
                
                function stopDrag() {
                    document.removeEventListener('mousemove', drag);
                    document.removeEventListener('mouseup', stopDrag);
                    
                    // Actualizar posición en el array de nodos
                    const nodeData = nodes.find(n => n.element === node);
                    if (nodeData) {
                        nodeData.x = parseInt(node.style.left);
                        nodeData.y = parseInt(node.style.top);
                    }
                }
                
                document.addEventListener('mousemove', drag);
                document.addEventListener('mouseup', stopDrag);
            }
        }
        
        // Actualizar conexiones cuando se mueve un nodo
        function updateConnections(node) {
            const nodeId = nodes.find(n => n.element === node)?.id;
            if (!nodeId) return;
            
            // Obtener todas las conexiones relacionadas con este nodo
            const relatedConns = connections.filter(conn => 
                conn.source === nodeId || conn.target === nodeId
            );
            
            relatedConns.forEach(conn => {
                const sourceNode = nodes.find(n => n.id === conn.source);
                const targetNode = nodes.find(n => n.id === conn.target);
                
                if (!sourceNode || !targetNode) return;
                
                // Calcular posición de la conexión
                const x1 = sourceNode.x + sourceNode.element.offsetWidth / 2;
                const y1 = sourceNode.y + sourceNode.element.offsetHeight / 2;
                const x2 = targetNode.x + targetNode.element.offsetWidth / 2;
                const y2 = targetNode.y + targetNode.element.offsetHeight / 2;
                
                const dx = x2 - x1;
                const dy = y2 - y1;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                
                // Actualizar conexión visual
                conn.element.style.width = distance + 'px';
                conn.element.style.left = x1 + 'px';
                conn.element.style.top = y1 + 'px';
                conn.element.style.transform = `rotate(${angle}deg)`;
            });
        }
        
        // Funciones de ejemplo para generar contenido
        function getSubtopics(topic, mapType) {
            const topicsMap = {
                "Sistema Solar": [
                    {name: "Planetas", details: ["Rocosos", "Gaseosos", "Enanos", "Exoplanetas"]},
                    {name: "Sol", details: ["Estrella", "Núcleo", "Fotosfera", "Manchas solares"]},
                    {name: "Lunas", details: ["Luna de la Tierra", "Europa", "Titán", "Fobos"]},
                    {name: "Asteroides", details: ["Cinturón de asteroides", "Ceres", "Tipos de asteroides"]},
                    {name: "Cometas", details: ["Composición", "Órbitas", "Halley", "Hale-Bopp"]}
                ],
                "Fotosíntesis": [
                    {name: "Clorofila", details: ["Pigmento verde", "Captura luz", "Cloroplastos"]},
                    {name: "Luz solar", details: ["Espectro visible", "Fotones", "Energía luminosa"]},
                    {name: "Dióxido de carbono", details: ["Absorción", "Ciclo del carbono", "Estomas"]},
                    {name: "Agua", details: ["Absorción radicular", "Transporte xilema", "Transpiración"]},
                    {name: "Oxígeno", details: ["Producto secundario", "Liberación atmosférica", "Importancia ecológica"]}
                ],
                "Revolución Francesa": [
                    {name: "Causas", details: ["Crisis económica", "Desigualdad social", "Influencia ilustración"]},
                    {name: "Estados Generales", details: ["Clero", "Nobleza", "Tercer Estado"]},
                    {name: "Toma de la Bastilla", details: ["14 de julio 1789", "Símbolo revolucionario", "Liberación presos"]},
                    {name: "Reinado del Terror", details: ["Robespierre", "Comité Seguridad Pública", "Guillotina"]},
                    {name: "Napoleón", details: ["Golpe de Estado", "Código Napoleónico", "Imperio"]}
                ],
                "default": [
                    {name: "Concepto Principal", details: ["Detalle 1", "Detalle 2", "Detalle 3"]},
                    {name: "Características", details: ["Característica 1", "Característica 2"]},
                    {name: "Historia", details: ["Origen", "Desarrollo"]},
                    {name: "Tipos", details: ["Tipo A", "Tipo B", "Tipo C"]},
                    {name: "Ejemplos", details: ["Ejemplo 1", "Ejemplo 2"]}
                ]
            };
            
            return topicsMap[topic] || topicsMap.default;
        }
        
        // Manejo de herramientas
        document.getElementById('addNodeBtn').addEventListener('click', function() {
            const mapContainer = document.getElementById('map-container');
            if (!mapContainer) return;
            
            const newNode = createNode('Nuevo nodo', 'detail', 200, 200);
            mapContainer.appendChild(newNode);
            
            const nodeId = `node-${nodes.length}`;
            nodes.push({id: nodeId, element: newNode, x: 200, y: 200, text: 'Nuevo nodo'});
            
            makeNodesDraggable();
        });
        
        document.getElementById('addConnectionBtn').addEventListener('click', function() {
            isAddingConnection = true;
            alert('Modo conexión: Haz clic primero en el nodo origen y luego en el nodo destino');
        });
        
        document.getElementById('deleteBtn').addEventListener('click', function() {
            if (selectedNode) {
                // Encontrar y eliminar el nodo del array
                const nodeIndex = nodes.findIndex(n => n.element === selectedNode);
                if (nodeIndex !== -1) {
                    // Eliminar conexiones relacionadas
                    const nodeId = nodes[nodeIndex].id;
                    connections = connections.filter(conn => 
                        conn.source !== nodeId && conn.target !== nodeId
                    );
                    
                    // Eliminar conexiones visuales
                    connections.filter(conn => 
                        conn.source === nodeId || conn.target === nodeId
                    ).forEach(conn => {
                        conn.element.remove();
                    });
                    
                    // Eliminar el nodo
                    nodes.splice(nodeIndex, 1);
                    selectedNode.remove();
                    selectedNode = null;
                }
            }
        });
        
        // Implementación de conexiones al hacer clic
        let connectionSource = null;
        
        document.getElementById('map-container')?.addEventListener('click', function(e) {
            if (!isAddingConnection) return;
            
            const clickedNode = e.target.closest('.mindmap-node');
            if (!clickedNode) return;
            
            if (!connectionSource) {
                // Primer clic: seleccionar nodo origen
                connectionSource = nodes.find(n => n.element === clickedNode);
                clickedNode.style.boxShadow = '0 0 0 3px #4cc9f0';
            } else {
                // Segundo clic: seleccionar nodo destino y crear conexión
                const connectionTarget = nodes.find(n => n.element === clickedNode);
                
                if (connectionSource && connectionTarget && connectionSource.id !== connectionTarget.id) {
                    createConnection(
                        connectionSource.id, 
                        connectionTarget.id,
                        connectionSource.x, 
                        connectionSource.y,
                        connectionTarget.x, 
                        connectionTarget.y,
                        this
                    );
                }
                
                // Resetear
                connectionSource.element.style.boxShadow = 'none';
                connectionSource = null;
                isAddingConnection = false;
            }
        });
        
        // Descargar como imagen
        document.getElementById('downloadBtn').addEventListener('click', function() {
            alert('En una implementación completa, esto descargaría tu mapa mental como imagen o PDF.');
        });
        
        // ====================== INTEGRACIÓN CON DEEPSEEK ======================
        // Paso 1: El usuario ingresa un tema o texto
        document.getElementById('generateBtn').addEventListener('click', async function() {
            const inputType = document.getElementById('inputType').value;
            const mapType = document.getElementById('mapType').value;
            let content = '';
            
            if (inputType === 'topic') {
                content = document.getElementById('topic').value;
                if (!content.trim()) {
                    alert('Por favor ingresa un tema para generar el mapa mental');
                    return;
                }
            } else {
                content = document.getElementById('content').value;
                if (!content.trim()) {
                    alert('Por favor ingresa un texto para generar el mapa mental');
                    return;
                }
            }
            
            // Mostrar estado de carga
            document.getElementById('loading').style.display = 'flex';
            
            try {
                // Paso 2: Enviar al backend
                const response = await fetch('/generate-mindmap', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        content: content,
                        mapType: mapType
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Error en el servidor: ' + response.status);
                }
                
                // Paso 4: Recibir JSON del backend
                const mindmapData = await response.json();
                
                // Paso 5: Renderizar el mapa
                renderMindMap(mindmapData);
                
                // Ocultar carga
                document.getElementById('loading').style.display = 'none';
                
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('loading').style.display = 'none';
                
                // En caso de error, usar simulación local
                alert('El backend no está disponible. Usando datos de ejemplo.');
                generateMindMap(content, mapType);
            }
        });
        
        // Función para renderizar el mapa mental desde JSON
        function renderMindMap(data) {
            const mindmapEl = document.getElementById('mindmap');
            mindmapEl.innerHTML = '';
            nodes = [];
            connections = [];
            
            // Crear contenedor para el mapa
            const mapContainer = document.createElement('div');
            mapContainer.style.position = 'relative';
            mapContainer.style.height = '100%';
            mapContainer.style.width = '100%';
            mapContainer.id = 'map-container';
            mindmapEl.appendChild(mapContainer);
            
            // Crear nodos
            data.nodes.forEach(node => {
                const nodeElement = createNode(node.data.label, node.type, node.position.x, node.position.y);
                mapContainer.appendChild(nodeElement);
                nodes.push({
                    id: node.id,
                    element: nodeElement,
                    x: node.position.x,
                    y: node.position.y,
                    text: node.data.label
                });
            });
            
            // Crear conexiones
            data.edges.forEach(edge => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                
                if (sourceNode && targetNode) {
                    createConnection(
                        edge.source, 
                        edge.target,
                        sourceNode.x, 
                        sourceNode.y,
                        targetNode.x, 
                        targetNode.y,
                        mapContainer
                    );
                }
            });
            
            // Añadir funcionalidad de arrastrar
            makeNodesDraggable();
        }
