import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Board.css';

const getRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 50%)`;
};

const Token = ({ id, x, y, doc, boardRef, color }) => {
  const [position, setPosition] = useState({ x, y });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const tokenColor = useRef(color || getRandomColor());

  useEffect(() => {
    const yTokens = doc.getArray('tokens');
    const updatePosition = () => {
      const token = yTokens.toArray().find(t => t.id === id);
      if (token) {
        setPosition({ x: token.x, y: token.y });
      }
    };

    yTokens.observe(updatePosition);
    return () => yTokens.unobserve(updatePosition);
  }, [doc, id]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    const tokenRect = e.target.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - tokenRect.left,
      y: e.clientY - tokenRect.top
    };
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isDragging && boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect();
      let newX = e.clientX - boardRect.left - dragOffset.current.x;
      let newY = e.clientY - boardRect.top - dragOffset.current.y;

      // Constrain the token within the board
      newX = Math.max(0, Math.min(newX, boardRect.width - 50));
      newY = Math.max(0, Math.min(newY, boardRect.height - 50));

      setPosition({ x: newX, y: newY });
    }
  }, [isDragging, boardRef]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      const yTokens = doc.getArray('tokens');
      const tokenIndex = yTokens.toArray().findIndex(t => t.id === id);
      if (tokenIndex !== -1) {
        yTokens.delete(tokenIndex, 1);
        yTokens.insert(tokenIndex, [{ id, x: position.x, y: position.y, color: tokenColor.current }]);
      }
      setIsDragging(false);
    }
  }, [isDragging, doc, id, position]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      className={`token ${isDragging ? 'dragging' : ''}`}
      style={{
        backgroundColor: tokenColor.current,
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={handleMouseDown}
    />
  );
};

export default Token;