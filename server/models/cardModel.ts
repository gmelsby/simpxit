import { Prisma, PrismaClient } from '@prisma/client';
import { GameCard } from '../../types';
import { logger } from '../app.js';
import rc from './redisClient.js';

const prisma = new PrismaClient();
const imageBucketUrl = process.env.IMAGE_BUCKET;

export async function drawCards(count: number, currentCardIds: string[]): Promise<GameCard[]>  {
  const newCards = currentCardIds.length ? 
    // case where we have currentCardIds with episodes we want to filter out
    await prisma.$queryRaw<{id: bigint, locator: string}[]>`
      SELECT DISTINCT ON (episode_id) id, locator FROM "Card"
      WHERE episode_id NOT IN 
      (
        SELECT episode_id FROM "Card"
        WHERE id IN (${Prisma.join(currentCardIds.map(cardId => parseInt(cardId)))})
      )
      ORDER BY episode_id, random()
      LIMIT ${count}
      OFFSET floor(random() * ((SELECT COUNT(DISTINCT episode_id) FROM "Card") - ${currentCardIds.length} - ${count} + 1))::int;
    ` 
    :
    // case where therer are no currentCardIds to worry about
    await prisma.$queryRaw<{id: bigint, locator: string}[]>`
      SELECT DISTINCT ON (episode_id) id, locator FROM "Card"
      ORDER BY episode_id, random()
      LIMIT ${count}
      OFFSET floor(random() * ((SELECT COUNT(DISTINCT episode_id) FROM "Card") - ${count} + 1))::int;
    `;

  return newCards.map(card => {
    return {
      id: card.id.toString(),
      locator: `${imageBucketUrl}/${card.locator}`
    };
  });
}

// retrieves the card with passed in id if exists, oterwise returns null
export async function retrieveCardInfo(cardId: bigint): Promise<GameCard | null> {
  // check if cached card is in redis
  const redisKey = `noderedis:card:${cardId}`;
  const redisResult = await rc.json.get(redisKey) as GameCard | null;
  if (redisResult !== null) {
    logger.verbose(`retrieved cached cardInfo for cardId ${cardId}`);
    return redisResult;
  }

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

  const gameCardResult: GameCard = {
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

  // cache result in redis
  await rc.json.set(redisKey, '$', gameCardResult, {
    NX: true
  });
  // set key to expire in 5 minutes
  await rc.expire(redisKey, 60 * 5);

  return gameCardResult;
}