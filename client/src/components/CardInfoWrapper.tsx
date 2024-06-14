import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import CardInfoText from './CardInfoText';
 
export default function CardInfoWrapper({cardId}: {cardId: string}) {

  const [cardInfo, setCardInfo] = useState(undefined);

  const loadCardInfo = useCallback(async () => {
    const response = await fetch(`/api/cardinfo/${cardId}`);
    const data = await response.json();
    setCardInfo(data);
  }, [cardId]);
    
  // only try to get card info if we don't already have it
  useEffect(() => {
    if (!cardInfo) {
      loadCardInfo();
    }
  }, [cardId, cardInfo, loadCardInfo]);

  return (<CardInfoText cardInfo={cardInfo} />);
}