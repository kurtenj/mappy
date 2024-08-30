import React, { useRef, useEffect, useState } from 'react';
import { Circle, Transformer } from 'react-konva';

const Token = ({ id, x, y, color, doc, gridSize, isSelected, onSelect, size: initialSize, rotation: initialRotation }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [size, setSize] = useState(initialSize || gridSize);
  const [rotation, setRotation] = useState(initialRotation || 0);

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  useEffect(() => {
    const yTokens = doc.getArray('tokens');
    const updateToken = () => {
      const token = yTokens.toArray().find(t => t.id === id);
      if (token && shapeRef.current) {
        shapeRef.current.x(token.x);
        shapeRef.current.y(token.y);
        setSize(token.size || gridSize);
        setRotation(token.rotation || 0);
      }
    };

    yTokens.observe(updateToken);
    return () => yTokens.unobserve(updateToken);
  }, [doc, id, gridSize]);

  const handleTransformEnd = (e) => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale and adjust size
    node.scaleX(1);
    node.scaleY(1);
    const newSize = Math.max(size * scaleX, size * scaleY);
    setSize(newSize);
    setRotation(node.rotation());

    updateYjsToken(node.x(), node.y(), newSize, node.rotation());
  };

  const handleDragEnd = (e) => {
    updateYjsToken(e.target.x(), e.target.y(), size, rotation);
  };

  const updateYjsToken = (x, y, size, rotation) => {
    const yTokens = doc.getArray('tokens');
    const tokenIndex = yTokens.toArray().findIndex(t => t.id === id);
    if (tokenIndex !== -1) {
      yTokens.delete(tokenIndex, 1);
      yTokens.insert(tokenIndex, [{
        id,
        x,
        y,
        color,
        size,
        rotation
      }]);
    }
  };

  return (
    <>
      <Circle
        ref={shapeRef}
        x={x}
        y={y}
        radius={size / 2}
        fill={color}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        rotation={rotation}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default Token;