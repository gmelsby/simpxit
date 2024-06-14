import { PrismaClient } from '@prisma/client';
import { GameCard } from '../../types';
import prismaRandom from 'prisma-extension-random';

const prisma = new PrismaClient().$extends(prismaRandom());

export async function drawCards(count: number): Promise<GameCard[]>  {
  const newCards: {id: bigint, locator: string}[] = await prisma.card.findManyRandom(count,
    {
      select: { id: true, locator: true}
    }
  );
  return newCards.map(card => {
    return {
      ...card,
      id: card.id.toString(),
    };
  });
}

export async function retrieveCardInfo(cardId: bigint): Promise<GameCard | null> {
  const result = await prisma.card.findFirst({
    where: {
      id: {
        equals: cardId
      }
    },
  });

  if (result === null) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { episode_id, ...gameCardResult } = { 
    ...result,
    id: result.id.toString(), 
    timestamp: Number(result.timestamp),
  };
  return gameCardResult;
}