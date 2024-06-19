import React from 'react';
import { Player } from '../../../types';

export default function WaitingOn({ waitingOn }: { waitingOn: Player[] }) {
  // if no players are in waitingOn
  if (!waitingOn.length) {
    return (<></>);
  }

  return (
    <h5>
      Waiting on {
        // number of players is listed if it's greater than one
        waitingOn.length > 1 ?
          `${waitingOn.length} Players` :
          // player name is listed if there is just one player
          waitingOn[0].playerName
      }
    </h5>
  );
}