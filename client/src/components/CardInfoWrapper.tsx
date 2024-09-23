import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import CardInfoText from './CardInfoText';

export default function CardInfoWrapper({ cardId, load }: { cardId: string, load: boolean }) {
  // 'load' functions as a trigger for intial load. This helps enables lazy loading
  const [cardInfo, setCardInfo] = useState(undefined);
  const [recentlyLoaded, setRecentlyLoaded] = useState(false);

  const loadCardInfo = useCallback(async () => {
    const response = await fetch(`/api/cardinfo/${cardId}`);
    const data = await response.json();
    setCardInfo(data);
    setRecentlyLoaded(true);
    setTimeout(() => setRecentlyLoaded(false), 200);
  }, [cardId]);

  // only try to get card info if we don't already have it
  useEffect(() => {
    if (!cardInfo && load) {
      loadCardInfo();
    }
  }, [cardId, cardInfo, loadCardInfo, load]);

  return (
    <div className={recentlyLoaded ? 'opacity-0' : ''}>
      <CardInfoText cardInfo={cardInfo} />
    </div>
  );
}