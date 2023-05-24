import { CardInfo } from '../../types';

// returns a filtered version of the Frinkiac response
export function filterFrinkiac(data: { Episode: 
                                                {
                                                  Key: string,
                                                  Title: string,
                                                  Director: string,
                                                  Writer: string,
                                                  OriginalAirDate: string
                                                },
                                                Frame:
                                                {
                                                  Timestamp: number
                                                },
                                                Subtitles: []
                                              }): CardInfo {
  const result = {
    episode: data.Episode.Key,
    title: data.Episode.Title,
    director: data.Episode.Director,
    writer: data.Episode.Writer,
    airdate: data.Episode.OriginalAirDate,
    subtitles: data.Subtitles.map((sub: any) => sub.Content),
    locator: `https://frinkiac.com/img/${data.Episode.Key}/${data.Frame.Timestamp}.jpg`
  };

  return result;
}
