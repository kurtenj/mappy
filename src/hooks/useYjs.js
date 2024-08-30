import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useEffect, useState, useCallback } from 'react';

const useYjs = (initialRoomId = 'default-room') => {
  const [tokens, setTokens] = useState([]);
  const [doc, setDoc] = useState(null);
  const [roomId, setRoomId] = useState(initialRoomId);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const wsProvider = new WebsocketProvider('ws://localhost:1234', roomId, ydoc);
    const yTokens = ydoc.getArray('tokens');

    const updateTokens = () => {
      setTokens(yTokens.toArray().map(token => ({
        ...token,
        rotation: token.rotation || 0,
        scaleX: token.scaleX || 1,
        scaleY: token.scaleY || 1
      })));
    };

    yTokens.observe(updateTokens);
    updateTokens();

    setDoc(ydoc);
    setProvider(wsProvider);

    return () => {
      wsProvider.disconnect();
      ydoc.destroy();
    };
  }, [roomId]);

  const addToken = useCallback((token) => {
    if (doc) {
      const yTokens = doc.getArray('tokens');
      yTokens.push([{
        ...token,
        rotation: 0,
        scaleX: 1,
        scaleY: 1
      }]);
    }
  }, [doc]);

  return { tokens, addToken, setRoomId, roomId, doc };
};

export default useYjs;