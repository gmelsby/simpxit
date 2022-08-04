import { useState, useCallback, useEffect } from 'react';
import CardInfoText from "./CardInfoText";
 
export default function CardInfoWrapper({card}) {

  const [cardInfo, setCardInfo] = useState(false);

  const loadCardInfo = useCallback(async () => {
      const response = await fetch(`/cardinfo/${card.cardId}`);
      const data = await response.json();
      setCardInfo(data);
    }, [card]);
    
  useEffect(() => {
    if (card && !cardInfo) {
      loadCardInfo()
    }
  }, [card, cardInfo, loadCardInfo]);

  return (<CardInfoText cardInfo={cardInfo} />);
}