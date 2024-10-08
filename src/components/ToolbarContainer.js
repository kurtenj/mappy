import React from 'react';
import Toolbar from './Toolbar';
import RoomToolbar from './RoomToolbar';
import './toolbarContainer.css';

const ToolbarContainer = ({ addToken, handleZoom, zoom, onRoomChange, currentRoomId, isHost }) => {
  return (
    <div className="toolbar-container">
      <div className="toolbar-group">
        <Toolbar addToken={addToken} />
        <RoomToolbar onRoomChange={onRoomChange} currentRoomId={currentRoomId} isHost={isHost} />
      </div>
      <div className="zoom-toolbar">
        <Toolbar handleZoom={handleZoom} zoom={zoom} />
      </div>
    </div>
  );
};

export default ToolbarContainer;