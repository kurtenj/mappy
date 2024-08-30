import React, { useRef, useEffect, useState } from 'react';
import { Circle, Rect, Transformer } from 'react-konva';

const Token = ({ id, type, x, y, color, gridSize, doc, isSelected, onSelect, rotation, scaleX, scaleY }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const size = gridSize * 0.8;

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragStart = () => {
    setIsDragging(true);
    onSelect(id);
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    const newX = Math.round(e.target.x() / gridSize) * gridSize;
    const newY = Math.round(e.target.y() / gridSize) * gridSize;
    updateTokenInDoc(newX, newY);
    e.target.position({ x: newX, y: newY });
  };

  const handleTransform = () => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();
    updateTokenInDoc(node.x(), node.y(), rotation, scaleX, scaleY);
  };

  const updateTokenInDoc = (newX, newY, newRotation = rotation, newScaleX = scaleX, newScaleY = scaleY) => {
    if (doc) {
      const yTokens = doc.getArray('tokens');
      const index = yTokens.toArray().findIndex(t => t.id === id);
      if (index !== -1) {
        yTokens.delete(index, 1);
        yTokens.insert(index, [{
          id, type, x: newX, y: newY, color,
          rotation: newRotation, scaleX: newScaleX, scaleY: newScaleY
        }]);
      }
    }
  };

  const commonProps = {
    x,
    y,
    width: size,
    height: size,
    fill: color,
    rotation,
    scaleX,
    scaleY,
    shadowColor: 'black',
    shadowBlur: isDragging ? 10 : 0,
    shadowOpacity: isDragging ? 0.6 : 0,
    shadowOffsetX: isDragging ? 5 : 0,
    shadowOffsetY: isDragging ? 5 : 0,
    draggable: true,
    onClick: () => onSelect(id),
    onTap: () => onSelect(id),
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransform,
  };

  const Shape = type === 'circle' ? Circle : Rect;

  return (
    <>
      <Shape
        {...commonProps}
        ref={shapeRef}
        radius={type === 'circle' ? size / 2 : undefined}
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