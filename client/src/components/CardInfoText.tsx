import React from 'react';
import { Spinner } from 'react-bootstrap';
import { CardInfo } from '../../../types';



export default function CardInfoText({ cardInfo }: { cardInfo: CardInfo | undefined }) {
  // case where we cannot load or are waiting on loading card info
  if (cardInfo === undefined) {
    return (
      <>
        <Spinner animation="border" />
        <p>Loading Card Info...</p>
      </>
    );
  }

  // each line of subtitles gets its own line
  const SubtitleDisplay = ({ subtitles }: { subtitles: string[] }) => {
    return (
      <>
        {subtitles.map((subtitle, idx) =>
          <p key={idx}>{subtitle}</p>)}
      </>
    );
  };

  return (
    <>
      <p><b>Title:</b> {cardInfo.title}</p>
      <p>
        <b>Season:</b> {cardInfo.season}
        <b> Episode:</b> {cardInfo.episode}
      </p>
      <p><b>Subtitles:</b></p>
      <SubtitleDisplay subtitles={cardInfo.subtitles} />
      <p><b>Writer:</b> {cardInfo.writer}</p>
      <p><b>Director:</b> {cardInfo.director}</p>
      <p><b>Air Date:</b> {cardInfo.airdate}</p>
      {cardInfo.frinkiacLink !== null &&
        <p>
          <a href={cardInfo.frinkiacLink}
            target="_blank" rel="noopener noreferrer">
            View on Frinkiac
          </a>
        </p>
      }
    </>
  );
}