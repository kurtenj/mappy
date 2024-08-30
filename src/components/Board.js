import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import Token from './Token';
import { FaPlus, FaMousePointer, FaTree, FaRoad, FaCity } from 'react-icons/fa';
import './Board.css';

const treePathData = "M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 98c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z";

const treeColors = [
  'rgba(0, 100, 0, 0.7)',  // Dark green
  'rgba(34, 139, 34, 0.7)', // Forest green
  'rgba(0, 128, 0, 0.7)'    // Green
];

const getRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 50%)`;
};

const Board = () => {
  const [tokens, setTokens] = useState([]);
  const [doc, setDoc] = useState(null);
  const [activeTool, setActiveTool] = useState('pointer');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [roadPoints, setRoadPoints] = useState([]);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [cityBlocks, setCityBlocks] = useState([]);
  const boardRef = useRef(null);
  const drawingRef = useRef(null);
  const roadLayerRef = useRef(null);
  const cityLayerRef = useRef(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider('ws://localhost:3002', 'virtual-tabletop', ydoc);
    const yTokens = ydoc.getArray('tokens');

    setDoc(ydoc);

    yTokens.observe(event => {
      setTokens(yTokens.toArray());
    });

    return () => {
      provider.disconnect();
    };
  }, []);

  useEffect(() => {
    if (drawingRef.current && boardRef.current) {
      drawingRef.current.width = boardRef.current.clientWidth;
      drawingRef.current.height = boardRef.current.clientHeight;
    }
  }, []);

  useEffect(() => {
    if (roadLayerRef.current && boardRef.current) {
      roadLayerRef.current.width = boardRef.current.clientWidth;
      roadLayerRef.current.height = boardRef.current.clientHeight;
    }
  }, []);

  useEffect(() => {
    if (cityLayerRef.current && boardRef.current) {
      cityLayerRef.current.width = boardRef.current.clientWidth;
      cityLayerRef.current.height = boardRef.current.clientHeight;
    }
  }, []);

  const addToken = useCallback(() => {
    if (doc && boardRef.current) {
      const yTokens = doc.getArray('tokens');
      const boardRect = boardRef.current.getBoundingClientRect();
      const x = Math.random() * (boardRect.width - 50);
      const y = Math.random() * (boardRect.height - 50);
      yTokens.push([{ id: Date.now(), x, y, color: getRandomColor() }]);
    }
  }, [doc]);

  const handleToolClick = (tool) => {
    setActiveTool(tool);
    if (tool === 'add') {
      addToken();
    }
    if (tool !== 'city') {
      setPolygonPoints([]);
    }
  };

  const startDrawing = useCallback((e) => {
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setIsDrawing(true);
      setLastPoint({x, y});
      if (activeTool === 'spray') {
        draw(e);
      } else if (activeTool === 'road') {
        setRoadPoints([{x, y}]);
      } else if (activeTool === 'city') {
        addPolygonPoint(e);
      }
    }
  }, [activeTool]);

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
    if (activeTool === 'road') {
      drawSmoothRoad();
    }
    setRoadPoints([]);
  };

  const draw = useCallback((e) => {
    if (!isDrawing || !drawingRef.current) return;
    const ctx = drawingRef.current.getContext('2d');
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'spray') {
      for (let i = 0; i < 5; i++) {
        const randomX = x + (Math.random() - 0.5) * 40;
        const randomY = y + (Math.random() - 0.5) * 40;
        const size = Math.random() * 20 + 10; // Random size between 10 and 30
        const color = treeColors[Math.floor(Math.random() * treeColors.length)];

        ctx.save();
        ctx.translate(randomX, randomY);
        ctx.scale(size / 100, size / 100); // Scale the path to the desired size
        ctx.fillStyle = color;

        const path = new Path2D(treePathData);
        ctx.fill(path);

        ctx.restore();
      }
    } else if (activeTool === 'road') {
      setRoadPoints(prev => [...prev, {x, y}]);
      drawRoadPreview();
    }
  }, [isDrawing, activeTool]);

  const drawRoadPreview = () => {
    if (!roadLayerRef.current || roadPoints.length < 2) return;
    const ctx = roadLayerRef.current.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.beginPath();
    ctx.moveTo(roadPoints[0].x, roadPoints[0].y);
    for (let i = 1; i < roadPoints.length; i++) {
      ctx.lineTo(roadPoints[i].x, roadPoints[i].y);
    }
    ctx.strokeStyle = '#D3D3D3';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const drawSmoothRoad = () => {
    if (!roadLayerRef.current || roadPoints.length < 2) return;
    const ctx = roadLayerRef.current.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw the base road
    ctx.beginPath();
    ctx.moveTo(roadPoints[0].x, roadPoints[0].y);
    for (let i = 1; i < roadPoints.length - 2; i++) {
      const xc = (roadPoints[i].x + roadPoints[i + 1].x) / 2;
      const yc = (roadPoints[i].y + roadPoints[i + 1].y) / 2;
      ctx.quadraticCurveTo(roadPoints[i].x, roadPoints[i].y, xc, yc);
    }
    ctx.quadraticCurveTo(
      roadPoints[roadPoints.length - 2].x,
      roadPoints[roadPoints.length - 2].y,
      roadPoints[roadPoints.length - 1].x,
      roadPoints[roadPoints.length - 1].y
    );
    ctx.strokeStyle = '#D3D3D3';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Add variation to the road edges
    ctx.beginPath();
    ctx.moveTo(roadPoints[0].x, roadPoints[0].y);
    for (let i = 1; i < roadPoints.length - 2; i++) {
      const xc = (roadPoints[i].x + roadPoints[i + 1].x) / 2;
      const yc = (roadPoints[i].y + roadPoints[i + 1].y) / 2;
      ctx.quadraticCurveTo(roadPoints[i].x, roadPoints[i].y, xc, yc);
    }
    ctx.quadraticCurveTo(
      roadPoints[roadPoints.length - 2].x,
      roadPoints[roadPoints.length - 2].y,
      roadPoints[roadPoints.length - 1].x,
      roadPoints[roadPoints.length - 1].y
    );
    ctx.strokeStyle = 'rgba(169, 169, 169, 0.5)';
    ctx.lineWidth = 22;
    ctx.lineDash = [5, 10];
    ctx.lineDashOffset = Math.random() * 15;
    ctx.stroke();
  };

  const addPolygonPoint = useCallback((e) => {
    if (activeTool === 'city' && boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (polygonPoints.length > 2 && 
          Math.abs(x - polygonPoints[0].x) < 10 && 
          Math.abs(y - polygonPoints[0].y) < 10) {
        // Close the polygon
        setCityBlocks(prev => [...prev, [...polygonPoints]]);
        setPolygonPoints([]);
        drawCityBlocks();
      } else {
        setPolygonPoints(prev => [...prev, {x, y}]);
      }
    }
  }, [activeTool, polygonPoints]);

  const drawPolygonPreview = useCallback(() => {
    if (!cityLayerRef.current || polygonPoints.length < 1) return;
    const ctx = cityLayerRef.current.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw lines
    if (polygonPoints.length > 1) {
      ctx.beginPath();
      ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
      for (let i = 1; i < polygonPoints.length; i++) {
        ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
      }
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Draw points
    polygonPoints.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
    });
  }, [polygonPoints]);

  const drawCityBlocks = useCallback(() => {
    if (!cityLayerRef.current) return;
    const ctx = cityLayerRef.current.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    cityBlocks.forEach(block => {
      ctx.beginPath();
      ctx.moveTo(block[0].x, block[0].y);
      for (let i = 1; i < block.length; i++) {
        ctx.lineTo(block[i].x, block[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = '#e0e0e0';
      ctx.fill();

      // Draw building-like pattern
      const pattern = ctx.createPattern(createBuildingPattern(), 'repeat');
      ctx.fillStyle = pattern;
      ctx.fill();

      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Redraw the current polygon preview
    drawPolygonPreview();
  }, [cityBlocks, drawPolygonPreview]);

  const createBuildingPattern = () => {
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 50;
    patternCanvas.height = 50;
    const patternCtx = patternCanvas.getContext('2d');

    // Draw random "buildings"
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * 50;
      const y = Math.random() * 50;
      const width = Math.random() * 20 + 10;
      const height = Math.random() * 20 + 10;
      patternCtx.fillStyle = `rgba(${Math.random() * 100 + 100}, ${Math.random() * 100 + 100}, ${Math.random() * 100 + 100}, 0.7)`;
      patternCtx.fillRect(x, y, width, height);
    }

    return patternCanvas;
  };

  useEffect(() => {
    drawPolygonPreview();
    drawCityBlocks();
  }, [polygonPoints, cityBlocks, drawPolygonPreview, drawCityBlocks]);

  useEffect(() => {
    const board = boardRef.current;
    if (board) {
      board.addEventListener('mousedown', startDrawing);
      board.addEventListener('mousemove', draw);
      board.addEventListener('mouseup', stopDrawing);
      board.addEventListener('mouseleave', stopDrawing);
      board.addEventListener('click', addPolygonPoint);

      return () => {
        board.removeEventListener('mousedown', startDrawing);
        board.removeEventListener('mousemove', draw);
        board.removeEventListener('mouseup', stopDrawing);
        board.removeEventListener('mouseleave', stopDrawing);
        board.removeEventListener('click', addPolygonPoint);
      };
    }
  }, [startDrawing, draw, stopDrawing, addPolygonPoint]);

  return (
    <div ref={boardRef} className="board">
      <canvas ref={roadLayerRef} className="road-layer" />
      <canvas ref={cityLayerRef} className="city-layer" />
      <canvas ref={drawingRef} className="drawing-layer" />
      <div className="toolbar">
        <button className={`toolbar-button ${activeTool === 'pointer' ? 'active' : ''}`} onClick={() => handleToolClick('pointer')}><FaMousePointer /></button>
        <button className={`toolbar-button ${activeTool === 'add' ? 'active' : ''}`} onClick={() => handleToolClick('add')}><FaPlus /></button>
        <button className={`toolbar-button ${activeTool === 'spray' ? 'active' : ''}`} onClick={() => handleToolClick('spray')}><FaTree /></button>
        <button className={`toolbar-button ${activeTool === 'road' ? 'active' : ''}`} onClick={() => handleToolClick('road')}><FaRoad /></button>
        <button className={`toolbar-button ${activeTool === 'city' ? 'active' : ''}`} onClick={() => handleToolClick('city')}><FaCity /></button>
      </div>
      {tokens.map(token => (
        <Token key={token.id} id={token.id} x={token.x} y={token.y} color={token.color} doc={doc} boardRef={boardRef} />
      ))}
    </div>
  );
};

export default Board;