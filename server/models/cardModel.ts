import { PrismaClient } from '@prisma/client';
import { GameCard } from '../../types';
import prismaRandom from 'prisma-extension-random';

const prisma = new PrismaClient().$extends(prismaRandom());
const imageBucketUrl = process.env.IMAGE_BUCKET;

export async function drawCards(count: number): Promise<GameCard[]>  {
  const newCards: {id: bigint, locator: string}[] = await prisma.card.findManyRandom(count,
    {
      select: { id: true, locator: true}
    }
  );
  return newCards.map(card => {
    return {
      id: card.id.toString(),
      locator: `${imageBucketUrl}/${card.locator}`
    };
  });
}

// retrieves the card with passed in id if exists, oterwise returns null
export async function retrieveCardInfo(cardId: bigint): Promise<GameCard | null> {
  const result = await prisma.card.findFirst({
    where: {
      id: {
        equals: cardId
      }
    },
    include: {
      episode: true,
    },
  });

  if (result === null) {
    return null;
  }

  return {
    id: result.id.toString(),
    locator: `${imageBucketUrl}/${result.locator}`,
    subtitles: result.subtitles,
    episode_key: result.episode.key,
    season: result.episode.season_number,
    episode: result.episode.episode_number,
    title: result.episode.title,
    writer: result.episode.writer,
    director: result.episode.director,
    airdate: result.episode.airdate,
    frinkiacLink: result.frinkiac_link,
  };
}