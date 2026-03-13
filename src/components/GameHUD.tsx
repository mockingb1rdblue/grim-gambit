import React from 'react';
import { useGameStore } from '../store/useGameStore';

export const GameHUD: React.FC = () => {
  const players = useGameStore((state) => state.players);
  const score = useGameStore((state) => state.score);

  return (
    <div className="hud">
      <h1>Score: {score}</h1>
      <div className="players">
        {Object.values(players).map((player) => (
          <div key={player.id}>
            Player {player.id}: {player.x}, {player.y}
          </div>
        ))}
      </div>
    </div>
  );
};