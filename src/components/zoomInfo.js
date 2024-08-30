import React from 'react';

const ZoomInfo = ({ zoom, gridSize }) => (
  <div className="zoom-info">
    Zoom: {zoom.toFixed(2)}, Grid Size: {gridSize}
  </div>
);

export default ZoomInfo;