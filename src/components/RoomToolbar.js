import React, { useState, useEffect } from 'react';
import './roomtoolbar.css';

const RoomToolbar = ({ onRoomChange, currentRoomId }) => {
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

  return (
    <div className="toolbar room-toolbar">
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
      </form>
    </div>
  );
};

export default RoomToolbar;