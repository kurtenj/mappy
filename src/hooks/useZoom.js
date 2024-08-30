import { useState, useCallback } from 'react';

const useZoom = () => {
  const [zoom, setZoom] = useState(1);

  const handleZoom = useCallback((zoomAction) => {
    setZoom(prevZoom => {
      let newZoom;
      switch (zoomAction) {
        case 'in':
          newZoom = Math.min(prevZoom + 0.25, 2); // Max zoom: 200%
          break;
        case 'out':
          newZoom = Math.max(prevZoom - 0.25, 0.25); // Min zoom: 25%
          break;
        case 'reset':
          newZoom = 1;
          break;
        default:
          newZoom = prevZoom;
      }
      return Math.round(newZoom * 4) / 4; // Round to nearest 0.25
    });
  }, []);

  return { zoom, setZoom, handleZoom };
};

export default useZoom;