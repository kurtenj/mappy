import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Group, Line } from 'react-konva';
import Token from './Token';
import ToolbarContainer from './ToolbarContainer';
import useYjs from '../hooks/useYjs';
import useZoom from '../hooks/useZoom';
import './board.css';

const GRID_SIZE = 50;
const BOARD_WIDTH = 3000;
const BOARD_HEIGHT = 2000;
const VISIBLE_WIDTH = window.innerWidth;
const VISIBLE_HEIGHT = window.innerHeight;

const Board = () => {
  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [selectedId, selectShape] = useState(null);

  const { tokens, addToken, setRoomId, roomId, isHost, doc } = useYjs();
  const { zoom, handleZoom } = useZoom();

  useEffect(() => {
    const resizeStage = () => {
      setStageSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', resizeStage);
    return () => window.removeEventListener('resize', resizeStage);
  }, []);

  const handleAddToken = (tokenType) => {
    const newToken = {
      id: Date.now().toString(),
      type: tokenType,
      x: Math.floor(Math.random() * (VISIBLE_WIDTH - GRID_SIZE) / GRID_SIZE) * GRID_SIZE,
      y: Math.floor(Math.random() * (VISIBLE_HEIGHT - GRID_SIZE) / GRID_SIZE) * GRID_SIZE,
      color: getRandomColor(),
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    };
    addToken(newToken);
  };

  const getRandomColor = () => {
    const colors = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const drawGrid = () => {
    const gridLayer = [];
    
    // Vertical lines
    for (let i = 0; i <= BOARD_WIDTH; i += GRID_SIZE) {
      gridLayer.push(
        <Line
          key={`v${i}`}
          points={[i, 0, i, BOARD_HEIGHT]}
          stroke="#e0e0e0"
          strokeWidth={1}
        />
      );
    }
    
    // Horizontal lines
    for (let i = 0; i <= BOARD_HEIGHT; i += GRID_SIZE) {
      gridLayer.push(
        <Line
          key={`h${i}`}
          points={[0, i, BOARD_WIDTH, i]}
          stroke="#e0e0e0"
          strokeWidth={1}
        />
      );
    }
    
    return gridLayer;
  };

  const handleStageClick = (e) => {
    // clicked on stage - clear selection
    if (e.target === e.target.getStage()) {
      selectShape(null);
      return;
    }
    // clicked on transformer - do nothing
    const clickedOnTransformer = e.target.getParent().className === 'Transformer';
    if (clickedOnTransformer) {
      return;
    }
  };

  return (
    <div className="board-container">
      <ToolbarContainer
        addToken={handleAddToken}
        handleZoom={handleZoom}
        zoom={zoom}
        onRoomChange={setRoomId}
        currentRoomId={roomId}
        isHost={isHost}
      />
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        ref={stageRef}
        scaleX={zoom}
        scaleY={zoom}
        draggable
        onMouseDown={handleStageClick}
      >
        <Layer>
          <Group>{drawGrid()}</Group>
          {tokens.map(token => (
            <Token
              key={token.id}
              {...token}
              gridSize={GRID_SIZE}
              doc={doc}
              isSelected={token.id === selectedId}
              onSelect={selectShape}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Board;