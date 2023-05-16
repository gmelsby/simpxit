import React from 'react';
import { Player } from '../../types';

export default function WaitingOn({ waitingOn }: { waitingOn: Player[] }) {
  return (
      <h5>Waiting on {waitingOn.map(p => p.playerName).join(", ")}</h5>
  );
}