import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import CardInfoText from "./CardInfoText";
import { Card } from "../../types"
 
export default function CardInfoWrapper({card}: {card: Card}) {

  const [cardInfo, setCardInfo] = useState(undefined);

  const loadCardInfo = useCallback(async () => {
      const response = await fetch(`/cardinfo/${card.cardId}`);
      const data = await response.json();
      setCardInfo(data);
    }, [card]);
    
  // only try to get card info if we don't already have it
  useEffect(() => {
    if (card && !cardInfo) {
      loadCardInfo()
    }
  }, [card, cardInfo, loadCardInfo]);

  return (<CardInfoText cardInfo={cardInfo} />);
}