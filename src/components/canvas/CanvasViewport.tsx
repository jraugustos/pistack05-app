'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CanvasViewportProps {
  children: React.ReactNode;
  onViewportChange?: (viewport: { x: number; y: number; zoom: number }) => void;
  initialViewport?: { x: number; y: number; zoom: number };
  showGrid?: boolean;
}

export const CanvasViewport = React.forwardRef<HTMLDivElement, CanvasViewportProps>(
  ({ children, onViewportChange, initialViewport, showGrid = true }, ref) => {
    const [viewport, setViewport] = useState({
      x: initialViewport?.x || 0,
      y: initialViewport?.y || 0,
      zoom: initialViewport?.zoom || 1,
    });

    const [isPanning, setIsPanning] = useState(false);
    const [startPan, setStartPan] = useState({ x: 0, y: 0 });
    const [spacePressed, setSpacePressed] = useState(false);
    const [panMode, setPanMode] = useState(false); // Modo pan ativado via botão
    const containerRef = useRef<HTMLDivElement>(null);

    // Notificar mudanças de viewport
    useEffect(() => {
      onViewportChange?.(viewport);
    }, [viewport, onViewportChange]);

    // Detectar tecla Espaço
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setSpacePressed(true);
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
          e.preventDefault();
          setSpacePressed(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }, []);

    // Pan com mouse
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      // Pan com: Espaço + Clique, Modo Pan ativo, Botão do meio, ou Ctrl + Clique
      const shouldPan = 
        (e.button === 0 && (spacePressed || panMode)) || // Espaço ou modo pan
        e.button === 1 || // Botão do meio
        (e.button === 0 && e.ctrlKey); // Ctrl + clique
      
      if (shouldPan) {
        e.preventDefault();
        setIsPanning(true);
        setStartPan({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
      }
    }, [viewport.x, viewport.y, spacePressed, panMode]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
      if (!isPanning) return;
      e.preventDefault();
      
      const newX = e.clientX - startPan.x;
      const newY = e.clientY - startPan.y;
      
      setViewport(prev => ({ ...prev, x: newX, y: newY }));
    }, [isPanning, startPan]);

    const handleMouseUp = useCallback(() => {
      setIsPanning(false);
    }, []);

    // Zoom com scroll wheel
    const handleWheel = useCallback((e: React.WheelEvent) => {
      // Não usar preventDefault em eventos de wheel (causa warning)
      const delta = e.deltaY * -0.001;
      const newZoom = Math.min(Math.max(0.1, viewport.zoom + delta), 3);
      
      // Zoom em direção ao cursor (mantém posição relativa)
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const zoomRatio = newZoom / viewport.zoom;
        const newX = mouseX - (mouseX - viewport.x) * zoomRatio;
        const newY = mouseY - (mouseY - viewport.y) * zoomRatio;
        
        setViewport({ x: newX, y: newY, zoom: newZoom });
      } else {
        setViewport(prev => ({ ...prev, zoom: newZoom }));
      }
    }, [viewport]);

    // Zoom programático (para botões)
    const zoomIn = useCallback(() => {
      setViewport(prev => ({ 
        ...prev, 
        zoom: Math.min(prev.zoom + 0.2, 3) 
      }));
    }, []);

    const zoomOut = useCallback(() => {
      setViewport(prev => ({ 
        ...prev, 
        zoom: Math.max(prev.zoom - 0.2, 0.1) 
      }));
    }, []);

    const resetView = useCallback(() => {
      setViewport({ x: 0, y: 0, zoom: 1 });
    }, []);

    // Expor métodos via ref
    React.useImperativeHandle(ref, () => ({
      zoomIn,
      zoomOut,
      resetView,
      getViewport: () => viewport,
      setViewport: (v: { x: number; y: number; zoom: number }) => setViewport(v),
      togglePanMode: () => setPanMode(prev => !prev),
      getPanMode: () => panMode,
    }));

    // Definir cursor baseado no estado
    const getCursor = () => {
      if (isPanning) return 'grabbing';
      if (spacePressed || panMode) return 'grab';
      return 'default';
    };

    return (
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden bg-bg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: getCursor() }}
      >
        {/* Grid de fundo */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(36, 40, 55, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(36, 40, 55, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${20 * viewport.zoom}px ${20 * viewport.zoom}px`,
              backgroundPosition: `${viewport.x}px ${viewport.y}px`,
            }}
          />
        )}

        {/* Canvas transformável */}
        <motion.div
          className="absolute origin-top-left"
          style={{
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {children}
        </motion.div>

        {/* Indicador de zoom */}
        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-bg-soft border border-stroke rounded-md text-xs text-text-dim font-mono">
          {Math.round(viewport.zoom * 100)}%
        </div>

        {/* Hint de controles */}
        <div className="absolute top-4 left-4 px-3 py-2 bg-bg-soft/90 backdrop-blur-sm border border-stroke rounded-md text-xs text-text-dim space-y-1">
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-bg border border-stroke rounded text-[10px] font-mono">Space</kbd>
            <span>+ Arraste para navegar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-bg border border-stroke rounded text-[10px] font-mono">Scroll</kbd>
            <span>para zoom</span>
          </div>
          {panMode && (
            <div className="flex items-center gap-1.5 text-primary">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
              <span className="font-medium">Modo Pan ativo</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

CanvasViewport.displayName = 'CanvasViewport';

