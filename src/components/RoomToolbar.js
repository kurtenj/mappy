import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import './roomtoolbar.css';

const RoomToolbar = ({ onRoomChange, currentRoomId, isHost }) => {
  const [roomId, setRoomId] = useState(currentRoomId);

  useEffect(() => {
    setRoomId(currentRoomId);
  }, [currentRoomId]);

  const handleRoomIdChange = (e) => {
    setRoomId(e.target.value);
  };

  const handleRoomIdSubmit = (e) => {
    e.preventDefault();
    onRoomChange(roomId);
  };

  const handleRefresh = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(newRoomId);
    onRoomChange(newRoomId);
  };

  return (
    <div className="toolbar room-toolbar">
      {isHost ? (
        <div className="host-room-id">
          Host Room ID: {currentRoomId}
          <button onClick={handleRefresh} className="toolbar-button">
            <RefreshCw size={16} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleRoomIdSubmit} className="room-id-form">
          <input
            type="text"
            value={roomId}
            onChange={handleRoomIdChange}
            placeholder="Room ID"
            className="room-id-input"
          />
          <button type="submit" className="join-button">
            Join
          </button>
          <button type="button" onClick={handleRefresh} className="toolbar-button">
            <RefreshCw size={16} />
          </button>
        </form>
      )}
    </div>
  );
};

export default RoomToolbar;