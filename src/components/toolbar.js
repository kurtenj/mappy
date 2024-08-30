import React from 'react';
import { MousePointer2, UserPlus2, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import './toolbar.css';

const Toolbar = ({ addToken, handleZoom, zoom }) => {
  return (
    <>
      <div className="toolbar primary-toolbar">
        <button className="toolbar-button">
          <MousePointer2 />
        </button>
        <button className="toolbar-button" onClick={() => addToken()}>
          <UserPlus2 />
        </button>
      </div>
      <div className="toolbar zoom-toolbar">
        <button className="toolbar-button" onClick={() => handleZoom('out')}>
          <ZoomOut />
        </button>
        <span className="zoom-level">{zoom.toFixed(2)}x</span>
        <button className="toolbar-button" onClick={() => handleZoom('in')}>
          <ZoomIn />
        </button>
        <button className="toolbar-button" onClick={() => handleZoom('reset')}>
          <Maximize />
        </button>
      </div>
    </>
  );
};

export default Toolbar;