import { Spinner } from "react-bootstrap";

export default function CardInfoText({ cardInfo }) {
  // case where we cannot load or are waiting on loading card info
  if (!(cardInfo)) {
    return (
      <>
        <Spinner animation="border" />
        <p>Loading Card Info...</p>
      </>
    );
  }

  // each line of subtitles gets its own line
  const SubtitleDisplay = ({ subtitles }) => {
    return (
      <>
        {subtitles.map((subtitle, idx) =>
        <p key={idx}>{subtitle}</p>)}
      </>
    )
  };

  return (
    <>
      <p><b>Episode:</b> {cardInfo.Episode}: {cardInfo.Title}</p>
      <p><b>Subtitles:</b></p>
      <SubtitleDisplay subtitles={cardInfo.Subtitles} />
      <p><b>Writer:</b> {cardInfo.Writer}</p>
      <p><b>Director:</b> {cardInfo.Director}</p>
    </>
  );
}