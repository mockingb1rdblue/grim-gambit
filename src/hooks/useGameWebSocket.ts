import { useEffect, useRef } from 'react';
import { useGameStore, GameState } from '../store/useGameStore';

/**
 * Validates the incoming message structure from the Durable Object.
 */
function isGameState(data: unknown): data is GameState {
  return (
    typeof data === 'object' &&
    data !== null &&
    'players' in data &&
    'score' in data
  );
}

export function useGameWebSocket(url: string) {
  const ws = useRef<WebSocket | null>(null);
  const syncState = useGameStore((state) => state.syncState);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as unknown;
        if (isGameState(data)) {
          syncState(data);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message', err);
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [url, syncState]);

  const sendMessage = (message: unknown) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return { sendMessage };
}