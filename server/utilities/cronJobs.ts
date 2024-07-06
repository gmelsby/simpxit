import cron from 'node-cron';
import { drawCards } from '../models/cardModel.js';
import { logger } from '../app.js';


/*
* Sets up a recurring job to keep Supabase project alive
* cronString: String to set cron job timing
*/  
export function supabasePing(cronString: string) {
  cron.schedule(cronString, () => {
    drawCards(1, [])
      .then(cards => {
        logger.info(`keep-alive ping successful, drew card ${cards[0].id}`);
      })
      .catch(err => {
        logger.error(`something went wrong with keep-alive ping: ${err}`);
      });
  });
}
