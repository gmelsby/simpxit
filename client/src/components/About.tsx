import React from 'react';

export default function About() {
  return <>
    <p>
      Simpxit is a fan-made game that enables users to play the board game&nbsp;
      <a href="https://boardgamegeek.com/boardgame/39856/dixit"
        target="_blank" rel="noopener noreferrer">
        Dixit
      </a>
      &nbsp;with screencaps of&nbsp;
      <a href="https://www.disneyplus.com/series/the-simpsons/3ZoBZ52QHb4x"
        target="_blank"
        rel="noopener noreferrer">
        The Simpsons
      </a>
      &nbsp;as cards.
    </p>
    <p>
      <p>Screencaps, episode information, and subtitles were obtained via&nbsp;
        <a href="https://frinkiac.com/"
          target="_blank"
          rel="noopener noreferrer">
          Frinkiac&apos;s
        </a>
        &nbsp;API.
      </p>
    </p>
    <p>
      There are over 20,000 possible cards, and each card added to a game is randomly chosen with measures taken to avoid duplicates.
    </p>
    <p>
      I do not own and have no relation to the holders of any intellectual property related to <em>The Simpsons</em>, <em>Dixit</em>, or <em>Frinkiac</em>.
    </p>
  </>;
}