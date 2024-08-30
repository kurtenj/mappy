import { useState, useEffect, useCallback } from 'react';

const useGrid = (gridRef, boardRef, zoom) => {
  const [gridSize, setGridSize] = useState(50);

  const drawGrid = useCallback(() => {
    if (!gridRef.current || !boardRef.current) return;
    const ctx = gridRef.current.getContext('2d');
    const { width, height } = boardRef.current.getBoundingClientRect();
    
    gridRef.current.width = width;
    gridRef.current.height = height;
    
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;

    const scaledGridSize = gridSize * zoom;

    for (let x = 0; x <= width; x += scaledGridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }

    for (let y = 0; y <= height; y += scaledGridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }

    ctx.stroke();
  }, [zoom, gridSize]);

  useEffect(() => {
    drawGrid();
    window.addEventListener('resize', drawGrid);
    return () => window.removeEventListener('resize', drawGrid);
  }, [drawGrid]);

  return { gridSize, drawGrid };
};

export default useGrid;