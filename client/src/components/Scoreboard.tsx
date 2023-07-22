import React from 'react';
import PlayerList from './PlayerList';
import { Player } from '../../../types';

export default function Scoreboard({ players, userId, targetScore }: {players: Player[], userId: string, targetScore: number}) {

  return (
    <>
        <h6>Target Score: {targetScore}</h6>
        <PlayerList players={players} userId={userId} isScoreboard />
    </>
  );
}