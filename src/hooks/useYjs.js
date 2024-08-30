import * as Y from 'yjs';
import { useEffect, useState, useCallback } from 'react';
import Peer from 'peerjs';

const useYjs = (initialRoomId = 'default-room') => {
  const [tokens, setTokens] = useState([]);
  const [doc, setDoc] = useState(null);
  const [roomId, setRoomId] = useState(initialRoomId);
  const [peer, setPeer] = useState(null);
  const [connections, setConnections] = useState([]);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const yTokens = ydoc.getArray('tokens');

    const newPeer = new Peer();
    setPeer(newPeer);

    newPeer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
      if (roomId === id) {
        setIsHost(true);
      } else {
        const conn = newPeer.connect(roomId);
        conn.on('open', () => {
          setConnections([conn]);
        });
      }
    });

    newPeer.on('connection', (conn) => {
      conn.on('open', () => {
        setConnections(prev => [...prev, conn]);
        // Send current state to new peer
        conn.send(Y.encodeStateAsUpdate(ydoc));
      });
    });

    const updateTokens = () => {
      setTokens(yTokens.toArray());
    };

    yTokens.observe(updateTokens);
    updateTokens();

    setDoc(ydoc);

    return () => {
      newPeer.destroy();
      ydoc.destroy();
    };
  }, [roomId]);

  useEffect(() => {
    if (!doc || !peer) return;

    const handleUpdate = (update, origin) => {
      if (origin !== peer) {
        connections.forEach(conn => conn.send(update));
      }
    };

    doc.on('update', handleUpdate);

    connections.forEach(conn => {
      conn.on('data', (data) => {
        Y.applyUpdate(doc, data);
      });
    });

    return () => {
      doc.off('update', handleUpdate);
    };
  }, [doc, peer, connections]);

  const addToken = useCallback((token) => {
    if (doc) {
      const yTokens = doc.getArray('tokens');
      yTokens.push([token]);
    }
  }, [doc]);

  return { tokens, addToken, setRoomId, roomId, isHost };
};

export default useYjs;