import cron from 'node-cron';
import { Room  } from '../models/gameClasses.js';
import { drawCards } from '../models/cardModel.js';

const isExpired = (room: Room, interval: number, timestamp: number) => {
  return room.lastModified + (interval * 60000) < timestamp || room.playerCount === 0;
};

/*
* Sets up a recurring job to clean up unused rooms
* rooms: Object mapping room key to Room object
* cronString: String to set cron job timing
* timeoutInterval: number (in minutes) of when to consider room timed out
*/
export function roomCleaner(rooms: {[key: string]: Room}, cronString: string, timeoutInterval: number) {
  cron.schedule(cronString, () => {
    console.log('running cleaner job');

    const currentTime = Date.now();
    for (const room of Object.keys(rooms).filter(k => isExpired(rooms[k], timeoutInterval, currentTime))) {
      console.log(`room ${room} is expired: ${(currentTime - rooms[room].lastModified) / 60000} minutes old`);

      delete rooms[room];

      console.log(`deleted room ${room}`);
    }
  });
}

/*
* Sets up a recurring job to keep Supabase project alive
* cronString: String to set cron job timing
*/  
export function supabasePing(cronString: string) {
  cron.schedule(cronString, () => {
    drawCards(1, [])
      .then(cards => {
        console.log(`keep-alive ping successful, drew card ${cards[0].id}`);
      })
      .catch(err => {
        console.error(`something went wrong with keep-alive ping: ${err}`);
      });
  });
}
