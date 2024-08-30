import { useState, useEffect } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { getRandomColor } from '../utils/tokenUtils';

const useYjs = () => {
  const [tokens, setTokens] = useState([]);
  const [doc, setDoc] = useState(null);

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

  const addToken = () => {
    if (doc) {
      const yTokens = doc.getArray('tokens');
      const x = Math.random() * 500; // Adjust based on your board size
      const y = Math.random() * 500; // Adjust based on your board size
      yTokens.push([{ id: Date.now(), x, y, color: getRandomColor() }]);
    }
  };

  return { tokens, doc, addToken };
};

export default useYjs;