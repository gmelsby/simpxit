// returns a filtered version of the Frinkiac response
export default function filterFrinkiac(data) {
  // processes pre-prepared properties
  const result = {
    Episode: data.Episode.Key,
    Timestamp: data.Frame.Timestamp,
    Title: data.Episode.Title,
    Director: data.Episode.Director,
    Writer: data.Episode.Writer,
    Airdate: data.Episode.Airdate
  };

  // processes and adds subtitles
  result.Subtitles = data.Subtitles.map(sub => sub.Content);

  // processes and adds locator
  result.Locator = `https://frinkiac.com/img/${result.Episode}/${result.Timestamp}.jpg`;

  return result;
}
