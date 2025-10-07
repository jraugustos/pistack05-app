/**
 * GraphService - Gerencia o layout do canvas (viewport + posições dos cards)
 * Salva/carrega do campo JSONB `projects.graph`
 */

interface GraphJSON {
  version: 1;
  viewport: { x: number; y: number; zoom: number };
  cards: Array<{ id: string; x: number; y: number; w: number; h: number }>;
}

interface Card {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

let saveTimeout: NodeJS.Timeout | null = null;

export class GraphService {
  /**
   * Salva o layout do canvas (debounced)
   */
  static saveLayout(
    projectId: string,
    viewport: { x: number; y: number; zoom: number },
    cards: Card[]
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancelar save anterior se existir
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      // Debounce de 800ms
      saveTimeout = setTimeout(async () => {
        try {
          const graphData: GraphJSON = {
            version: 1,
            viewport,
            cards: cards.map(c => {
              const position = c.position || { x: 80, y: 80 };
              const size = c.size || { width: 360, height: 240 };
              return {
                id: c.id,
                x: position.x,
                y: position.y,
                w: size.width,
                h: size.height,
              };
            }),
          };

          const response = await fetch(`/api/projects/${projectId}/graph`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ graph: graphData }),
          });

          if (!response.ok) {
            throw new Error('Failed to save layout');
          }

          console.log('[GraphService] Layout salvo com sucesso');
          resolve();
        } catch (error) {
          console.error('[GraphService] Erro ao salvar layout:', error);
          reject(error);
        }
      }, 800);
    });
  }

  /**
   * Carrega o layout salvo do projeto
   */
  static async loadLayout(projectId: string): Promise<GraphJSON | null> {
    try {
      const response = await fetch(`/api/projects/${projectId}/graph`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('[GraphService] Nenhum layout salvo encontrado');
          return null;
        }
        throw new Error('Failed to load layout');
      }

      const data = await response.json();
      console.log('[GraphService] Layout carregado:', data);
      
      return data.graph || null;
    } catch (error) {
      console.error('[GraphService] Erro ao carregar layout:', error);
      return null;
    }
  }

  /**
   * Gera posições em cascade para novos cards
   * Evita sobreposição com cards existentes
   */
  static getCascadePosition(existingCards: Card[], baseX = 80, baseY = 80): { x: number; y: number } {
    if (existingCards.length === 0) {
      return { x: baseX, y: baseY };
    }

    // Encontrar o card mais à direita e mais abaixo
    let maxX = baseX;
    let maxY = baseY;
    
    existingCards.forEach(card => {
      const position = card.position || { x: 80, y: 80 };
      const size = card.size || { width: 360, height: 240 };
      
      // Card mais à direita
      if (position.x + size.width > maxX) {
        maxX = position.x + size.width;
      }
      // Card mais abaixo
      if (position.y + size.height > maxY) {
        maxY = position.y + size.height;
      }
    });

    // Posicionar novo card à direita do último, com margem de 40px
    // Se passar de 1200px de largura, volta para esquerda e desce uma linha
    const newX = maxX + 40;
    
    if (newX > 1200) {
      return { x: baseX + 420, y: baseY }; // Segunda coluna
    }
    
    return { x: newX, y: baseY };
  }

  /**
   * Calcula bounding box de todos os cards
   */
  static getBoundingBox(cards: Card[]): { minX: number; minY: number; maxX: number; maxY: number } {
    if (cards.length === 0) {
      return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    cards.forEach(card => {
      const position = card.position || { x: 80, y: 80 };
      const size = card.size || { width: 360, height: 240 };
      
      minX = Math.min(minX, position.x);
      minY = Math.min(minY, position.y);
      maxX = Math.max(maxX, position.x + size.width);
      maxY = Math.max(maxY, position.y + size.height);
    });

    return { minX, minY, maxX, maxY };
  }

  /**
   * Calcula viewport para exibir todos os cards (Fit View)
   */
  static fitView(
    cards: Card[],
    containerWidth: number,
    containerHeight: number,
    padding = 80
  ): { x: number; y: number; zoom: number } {
    const bbox = this.getBoundingBox(cards);
    
    const contentWidth = bbox.maxX - bbox.minX;
    const contentHeight = bbox.maxY - bbox.minY;
    
    const zoomX = (containerWidth - padding * 2) / contentWidth;
    const zoomY = (containerHeight - padding * 2) / contentHeight;
    const zoom = Math.min(zoomX, zoomY, 1.5); // Max zoom 1.5x

    const x = (containerWidth - contentWidth * zoom) / 2 - bbox.minX * zoom;
    const y = (containerHeight - contentHeight * zoom) / 2 - bbox.minY * zoom;

    return { x, y, zoom: Math.max(zoom, 0.1) };
  }
}

