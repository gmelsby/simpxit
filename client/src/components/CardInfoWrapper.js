import { useState, useCallback, useEffect } from 'react';
import CardInfoText from "./CardInfoText";
 
export default function CardInfoWrapper({card}) {

  const [cardInfo, setCardInfo] = useState(false);

  const loadCardInfo = useCallback(async () => {
      const response = await fetch(`https://greg-image-server.azurewebsites.net/cardinfo/${card.cardId}`);
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