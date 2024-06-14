import { PrismaClient, Card } from '@prisma/client';
import { GameCard } from '../../types';
import prismaRandom from 'prisma-extension-random';

const prisma = new PrismaClient().$extends(prismaRandom());

export async function drawCards(count: number): Promise<GameCard[]>  {
  const newCards: GameCard[] = await prisma.card.findManyRandom(count,
    {
      select: { id: true, locator: true}
    }
  );
  return newCards;
}

export async function retrieveCardInfo(cardId: bigint): Promise<Card | null> {
  const result = await prisma.card.findFirst({
    where: {
      id: {
        equals: cardId
      }
    }
  });

  return result;
}