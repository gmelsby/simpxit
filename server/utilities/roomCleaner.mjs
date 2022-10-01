import cron from "node-cron";

const isExpired = (room, interval, timestamp) => {
  return room.lastModified + (interval * 60000) < timestamp || room.playerCount === 0;
}

/*
* Sets up a recurring job to clean up unused rooms
* rooms: Object mapping room key to Room object
* cronString: String to set cron job timing
* timeoutInterval: number (in minutes) of when to consider room timed out
*/
export default function roomCleaner(rooms, cronString, timeoutInterval) {
  cron.schedule(cronString, () => {
    console.log('running cleaner job');

    const currentTime = Date.now();
    for (const room of Object.keys(rooms).filter(k => isExpired(rooms[k], timeoutInterval, currentTime))) {
      console.log(`room ${room} is expired: ${(currentTime - rooms[room].lastModified) / 60000} minutes old`);

      rooms[room].teardownCards();
      delete rooms[room];

      console.log(`deleted room ${room}`);
    }
  });
}
