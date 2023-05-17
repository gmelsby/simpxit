// returns a filtered version of the Frinkiac response
export default function filterFrinkiac(data) {
  // processes pre-prepared properties
  const result = {
    episode: data.Episode.Key,
    timestamp: data.Frame.Timestamp,
    title: data.Episode.Title,
    director: data.Episode.Director,
    writer: data.Episode.Writer,
    airdate: data.Episode.OriginalAirDate
  };

  // processes and adds subtitles
  result.subtitles = data.Subtitles.map(sub => sub.Content);

  // processes and adds locator
  result.locator = `https://frinkiac.com/img/${result.episode}/${result.timestamp}.jpg`;

  return result;
}
