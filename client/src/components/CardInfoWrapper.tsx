import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import CardInfoText from './CardInfoText';
import { GameCard } from '../../../types';
 
export default function CardInfoWrapper({card}: {card: GameCard}) {

  const [cardInfo, setCardInfo] = useState(undefined);

  const loadCardInfo = useCallback(async () => {
    const response = await fetch(`/api/cardinfo/${card.id}`);
    const data = await response.json();
    setCardInfo(data);
  }, [card]);
    
  // only try to get card info if we don't already have it
  useEffect(() => {
    if (card && !cardInfo) {
      loadCardInfo();
    }
  }, [card, cardInfo, loadCardInfo]);

  return (<CardInfoText cardInfo={cardInfo} />);
}