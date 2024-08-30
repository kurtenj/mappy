import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line, Group } from 'react-konva';
import Token from './Token';
import Toolbar from './toolbar';
import useYjs from '../hooks/useYjs';
import useZoom from '../hooks/useZoom';
import './board.css';

const GRID_SIZE = 50;
const BOARD_WIDTH = 3000;
const BOARD_HEIGHT = 2000;

const Board = () => {
  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const { tokens, doc, addToken } = useYjs();
  const { zoom, handleZoom } = useZoom();

  useEffect(() => {
    const resizeStage = () => {
      setStageSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', resizeStage);
    return () => window.removeEventListener('resize', resizeStage);
  }, []);

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

  return (
    <div className="board-container">
      <Toolbar addToken={addToken} handleZoom={handleZoom} zoom={zoom} />
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        ref={stageRef}
        scaleX={zoom}
        scaleY={zoom}
        draggable
      >
        <Layer>
          <Group>{drawGrid()}</Group>
          {tokens.map(token => (
            <Token
              key={token.id}
              {...token}
              doc={doc}
              gridSize={GRID_SIZE}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Board;